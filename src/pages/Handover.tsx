import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

interface Asset { id: string; code: string; name: string; }
interface Profile { id: string; display_name: string; }
interface Handover {
  id: string; from_user: string; to_user: string; status: string;
  notes: string | null; created_at: string;
  handover_items: { asset_id: string; assets: { code: string; name: string } }[];
}

export default function Handover() {
  const { user, isStaff } = useAuth();
  const [myAssets, setMyAssets] = useState<Asset[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileMap, setProfileMap] = useState<Record<string, string>>({});
  const [toUser, setToUser] = useState("");
  const [notes, setNotes] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [incoming, setIncoming] = useState<Handover[]>([]);
  const [outgoing, setOutgoing] = useState<Handover[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!user) return;
    const [{ data: a }, { data: p }, { data: inc }, { data: out }] = await Promise.all([
      supabase.from("assets").select("id, code, name").eq("current_holder", user.id).eq("status", "signed_out"),
      supabase.from("profiles").select("id, display_name").neq("id", user.id).order("display_name"),
      supabase.from("handovers").select("*, handover_items(asset_id, assets(code, name))").eq("to_user", user.id).eq("status", "pending"),
      supabase.from("handovers").select("*, handover_items(asset_id, assets(code, name))").eq("from_user", user.id).order("created_at", { ascending: false }).limit(20),
    ]);
    setMyAssets(a ?? []);
    setProfiles(p ?? []);
    const all = await supabase.from("profiles").select("id, display_name");
    setProfileMap(Object.fromEntries((all.data ?? []).map((x) => [x.id, x.display_name])));
    setIncoming((inc ?? []) as any);
    setOutgoing((out ?? []) as any);
  };
  useEffect(() => { load(); }, [user]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const initiate = async () => {
    if (!isStaff) { toast.error("Staff or Admin required"); return; }
    if (!toUser || selected.size === 0) { toast.error("Select recipient and at least one asset"); return; }
    setBusy(true);
    try {
      const { data: h, error } = await supabase.from("handovers").insert({
        from_user: user!.id, to_user: toUser, notes: notes || null,
      }).select("id").single();
      if (error) throw error;
      const ids = [...selected];
      const { error: ie } = await supabase.from("handover_items").insert(ids.map((asset_id) => ({ handover_id: h.id, asset_id })));
      if (ie) throw ie;
      await supabase.from("assets").update({ status: "in_handover" }).in("id", ids);
      toast.success("Handover initiated — awaiting recipient confirmation");
      setSelected(new Set()); setToUser(""); setNotes("");
      load();
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
    finally { setBusy(false); }
  };

  const respond = async (h: Handover, accept: boolean) => {
    try {
      const ids = h.handover_items.map((i) => i.asset_id);
      const { error } = await supabase.from("handovers").update({
        status: accept ? "accepted" : "rejected",
        responded_at: new Date().toISOString(),
      }).eq("id", h.id);
      if (error) throw error;

      if (accept) {
        await supabase.from("assets").update({
          status: "signed_out", current_holder: user!.id,
        }).in("id", ids);
        await supabase.from("asset_history").insert(ids.map((asset_id) => ({
          asset_id, action: "handover_accepted", performed_by: user!.id, from_user: h.from_user, to_user: user!.id,
        })));
      } else {
        await supabase.from("assets").update({ status: "signed_out" }).in("id", ids);
      }
      toast.success(accept ? "Assets received" : "Handover rejected");
      load();
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl text-primary glow">// Handovers</h1>

      {incoming.length > 0 && (
        <Card className="bg-card/50 border-yellow-500/40 p-4 space-y-3 box-glow-soft">
          <h2 className="font-display text-yellow-400 text-sm uppercase">▸ Incoming — awaiting your confirmation</h2>
          {incoming.map((h) => (
            <div key={h.id} className="rounded border border-yellow-500/30 p-3 space-y-2">
              <div className="text-sm">From <span className="text-primary">{profileMap[h.from_user]}</span></div>
              <div className="flex flex-wrap gap-1">
                {h.handover_items.map((it) => (
                  <Badge key={it.asset_id} variant="outline" className="border-primary/40 text-primary font-mono">
                    {it.assets?.code} {it.assets?.name}
                  </Badge>
                ))}
              </div>
              {h.notes && <div className="text-xs text-muted-foreground">{h.notes}</div>}
              <div className="flex gap-2">
                <Button size="sm" onClick={() => respond(h, true)} className="bg-primary text-primary-foreground"><Check size={14} className="mr-1" />Accept</Button>
                <Button size="sm" variant="outline" onClick={() => respond(h, false)} className="border-destructive text-destructive"><X size={14} className="mr-1" />Reject</Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {isStaff && (
        <Card className="bg-card/40 border-primary/30 p-4 space-y-3">
          <h2 className="font-display text-primary text-sm uppercase">Initiate Handover</h2>
          {myAssets.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center font-mono">// you currently hold no assets</div>
          ) : (
            <>
              <div>
                <Label>Hand over to</Label>
                <Select value={toUser} onValueChange={setToUser}>
                  <SelectTrigger><SelectValue placeholder="Choose user" /></SelectTrigger>
                  <SelectContent>{profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between mb-2">
                <Label>Assets currently held by you</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => {
                    if (selected.size === myAssets.length) {
                      setSelected(new Set());
                    } else {
                      setSelected(new Set(myAssets.map(a => a.id)));
                    }
                  }}
                  className="h-7 text-[10px] uppercase tracking-widest font-mono text-primary/70 hover:text-primary hover:bg-primary/10"
                >
                  {selected.size === myAssets.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
              <div className="grid gap-2 mt-1">
                {myAssets.map((a) => (
                  <label key={a.id} className={cn(
                    "flex items-center gap-3 rounded border p-2 cursor-pointer transition-colors",
                    selected.has(a.id) ? "border-primary/60 bg-primary/10 box-glow-soft" : "border-primary/15 hover:border-primary/40 hover:bg-primary/5"
                  )}>
                    <Checkbox checked={selected.has(a.id)} onCheckedChange={() => toggle(a.id)} />
                    <span className="font-display text-primary glow-soft">{a.code}</span>
                    <span className="text-sm">{a.name}</span>
                  </label>
                ))}
              </div>
              <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} /></div>
              <Button onClick={initiate} disabled={busy} className="w-full bg-primary text-primary-foreground font-display">
                ▸ Send Handover Request ({selected.size})
              </Button>
            </>
          )}
        </Card>
      )}

      <Card className="bg-card/30 border-primary/20 p-4 space-y-2">
        <h2 className="font-display text-primary text-sm uppercase">Recent outgoing</h2>
        {outgoing.length === 0 && <div className="text-sm text-muted-foreground font-mono">// none</div>}
        {outgoing.map((h) => (
          <div key={h.id} className="flex flex-wrap items-center gap-2 text-sm border-b border-primary/10 py-2 last:border-0">
            <span className="text-muted-foreground">→ {profileMap[h.to_user]}</span>
            <span className="flex flex-wrap gap-1">
              {h.handover_items.map((it) => (
                <Badge key={it.asset_id} variant="outline" className="border-primary/30 text-primary font-mono text-[10px]">{it.assets?.code}</Badge>
              ))}
            </span>
            <Badge variant="outline" className="ml-auto text-xs">{h.status}</Badge>
          </div>
        ))}
      </Card>
    </div>
  );
}
