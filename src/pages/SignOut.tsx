import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface Asset { id: string; code: string; name: string; status: string; }
interface Profile { id: string; display_name: string; }
interface Dept { id: string; name: string; code: string; }

export default function SignOut({ bulk = false }: { bulk?: boolean }) {
  const { user, isStaff } = useAuth();
  const [available, setAvailable] = useState<Asset[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [depts, setDepts] = useState<Dept[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toUser, setToUser] = useState("");
  const [toDept, setToDept] = useState("");
  const [packageName, setPackageName] = useState("");
  const [notes, setNotes] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [{ data: a }, { data: p }, { data: d }] = await Promise.all([
      supabase.from("assets").select("id, code, name, status").eq("status", "available").order("code"),
      supabase.from("profiles").select("id, display_name").order("display_name"),
      supabase.from("departments").select("id, code, name").order("name"),
    ]);
    setAvailable(a ?? []);
    setProfiles(p ?? []);
    setDepts(d ?? []);
  };
  useEffect(() => { load(); }, []);

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    if (!bulk && next.size > 1) {
      // single mode → keep only the latest pick
      next.clear();
      next.add(id);
    }
    setSelected(next);
  };

  const submit = async () => {
    if (!isStaff) { toast.error("Insufficient privileges"); return; }
    if (selected.size === 0) { toast.error("Select at least one asset"); return; }
    if (!toUser) { toast.error("Choose a recipient"); return; }
    setBusy(true);
    try {
      const { data: signout, error } = await supabase
        .from("signouts")
        .insert({
          signed_out_by: user!.id,
          signed_out_to: toUser,
          to_department_id: toDept || null,
          package_name: bulk ? (packageName || "Bulk package") : null,
          notes: notes || null,
          expected_return: expectedReturn ? new Date(expectedReturn).toISOString() : null,
        })
        .select("id")
        .single();
      if (error) throw error;

      const ids = [...selected];
      const { error: itemsErr } = await supabase.from("signout_items")
        .insert(ids.map((asset_id) => ({ signout_id: signout.id, asset_id })));
      if (itemsErr) throw itemsErr;

      const { error: updErr } = await supabase.from("assets").update({
        status: "signed_out",
        current_holder: toUser,
        current_location_id: toDept || null,
      }).in("id", ids);
      if (updErr) throw updErr;

      await supabase.from("asset_history").insert(ids.map((asset_id) => ({
        asset_id, action: "signed_out", performed_by: user!.id, to_user: toUser,
        notes: bulk ? `Bulk: ${packageName}` : null,
      })));

      toast.success(`Signed out ${ids.length} asset(s)`);
      setSelected(new Set()); setToUser(""); setToDept(""); setPackageName(""); setNotes(""); setExpectedReturn("");
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="font-display text-2xl text-primary glow">
        // {bulk ? "Bulk Package Sign-Out" : "Sign Out Asset"}
      </h1>
      <p className="text-sm text-muted-foreground">
        {bulk
          ? "Bundle multiple assets (e.g. camera + lenses + batteries + chargers) as one package."
          : "Pick an available asset and the recipient. Returns must be processed by an Admin."}
      </p>

      <Card className="bg-card/40 border-primary/30 p-4 space-y-3">
        {bulk && (
          <div>
            <Label>Package Name</Label>
            <Input value={packageName} onChange={(e) => setPackageName(e.target.value)} placeholder="Sunday Service Camera Kit" maxLength={120} />
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Recipient</Label>
            <Select value={toUser} onValueChange={setToUser}>
              <SelectTrigger><SelectValue placeholder="Choose user" /></SelectTrigger>
              <SelectContent>{profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>To Department / Location</Label>
            <Select value={toDept} onValueChange={setToDept}>
              <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
              <SelectContent>{depts.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Expected Return</Label>
            <Input type="datetime-local" value={expectedReturn} onChange={(e) => setExpectedReturn(e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} />
        </div>
      </Card>

      <Card className="bg-card/40 border-primary/30 p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-primary text-sm uppercase">Available Assets</h2>
          <Badge variant="outline" className="border-primary/40 text-primary">
            {selected.size} selected
          </Badge>
        </div>
        <div className="grid gap-2 max-h-96 overflow-auto">
          {available.length === 0 && <div className="text-sm text-muted-foreground py-4 text-center font-mono">// none available</div>}
          {available.map((a) => (
            <label key={a.id} className="flex items-center gap-3 rounded border border-primary/15 p-2 hover:border-primary/40 cursor-pointer">
              <Checkbox checked={selected.has(a.id)} onCheckedChange={() => toggle(a.id)} />
              <span className="font-display text-primary glow-soft min-w-[60px]">{a.code}</span>
              <span className="text-sm flex-1">{a.name}</span>
            </label>
          ))}
        </div>
      </Card>

      <Button onClick={submit} disabled={busy} className="w-full bg-primary text-primary-foreground font-display tracking-wider">
        {busy ? "Processing…" : `▸ Confirm Sign-Out (${selected.size})`}
      </Button>
    </div>
  );
}
