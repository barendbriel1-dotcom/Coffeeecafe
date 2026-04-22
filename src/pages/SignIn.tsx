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

interface AssetReturn {
  id: string;
  code: string;
  name: string;
  holder_name: string | null;
  signout_item_id: string | null;
  signout_id: string | null;
  package_name: string | null;
  notes: string | null;
  created_at: string | null;
  to_dept: string | null;
}

interface GroupedSignOut {
  id: string;
  package_name: string;
  signed_out_to: string;
  department: string;
  created_at: string;
  notes: string | null;
  items: AssetReturn[];
}

export default function SignIn() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [grouped, setGrouped] = useState<GroupedSignOut[]>([]);
  const [orphaned, setOrphaned] = useState<AssetReturn[]>([]);

  // Damage reporting state
  const [damageItem, setDamageItem] = useState<AssetReturn | null>(null);
  const [damageNotes, setDamageNotes] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      // 1. Fetch all assets currently marked as 'signed_out'
      const { data: assets, error: assetErr } = await supabase
        .from("assets")
        .select(`
          id, code, name, status, current_holder,
          signout_items(
            id, returned, signout_id,
            signout:signouts(
              id, created_at, package_name, notes, signed_out_to,
              to_department:departments(name)
            )
          )
        `)
        .eq("status", "signed_out");

      if (assetErr) throw assetErr;

      // 2. Extract unique user IDs to fetch profiles manually (avoids relationship cache issues)
      const userIds = new Set<string>();
      (assets || []).forEach(a => {
        if (a.current_holder) userIds.add(a.current_holder);
        a.signout_items?.forEach((si: any) => {
          if (si.signout?.signed_out_to) userIds.add(si.signout.signed_out_to);
        });
      });

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", Array.from(userIds));

      const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p.display_name]));

      const returns: AssetReturn[] = (assets || []).map(a => {
        // Find the active (not returned) signout record for this asset
        const activeItem = a.signout_items?.find((si: any) => !si.returned);
        const so = activeItem?.signout;

        return {
          id: a.id,
          code: a.code,
          name: a.name,
          holder_name: profileMap[a.current_holder || ""] || profileMap[so?.signed_out_to || ""] || "Unknown Operative",
          signout_item_id: activeItem?.id || null,
          signout_id: so?.id || null,
          package_name: so?.package_name || null,
          notes: so?.notes || null,
          created_at: so?.created_at || null,
          to_dept: (so as any)?.to_department?.name || null
        };
      });

      // 3. Group items by sign-out record
      const groupMap = new Map<string, GroupedSignOut>();
      const orphans: AssetReturn[] = [];

      returns.forEach(r => {
        if (r.signout_id) {
          if (!groupMap.has(r.signout_id)) {
            groupMap.set(r.signout_id, {
              id: r.signout_id,
              package_name: r.package_name || "Standard Sign-Out",
              signed_out_to: r.holder_name || "Unknown",
              department: r.to_dept || "—",
              created_at: r.created_at || "",
              notes: r.notes,
              items: []
            });
          }
          groupMap.get(r.signout_id)!.items.push(r);
        } else {
          orphans.push(r);
        }
      });

      setGrouped(Array.from(groupMap.values()).sort((a, b) => b.created_at.localeCompare(a.created_at)));
      setOrphaned(orphans);

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const processReturn = async (item: AssetReturn, isDamaged: boolean, notes?: string) => {
    setProcessing(item.id);
    try {
      // 1. Update asset status
      const { error: assetErr } = await supabase
        .from("assets")
        .update({ 
          status: isDamaged ? "retired" : "available", 
          current_holder: null 
        })
        .eq("id", item.id);
      if (assetErr) throw assetErr;

      // 2. If part of a signout record, mark item as returned
      if (item.signout_item_id) {
        const { error: itemErr } = await supabase
          .from("signout_items")
          .update({ returned: true })
          .eq("id", item.signout_item_id);
        if (itemErr) throw itemErr;

        // 3. Check if we should close the parent signout record
        if (item.signout_id) {
          const { data: remaining } = await supabase
            .from("signout_items")
            .select("id")
            .eq("signout_id", item.signout_id)
            .eq("returned", false);
          
          if (!remaining || remaining.length === 0) {
            await supabase
              .from("signouts")
              .update({ 
                status: "returned", 
                signed_in_at: new Date().toISOString(),
                signed_in_by: user?.id
              })
              .eq("id", item.signout_id);
          }
        }
      }

      // 4. Log history
      await supabase.from("asset_history").insert({
        asset_id: item.id,
        action: isDamaged ? "damaged" : "signed_in",
        performed_by: user?.id,
        notes: notes || (isDamaged ? "Marked as DAMAGED during return." : "Standard return.")
      });

      toast.success(`${item.code} signed in ${isDamaged ? "as DAMAGED" : "successfully"}`);
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to process return");
    } finally {
      setProcessing(null);
      setDamageItem(null);
      setDamageNotes("");
    }
  };

  const handleReturnAll = async (group: GroupedSignOut) => {
    if (!confirm(`Sign in all ${group.items.length} items as AVAILABLE?`)) return;
    setProcessing(group.id);
    try {
      for (const item of group.items) {
        await processReturn(item, false);
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

      <div className="grid gap-6">
        {loading ? (
          <div className="py-12 text-center font-mono text-sm text-primary/70 animate-pulse">// SCANNING SIGNED-OUT INVENTORY...</div>
        ) : grouped.length === 0 && orphaned.length === 0 ? (
          <div className="py-12 text-center font-mono text-sm text-muted-foreground/70 border border-dashed border-primary/20 rounded">// NO SIGNED-OUT ITEMS DETECTED</div>
        ) : (
          <>
            {/* Grouped Sign-Out Packages */}
            {grouped.map((group) => (
              <Card key={group.id} className="bg-card/40 border-primary/30 p-5 space-y-4 hover:border-primary/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <LogIn size={18} className="text-primary" />
                      <h3 className="font-display text-primary text-lg glow-soft">
                        {group.package_name}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><User size={12} /> {group.signed_out_to}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={12} /> {group.department}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(group.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleReturnAll(group)} 
                    disabled={!!processing}
                    variant="outline"
                    className="border-primary/40 text-primary hover:bg-primary/10 font-mono text-[10px] uppercase tracking-widest h-8"
                  >
                    Sign In All
                  </Button>
                </div>

                <div className="pt-3 border-t border-primary/10">
                  <div className="grid gap-2">
                    {group.items.map((item) => (
                      <ItemRow 
                        key={item.id} 
                        item={item} 
                        processing={!!processing} 
                        onReturn={(damaged) => damaged ? setDamageItem(item) : processReturn(item, false)} 
                      />
                    ))}
                  </div>
                </div>

                {group.notes && (
                  <div className="bg-background/40 p-3 rounded border border-primary/5 text-xs text-muted-foreground italic font-mono">
                    &gt; Notes: {group.notes}
                  </div>
                )}
              </Card>
            ))}

            {/* Individual / Orphaned Items */}
            {orphaned.length > 0 && (
              <Card className="bg-card/40 border-rose-500/20 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-rose-400" />
                  <h3 className="font-display text-rose-400 text-lg uppercase tracking-tight">
                    Individual Asset Returns
                  </h3>
                </div>
                <div className="grid gap-2">
                  {orphaned.map((item) => (
                    <ItemRow 
                      key={item.id} 
                      item={item} 
                      processing={!!processing} 
                      onReturn={(damaged) => damaged ? setDamageItem(item) : processReturn(item, false)} 
                    />
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      <Dialog open={!!damageItem} onOpenChange={(o) => !o && setDamageItem(null)}>
        <DialogContent className="bg-card border-primary/40">
          <DialogHeader>
            <DialogTitle className="font-display text-red-400 flex items-center gap-2">
              <XCircle size={20} /> Report Damage: {damageItem?.code}
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
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDamageItem(null)} className="font-mono text-xs uppercase tracking-widest">Cancel</Button>
            <Button 
              onClick={() => damageItem && processReturn(damageItem, true, damageNotes)}
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

function ItemRow({ item, processing, onReturn }: { item: AssetReturn, processing: boolean, onReturn: (damaged: boolean) => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-3 py-2 bg-primary/5 border border-primary/10 rounded group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Package size={14} className="text-primary/60 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-mono text-primary truncate">{item.code}</div>
          <div className="text-[10px] text-foreground/80 truncate">{item.name}</div>
        </div>
        <div className="hidden sm:block text-[9px] font-mono text-muted-foreground uppercase tracking-tighter">
          Held by: {item.holder_name}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          disabled={processing}
          onClick={() => onReturn(false)}
          className="bg-primary/20 text-primary border border-primary/40 hover:bg-primary/40 h-7 px-3 text-[10px] font-mono uppercase tracking-widest"
        >
          <Check size={12} className="mr-1" /> Available
        </Button>
        <Button
          size="sm"
          disabled={processing}
          onClick={() => onReturn(true)}
          className="bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 h-7 px-3 text-[10px] font-mono uppercase tracking-widest"
        >
          <AlertCircle size={12} className="mr-1" /> Damaged
        </Button>
      </div>
    </div>
  );
}
