import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LogIn, Package, User, Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignOutItem {
  id: string;
  returned: boolean;
  asset: {
    id: string;
    code: string;
    name: string;
  };
}

interface ActiveSignOut {
  id: string;
  created_at: string;
  package_name: string | null;
  notes: string | null;
  expected_return: string | null;
  signed_out_to_profile: { display_name: string } | null;
  to_department: { name: string } | null;
  items: SignOutItem[];
}

export default function SignIn() {
  const { user, isAdmin } = useAuth();
  const [activeSignouts, setActiveSignouts] = useState<ActiveSignOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    // Fetch active signouts with profiles, departments, and items
    const { data, error } = await supabase
      .from("signouts")
      .select(`
        id, created_at, package_name, notes, expected_return,
        signed_out_to_profile:profiles!signouts_signed_out_to_fkey(display_name),
        to_department:departments!signouts_to_department_id_fkey(name),
        items:signout_items(
          id, returned,
          asset:assets(id, code, name)
        )
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load active sign-outs");
    } else {
      setActiveSignouts((data as any) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleReturn = async (signout: ActiveSignOut) => {
    if (!isAdmin) return;
    setProcessing(signout.id);
    try {
      const assetIds = signout.items.map(i => i.asset.id);
      const signoutItemIds = signout.items.map(i => i.id);

      // 1. Update assets to available
      const { error: assetErr } = await supabase
        .from("assets")
        .update({ 
          status: "available", 
          current_holder: null 
        })
        .in("id", assetIds);
      if (assetErr) throw assetErr;

      // 2. Mark signout items as returned
      const { error: itemsErr } = await supabase
        .from("signout_items")
        .update({ returned: true })
        .in("id", signoutItemIds);
      if (itemsErr) throw itemsErr;

      // 3. Close the signout record
      const { error: soErr } = await supabase
        .from("signouts")
        .update({ 
          status: "returned", 
          signed_in_at: new Date().toISOString(),
          signed_in_by: user?.id
        })
        .eq("id", signout.id);
      if (soErr) throw soErr;

      // 4. Log history for each asset
      await supabase.from("asset_history").insert(assetIds.map(asset_id => ({
        asset_id,
        action: "signed_in",
        performed_by: user?.id,
        notes: `Returned from sign-out package: ${signout.package_name || "General"}`
      })));

      toast.success("Assets signed back in successfully");
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in assets");
    } finally {
      setProcessing(null);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-primary glow flex items-center gap-2">
            <span className="text-primary/60">$</span> ASSET SIGN-IN
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-1 uppercase tracking-wider">
            // process returned equipment
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="py-12 text-center font-mono text-sm text-primary/70 animate-pulse">// SCANNING ACTIVE SIGN-OUTS...</div>
        ) : activeSignouts.length === 0 ? (
          <div className="py-12 text-center font-mono text-sm text-muted-foreground/70 border border-dashed border-primary/20 rounded">// NO ACTIVE SIGN-OUTS FOUND</div>
        ) : (
          activeSignouts.map((so) => (
            <Card key={so.id} className="bg-card/40 border-primary/30 p-5 space-y-4 hover:border-primary/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <LogIn size={18} className="text-primary" />
                    <h3 className="font-display text-primary text-lg glow-soft">
                      {so.package_name || "Standard Sign-Out"}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><User size={12} /> {so.signed_out_to_profile?.display_name}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={12} /> {so.to_department?.name || "—"}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(so.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button 
                  onClick={() => handleReturn(so)} 
                  disabled={processing === so.id}
                  className="bg-primary text-primary-foreground font-display uppercase tracking-widest text-xs h-10 px-6 box-glow-soft"
                >
                  {processing === so.id ? "Processing..." : "▸ Sign In Items"}
                </Button>
              </div>

              <div className="pt-3 border-t border-primary/10">
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 px-1">// items in package</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {so.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/10 rounded">
                      <Package size={14} className="text-primary/60" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono text-primary truncate">{item.asset.code}</div>
                        <div className="text-[10px] text-foreground/80 truncate">{item.asset.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {so.notes && (
                <div className="bg-background/40 p-3 rounded border border-primary/5 text-xs text-muted-foreground italic font-mono">
                  &gt; Notes: {so.notes}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
