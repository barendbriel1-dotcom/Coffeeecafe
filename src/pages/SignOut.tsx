import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { buildSearchBlob, getAssetStatusLabel, getStatusBadgeClass, LOCATION_NAMES, normalizeAssetStatus } from "@/lib/assets";
import { cn } from "@/lib/utils";

interface Asset {
  id: string;
  code: string;
  name: string;
  status: string;
  department_id: string;
  current_location_id: string | null;
  division_id: string | null;
}

interface Loc {
  id: string;
  name: string;
}

interface Div {
  id: string;
  name: string;
}

export default function SignOut({ bulk = false }: { bulk?: boolean }) {
  const { user, isStaff } = useAuth();
  const [available, setAvailable] = useState<Asset[]>([]);
  const [locations, setLocations] = useState<Loc[]>([]);
  const [divisions, setDivisions] = useState<Div[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("available");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterDivision, setFilterDivision] = useState("all");

  const load = async () => {
    const [{ data: assetRows }, { data: locationRows }, { data: divisionRows }] = await Promise.all([
      supabase.from("assets").select("id, code, name, status, department_id, current_location_id, division_id").order("name"),
      supabase.from("locations").select("id, name"),
      supabase.from("divisions").select("id, name"),
    ]);

    const orderedLocations = (locationRows ?? []).sort((a: Loc, b: Loc) => {
      const aIndex = LOCATION_NAMES.indexOf(a.name as (typeof LOCATION_NAMES)[number]);
      const bIndex = LOCATION_NAMES.indexOf(b.name as (typeof LOCATION_NAMES)[number]);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    setAvailable(assetRows ?? []);
    setLocations(orderedLocations);
    setDivisions(divisionRows ?? []);
  };

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  const divisionMap = useMemo(() => Object.fromEntries(divisions.map((division) => [division.id, division.name])), [divisions]);
  const locationMap = useMemo(() => Object.fromEntries(locations.map((location) => [location.id, location.name])), [locations]);

  const filteredAssets = available.filter((asset) => {
    const normalizedStatus = normalizeAssetStatus(asset.status);
    const effectiveLocationId = asset.current_location_id ?? asset.department_id;
    const locationName = locationMap[effectiveLocationId] ?? "";
    const divisionName = asset.division_id ? divisionMap[asset.division_id] ?? "" : "";
    const searchBlob = buildSearchBlob([asset.code, asset.name, locationName, divisionName, getAssetStatusLabel(normalizedStatus)]);
    const matchesQuery = !q.trim() || searchBlob.includes(q.trim().toLowerCase());
    const matchesStatus = filterStatus === "all" || normalizedStatus === filterStatus;
    const matchesLocation = filterLocation === "all" || effectiveLocationId === filterLocation;
    const matchesDivision = filterDivision === "all" || asset.division_id === filterDivision;
    return matchesQuery && matchesStatus && matchesLocation && matchesDivision;
  });

  const toggle = (id: string) => {
    const asset = available.find((entry) => entry.id === id);
    if (!asset || normalizeAssetStatus(asset.status) !== "available") return;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const submit = async () => {
    if (!isStaff) {
      toast.error("Staff or admin access is required.");
      return;
    }

    if (selected.size === 0) {
      toast.error("Select at least one asset.");
      return;
    }

    const traveling = locations.find((location) => location.name === "Traveling");
    if (!traveling) {
      toast.error("Traveling location was not found.");
      return;
    }

    setBusy(true);

    try {
      const signOutAt = new Date();
      const { data: signout, error } = await supabase
        .from("signouts")
        .insert({
          signed_out_by: user!.id,
          signed_out_to: user!.id,
          to_department_id: traveling.id,
          package_name: bulk ? "Bulk package" : null,
          notes: notes || null,
          expected_return: signOutAt.toISOString(),
        })
        .select("id")
        .single();

      if (error) throw error;

      const ids = [...selected];
      const { error: itemsError } = await supabase.from("signout_items").insert(ids.map((asset_id) => ({ signout_id: signout.id, asset_id })));
      if (itemsError) throw itemsError;

      const { error: updateError } = await supabase
        .from("assets")
        .update({
          status: "signed_out",
          current_holder: user!.id,
          current_location_id: traveling.id,
        } as any)
        .in("id", ids);

      if (updateError) throw updateError;

      await supabase.from("asset_history").insert(
        ids.map((asset_id) => ({
          asset_id,
          action: "signed_out",
          performed_by: user!.id,
          to_user: user!.id,
          notes: bulk ? "Bulk package created. Location moved to Traveling." : "Location moved to Traveling.",
        })),
      );

      toast.success(`Signed out ${ids.length} asset(s). Location moved to Traveling.`);
      setSelected(new Set());
      setNotes("");
      load();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to sign out the selected assets.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="font-display text-3xl text-foreground glow-soft">{bulk ? "Bulk sign out" : "Sign out"}</h1>

      <Card className="space-y-5 bg-card/40 p-4 sm:p-5">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={16} />
          <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search by tag, name, division, location..." className="pl-9" />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="signed_out">Signed Out</SelectItem>
              <SelectItem value="out_for_repairs">Out for Repairs</SelectItem>
              <SelectItem value="damaged">Damaged</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterDivision} onValueChange={setFilterDivision}>
            <SelectTrigger><SelectValue placeholder="Division" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All divisions</SelectItem>
              {divisions.map((division) => (
                <SelectItem key={division.id} value={division.id}>
                  {division.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 rounded-[1.5rem] border border-primary/12 bg-card p-4">
          <div className="flex items-center justify-between border-b border-primary/10 pb-3">
            <h2 className="font-display text-sm uppercase tracking-[0.2em] text-primary">Assets</h2>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {filteredAssets.length} item{filteredAssets.length === 1 ? "" : "s"} found
            </div>
          </div>

          <div className="grid max-h-[420px] grid-cols-1 gap-2 overflow-auto pr-1 md:grid-cols-2">
            {filteredAssets.length === 0 && (
              <div className="col-span-full py-12 text-center font-mono text-sm text-muted-foreground/60">
                No matching assets were found.
              </div>
            )}

            {filteredAssets.map((asset) => (
              <label
                key={asset.id}
                className={cn(
                  "relative flex cursor-pointer items-center gap-3 rounded-[1.2rem] border p-3 transition-all",
                  selected.has(asset.id)
                    ? "border-primary/35 bg-primary/10 shadow-[0_0_24px_hsl(var(--primary)/0.1)]"
                    : normalizeAssetStatus(asset.status) === "available"
                      ? "border-primary/10 bg-primary/5 hover:border-primary/24 hover:bg-primary/8"
                      : "cursor-not-allowed border-primary/10 bg-card/90 opacity-60",
                )}
              >
                <Checkbox
                  checked={selected.has(asset.id)}
                  disabled={normalizeAssetStatus(asset.status) !== "available"}
                  onCheckedChange={() => toggle(asset.id)}
                />

                <div className="min-w-0 flex-1">
                  <div className={cn("font-display text-sm tracking-[0.14em]", selected.has(asset.id) ? "text-primary glow-soft" : "text-foreground")}>
                    {asset.code}
                  </div>
                  <div className="truncate text-sm text-foreground/85">{asset.name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={cn("uppercase tracking-[0.16em]", getStatusBadgeClass(asset.status))}>
                      {getAssetStatusLabel(asset.status)}
                    </Badge>
                    <span className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {asset.division_id ? divisionMap[asset.division_id] ?? "Division" : "Division"} | {locationMap[asset.current_location_id ?? asset.department_id] ?? "Location"}
                    </span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Notes</Label>
          <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional checkout notes..." />
        </div>

        <Button onClick={submit} disabled={busy || selected.size === 0} className="w-full">
          {busy ? "Processing..." : `Confirm sign out (${selected.size})`}
        </Button>
      </Card>
    </div>
  );
}
