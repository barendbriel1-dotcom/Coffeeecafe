import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, LogIn, MapPin, User, Wrench, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getAssetStatusLabel, getStatusBadgeClass, LOCATION_NAMES } from "@/lib/assets";
import { cn } from "@/lib/utils";

interface AssetReturn {
  id: string;
  code: string;
  name: string;
  holder_id: string | null;
  holder_name: string;
  signout_item_id: string | null;
  signout_id: string | null;
  package_name: string | null;
  notes: string | null;
  created_at: string | null;
}

interface ReturnDecision {
  item: AssetReturn;
  nextStatus: "available" | "out_for_repairs" | "damaged";
}

interface LocationRow {
  id: string;
  name: string;
}

export default function SignIn() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rows, setRows] = useState<AssetReturn[]>([]);
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [decision, setDecision] = useState<ReturnDecision | null>(null);
  const [returnLocationId, setReturnLocationId] = useState("");
  const [decisionNotes, setDecisionNotes] = useState("");

  const load = async () => {
    setLoading(true);

    try {
      const [{ data: assets, error: assetError }, { data: profiles }, { data: locationRows }] = await Promise.all([
        supabase
          .from("assets")
          .select(`
            id, code, name, status, current_holder,
            signout_items(
              id, returned, signout_id,
              signout:signouts(
                id, created_at, package_name, notes, signed_out_to
              )
            )
          `)
          .eq("status", "signed_out"),
        supabase.from("profiles").select("id, display_name"),
        supabase.from("locations").select("id, name"),
      ]);

      if (assetError) throw assetError;

      const orderedLocations = (locationRows ?? []).sort((a: LocationRow, b: LocationRow) => {
        const aIndex = LOCATION_NAMES.indexOf(a.name as (typeof LOCATION_NAMES)[number]);
        const bIndex = LOCATION_NAMES.indexOf(b.name as (typeof LOCATION_NAMES)[number]);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      });

      const profileMap = Object.fromEntries((profiles ?? []).map((profile) => [profile.id, profile.display_name]));
      const formattedRows: AssetReturn[] = (assets ?? []).map((asset: any) => {
        const activeItem = asset.signout_items?.find((item: any) => !item.returned);
        const signout = activeItem?.signout;
        const holderId = asset.current_holder || signout?.signed_out_to || null;

        return {
          id: asset.id,
          code: asset.code,
          name: asset.name,
          holder_id: holderId,
          holder_name: profileMap[holderId ?? ""] || "Unknown user",
          signout_item_id: activeItem?.id ?? null,
          signout_id: signout?.id ?? null,
          package_name: signout?.package_name ?? null,
          notes: signout?.notes ?? null,
          created_at: signout?.created_at ?? null,
        };
      });

      setRows(formattedRows.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")));
      setLocations(orderedLocations);
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to load signed-out assets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const locationOptions = useMemo(() => locations.filter((location) => location.name !== "Traveling"), [locations]);

  const openDecision = (item: AssetReturn, nextStatus: "available" | "out_for_repairs" | "damaged") => {
    setDecision({ item, nextStatus });
    setDecisionNotes("");
    setReturnLocationId("");
  };

  const confirmDecision = async () => {
    if (!decision) return;
    if (!returnLocationId) {
      toast.error("Select the location the asset is being signed back into.");
      return;
    }

    const { item, nextStatus } = decision;
    setProcessing(item.id);

    try {
      const { error: assetError } = await supabase
        .from("assets")
        .update({
          status: nextStatus,
          current_holder: null,
          current_location_id: returnLocationId,
        } as any)
        .eq("id", item.id);

      if (assetError) throw assetError;

      if (item.signout_item_id) {
        const { error: signoutItemError } = await supabase.from("signout_items").update({ returned: true }).eq("id", item.signout_item_id);
        if (signoutItemError) throw signoutItemError;
      }

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
              signed_in_by: user?.id,
            })
            .eq("id", item.signout_id);
        }
      }

      const returnLocationName = locations.find((location) => location.id === returnLocationId)?.name ?? "Unknown location";
      const action =
        nextStatus === "available"
          ? "signed_in"
          : nextStatus === "out_for_repairs"
            ? "sent_for_repairs"
            : "marked_damaged";

      await supabase.from("asset_history").insert({
        asset_id: item.id,
        action,
        performed_by: user?.id,
        from_user: item.holder_id,
        notes: `${decisionNotes || "Admin sign-in review completed."} Returned to ${returnLocationName}.`,
      });

      toast.success(`${item.code} updated to ${getAssetStatusLabel(nextStatus)}.`);
      setDecision(null);
      setDecisionNotes("");
      setReturnLocationId("");
      load();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to complete sign-in.");
    } finally {
      setProcessing(null);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="app-kicker">Asset sign in</div>
        <h1 className="mt-2 font-display text-3xl text-foreground glow-soft">Sign assets back in and approve their next status.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Every sign-in is completed by an admin, records the user who had the asset, and assigns the item back to a chosen location.
        </p>
      </div>

      {loading ? (
        <div className="rounded-[1.5rem] border border-primary/12 bg-card/70 px-6 py-12 text-center font-mono text-sm text-primary/70">
          Loading signed-out assets...
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-[1.5rem] border border-primary/12 bg-card/70 px-6 py-12 text-center font-mono text-sm text-muted-foreground/70">
          No signed-out assets are waiting for sign-in.
        </div>
      ) : (
        <div className="grid gap-4">
          {rows.map((item) => (
            <Card key={item.id} className="space-y-4 bg-card/40 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <LogIn size={18} className="text-primary" />
                    <h2 className="font-display text-xl text-foreground glow-soft">{item.code}</h2>
                    <Badge variant="outline" className={cn("uppercase tracking-[0.16em]", getStatusBadgeClass("signed_out"))}>
                      Signed Out
                    </Badge>
                  </div>
                  <div className="text-sm text-foreground/85">{item.name}</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    <span className="flex items-center gap-1.5"><User size={12} /> Used by {item.holder_name}</span>
                    {item.created_at && <span>Signed out {new Date(item.created_at).toLocaleString()}</span>}
                    {item.package_name && <span>Package: {item.package_name}</span>}
                  </div>
                  {item.notes && <div className="text-xs text-muted-foreground">{item.notes}</div>}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button disabled={processing === item.id} onClick={() => openDecision(item, "available")} className="gap-1.5">
                    <Check size={14} /> Sign in as Available
                  </Button>
                  <Button disabled={processing === item.id} variant="outline" onClick={() => openDecision(item, "out_for_repairs")} className="gap-1.5 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-200">
                    <Wrench size={14} /> Out for Repairs
                  </Button>
                  <Button disabled={processing === item.id} variant="outline" onClick={() => openDecision(item, "damaged")} className="gap-1.5 border-rose-500/30 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200">
                    <XCircle size={14} /> Damaged
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!decision} onOpenChange={(open) => !open && setDecision(null)}>
        <DialogContent className="bg-card/95">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              {decision ? `${decision.item.code} | ${getAssetStatusLabel(decision.nextStatus)}` : "Complete sign-in"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Return location</Label>
              <Select value={returnLocationId} onValueChange={setReturnLocationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select the location to return the item to" />
                </SelectTrigger>
                <SelectContent>
                  {locationOptions.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Approval notes</Label>
              <Textarea
                value={decisionNotes}
                onChange={(event) => setDecisionNotes(event.target.value)}
                placeholder={
                  decision?.nextStatus === "damaged"
                    ? "Describe why the asset is not usable."
                    : decision?.nextStatus === "out_for_repairs"
                      ? "Describe the repair issue."
                      : "Optional sign-in notes."
                }
              />
            </div>

            {decision && (
              <div className="rounded-[1.25rem] border border-primary/12 bg-primary/6 p-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 text-foreground">
                  <MapPin size={14} className="text-primary" />
                  Admin sign-in will set the asset location to the selected return location.
                </div>
                <div className="mt-2 flex items-center gap-2 text-foreground">
                  <AlertCircle size={14} className="text-primary" />
                  History will record both the admin completing the action and the user who last used the asset.
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDecision(null)}>Cancel</Button>
            <Button onClick={confirmDecision} disabled={!decision || processing === decision.item.id}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
