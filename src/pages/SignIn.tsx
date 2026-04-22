import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { LogIn, Package, User, Calendar, MapPin, Check, AlertCircle, XCircle } from "lucide-react";
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

  // Damage reporting state
  const [damageItem, setDamageItem] = useState<{soId: string, item: SignOutItem} | null>(null);
  const [damageNotes, setDamageNotes] = useState("");

  const load = async () => {
    setLoading(true);
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
      // Filter out items that are already returned
      const formatted = (data as any ?? []).map((so: any) => ({
        ...so,
        items: so.items.filter((i: any) => !i.returned)
      })).filter((so: any) => so.items.length > 0);
      
      setActiveSignouts(formatted);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const processReturn = async (soId: string, item: SignOutItem, isDamaged: boolean, notes?: string) => {
    setProcessing(item.id);
    try {
      // 1. Update asset status
      const { error: assetErr } = await supabase
        .from("assets")
        .update({ 
          status: isDamaged ? "retired" : "available", 
          current_holder: null 
        })
        .eq("id", item.asset.id);
      if (assetErr) throw assetErr;

      // 2. Mark signout item as returned
      const { error: itemErr } = await supabase
        .from("signout_items")
        .update({ returned: true })
        .eq("id", item.id);
      if (itemErr) throw itemErr;

      // 3. Log history
      await supabase.from("asset_history").insert({
        asset_id: item.asset.id,
        action: isDamaged ? "damaged" : "signed_in",
        performed_by: user?.id,
        notes: notes || (isDamaged ? "Marked as DAMAGED during return." : "Standard return.")
      });

      // 4. Check if all items in this signout are now returned
      const currentSO = activeSignouts.find(s => s.id === soId);
      if (currentSO && currentSO.items.length === 1) {
        // This was the last pending item
        await supabase
          .from("signouts")
          .update({ 
            status: "returned", 
            signed_in_at: new Date().toISOString(),
            signed_in_by: user?.id
          })
          .eq("id", soId);
      }

      toast.success(`${item.asset.code} signed in ${isDamaged ? "as DAMAGED" : "successfully"}`);
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to process return");
    } finally {
      setProcessing(null);
      setDamageItem(null);
      setDamageNotes("");
    }
  };

  const handleReturnAll = async (signout: ActiveSignOut) => {
    if (!confirm(`Sign in all ${signout.items.length} items as AVAILABLE?`)) return;
    setProcessing(signout.id);
    try {
      for (const item of signout.items) {
        await processReturn(signout.id, item, false);
      }
    } catch (err: any) {
      toast.error("Bulk process interrupted");
    } finally {
      setProcessing(null);
      load();
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
                  onClick={() => handleReturnAll(so)} 
                  disabled={!!processing}
                  variant="outline"
                  className="border-primary/40 text-primary hover:bg-primary/10 font-mono text-[10px] uppercase tracking-widest h-8"
                >
                  Sign In All as Available
                </Button>
              </div>

              <div className="pt-3 border-t border-primary/10">
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 px-1">// items to process</div>
                <div className="grid gap-2">
                  {so.items.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-3 py-2 bg-primary/5 border border-primary/10 rounded group">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Package size={14} className="text-primary/60 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-mono text-primary truncate">{item.asset.code}</div>
                          <div className="text-[10px] text-foreground/80 truncate">{item.asset.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          disabled={!!processing}
                          onClick={() => processReturn(so.id, item, false)}
                          className="bg-primary/20 text-primary border border-primary/40 hover:bg-primary/40 h-7 px-3 text-[10px] font-mono uppercase tracking-widest"
                        >
                          <Check size={12} className="mr-1" /> Available
                        </Button>
                        <Button
                          size="sm"
                          disabled={!!processing}
                          onClick={() => setDamageItem({soId: so.id, item})}
                          className="bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 h-7 px-3 text-[10px] font-mono uppercase tracking-widest"
                        >
                          <AlertCircle size={12} className="mr-1" /> Damaged
                        </Button>
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

      <Dialog open={!!damageItem} onOpenChange={(o) => !o && setDamageItem(null)}>
        <DialogContent className="bg-card border-primary/40">
          <DialogHeader>
            <DialogTitle className="font-display text-red-400 flex items-center gap-2">
              <XCircle size={20} /> Report Damage: {damageItem?.item.asset.code}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Damage Details / Incident Summary</Label>
              <Textarea 
                value={damageNotes}
                onChange={(e) => setDamageNotes(e.target.value)}
                placeholder="Describe the damage or incident..."
                className="min-h-[120px] font-mono text-sm border-primary/20 focus:border-red-500/50"
              />
            </div>
            <p className="text-[10px] text-muted-foreground italic font-mono">
              // This item will be marked as "DAMAGED" and moved out of circulation.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDamageItem(null)} className="font-mono text-xs uppercase tracking-widest">Cancel</Button>
            <Button 
              onClick={() => damageItem && processReturn(damageItem.soId, damageItem.item, true, damageNotes)}
              className="bg-red-500 text-white hover:bg-red-600 font-mono text-xs uppercase tracking-widest px-6"
            >
              Confirm Damage Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
