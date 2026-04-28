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
import { toast } from "sonner";
import { Check, X } from "lucide-react";

interface Req {
  id: string; requested_by: string; asset_id: string | null;
  item_description: string | null; needed_for: string | null;
  needed_by: string | null; status: string; admin_notes: string | null;
  created_at: string;
}
interface Asset {
  id: string;
  code: string;
  name: string;
  status: string;
  locked_by?: string | null;
  locked_at?: string | null;
}

export default function Requests() {
  const { user, isAdmin } = useAuth();
  const [requests, setRequests] = useState<Req[]>([]);
  const [profileMap, setProfileMap] = useState<Record<string, string>>({});
  const [assetMap, setAssetMap] = useState<Record<string, Asset>>({});
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [assetId, setAssetId] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [neededFor, setNeededFor] = useState("");
  const [neededBy, setNeededBy] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [{ data: r }, { data: p }, { data: a }] = await Promise.all([
      supabase.from("asset_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, display_name"),
      supabase.from("assets").select("id, code, name, status, locked_by, locked_at"),
    ]);
    setRequests(r ?? []);
    setProfileMap(Object.fromEntries((p ?? []).map((x) => [x.id, x.display_name])));
    setAssetMap(Object.fromEntries((a ?? []).map((x) => [x.id, x])));
    setAvailableAssets((a ?? []).filter((x) => x.status === "available"));
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!assetId && !itemDesc) { toast.error("Select an asset or describe what you need"); return; }
    setBusy(true);
    const { error } = await supabase.from("asset_requests").insert({
      requested_by: user!.id,
      asset_id: assetId || null,
      item_description: itemDesc || null,
      needed_for: neededFor || null,
      needed_by: neededBy ? new Date(neededBy).toISOString() : null,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Request sent to Admins");
    setAssetId(""); setItemDesc(""); setNeededFor(""); setNeededBy("");
    load();
  };

  const review = async (r: Req, status: "approved" | "rejected", notes?: string) => {
    setBusy(true);
    try {
      if (status === "approved" && r.asset_id) {
        const { error } = await supabase.rpc("approve_asset_request", {
          target_request_id: r.id,
          admin_notes: notes ?? null,
        });
        if (error) throw error;
      } else if (status === "approved") {
        const { error } = await supabase.rpc("approve_asset_request", {
          target_request_id: r.id,
          admin_notes: notes ?? null,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("asset_requests").update({
          status,
          reviewed_by: user!.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: notes || null,
        }).eq("id", r.id);

        if (error) throw error;
      }

      toast.success(`Request ${status}`);
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to process request");
    } finally {
      setBusy(false);
    }
  };

  const statusColor: Record<string, string> = {
    pending: "border-yellow-500/40 text-yellow-400 bg-yellow-500/10",
    approved: "border-primary/40 text-primary bg-primary/10",
    rejected: "border-destructive/40 text-destructive bg-destructive/10",
    fulfilled: "border-blue-500/40 text-blue-400 bg-blue-500/10",
  };

  const visible = isAdmin ? requests : requests.filter((r) => r.requested_by === user?.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl text-primary glow">Asset Requests</h1>

      <Card className="bg-card/40 border-primary/30 p-4 space-y-3">
        <h2 className="font-display text-primary text-sm uppercase">Submit a Request</h2>
        <div>
          <Label>Specific asset (optional)</Label>
          <Select value={assetId} onValueChange={setAssetId}>
            <SelectTrigger><SelectValue placeholder="Choose available asset" /></SelectTrigger>
            <SelectContent>{availableAssets.map((a) => <SelectItem key={a.id} value={a.id}>{a.code} — {a.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Or describe what you need</Label>
          <Input value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} placeholder="e.g. wireless mic for Sunday" maxLength={200} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><Label>Needed for</Label><Input value={neededFor} onChange={(e) => setNeededFor(e.target.value)} placeholder="Sunday Service" maxLength={200} /></div>
          <div><Label>Needed by</Label><Input type="datetime-local" value={neededBy} onChange={(e) => setNeededBy(e.target.value)} /></div>
        </div>
        <Button onClick={submit} disabled={busy} className="w-full bg-primary text-primary-foreground font-display">▸ Send Request</Button>
      </Card>

      <div className="space-y-2">
        <h2 className="font-display text-primary text-sm uppercase">{isAdmin ? "All Requests" : "My Requests"}</h2>
        {visible.length === 0 && <Card className="p-4 text-center text-muted-foreground font-mono bg-card/30 border-primary/20">// none</Card>}
        {visible.map((r) => (
          <Card key={r.id} className="bg-card/40 border-primary/20 p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm">
                <span className="text-muted-foreground">By</span> <span className="text-primary">{profileMap[r.requested_by]}</span>
                {r.asset_id && assetMap[r.asset_id] && (
                  <> · <span className="font-display text-primary glow-soft">{assetMap[r.asset_id].code}</span> {assetMap[r.asset_id].name}</>
                )}
                {r.item_description && <> · {r.item_description}</>}
              </div>
              <Badge variant="outline" className={statusColor[r.status]}>{r.status}</Badge>
            </div>
            {(r.needed_for || r.needed_by) && (
              <div className="text-xs text-muted-foreground">
                {r.needed_for} {r.needed_by && `by ${new Date(r.needed_by).toLocaleString()}`}
              </div>
            )}
            {isAdmin && r.status === "pending" && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => review(r, "approved")} className="bg-primary text-primary-foreground"><Check size={14} className="mr-1" />Approve</Button>
                <Button size="sm" variant="outline" onClick={() => review(r, "rejected")} className="border-destructive text-destructive"><X size={14} className="mr-1" />Reject</Button>
              </div>
            )}
            {r.admin_notes && <div className="text-xs text-muted-foreground italic">Admin: {r.admin_notes}</div>}
          </Card>
        ))}
      </div>
    </div>
  );
}
