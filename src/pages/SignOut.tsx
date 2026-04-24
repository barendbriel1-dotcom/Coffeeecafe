import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  buildSearchBlob,
  getAssetStatusLabel,
  getStatusBadgeClass,
  groupAssetsByName,
  LOCATION_NAMES,
  normalizeAssetStatus,
} from "@/lib/assets";
import { cn } from "@/lib/utils";

interface Asset {
  id: string;
  code: string;
  name: string;
  status: string;
  department_id: string;
  current_location_id: string | null;
  division_id: string | null;
  serial_number: string | null;
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
  const [activeGroupKey, setActiveGroupKey] = useState<string | null>(null);

  const load = async () => {
    const [{ data: assetRows }, { data: locationRows }, { data: divisionRows }] = await Promise.all([
      supabase
        .from("assets")
        .select("id, code, name, status, department_id, current_location_id, division_id, serial_number")
        .order("name"),
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

  const groupedAssets = useMemo(
    () =>
      groupAssetsByName(available, (asset) => {
        const effectiveLocationId = asset.current_location_id ?? asset.department_id;
        return locationMap[effectiveLocationId] ?? "";
      }),
    [available, locationMap],
  );

  const filteredGroups = useMemo(() => {
    const normalizedQuery = q.trim().toLowerCase();

    return groupedAssets.filter((group) =>
      group.items.some((asset) => {
        const normalizedStatus = normalizeAssetStatus(asset.status);
        const effectiveLocationId = asset.current_location_id ?? asset.department_id;
        const locationName = locationMap[effectiveLocationId] ?? "";
        const divisionName = asset.division_id ? divisionMap[asset.division_id] ?? "" : "";
        const searchBlob = buildSearchBlob([
          group.name,
          asset.code,
          asset.serial_number,
          locationName,
          divisionName,
          getAssetStatusLabel(normalizedStatus),
        ]);

        const matchesQuery = !normalizedQuery || searchBlob.includes(normalizedQuery);
        const matchesStatus = filterStatus === "all" || normalizedStatus === filterStatus;
        const matchesLocation = filterLocation === "all" || effectiveLocationId === filterLocation;
        const matchesDivision = filterDivision === "all" || asset.division_id === filterDivision;
        return matchesQuery && matchesStatus && matchesLocation && matchesDivision;
      }),
    );
  }, [divisionMap, filterDivision, filterLocation, filterStatus, groupedAssets, locationMap, q]);

  const activeGroup = useMemo(
    () => groupedAssets.find((group) => group.key === activeGroupKey) ?? null,
    [activeGroupKey, groupedAssets],
  );

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
      setActiveGroupKey(null);
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
          <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search by item name, tag, serial, division, location..." className="pl-9" />
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
            <h2 className="font-display text-sm uppercase tracking-[0.2em] text-primary">Items</h2>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {filteredGroups.length} group{filteredGroups.length === 1 ? "" : "s"} found | {selected.size} selected
            </div>
          </div>

          <div className="grid max-h-[420px] grid-cols-1 gap-2 overflow-auto pr-1 md:grid-cols-2">
            {filteredGroups.length === 0 && (
              <div className="col-span-full py-12 text-center font-mono text-sm text-muted-foreground/60">
                No matching items were found.
              </div>
            )}

            {filteredGroups.map((group) => {
              const selectedCount = group.items.filter((item) => selected.has(item.id)).length;

              return (
                <button
                  key={group.key}
                  type="button"
                  onClick={() => setActiveGroupKey(group.key)}
                  className={cn(
                    "rounded-[1.2rem] border p-4 text-left transition-all",
                    selectedCount > 0
                      ? "border-primary/30 bg-primary/10 shadow-[0_0_24px_hsl(var(--primary)/0.1)]"
                      : "border-primary/10 bg-primary/5 hover:border-primary/24 hover:bg-primary/8",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-base text-foreground glow-soft">{group.name}</div>
                      <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                        <span>{group.totalUnits} total</span>
                        <span>{group.availableUnits} available</span>
                        <span>{group.locationSummary}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("uppercase tracking-[0.16em]", selectedCount > 0 ? getStatusBadgeClass("available") : "border-primary/12 bg-card text-muted-foreground")}>
                      {selectedCount > 0 ? `${selectedCount} selected` : "Open"}
                    </Badge>
                  </div>
                </button>
              );
            })}
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

      <Dialog open={!!activeGroup} onOpenChange={(open) => !open && setActiveGroupKey(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-card sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              {activeGroup?.name ?? "Item instances"}
            </DialogTitle>
          </DialogHeader>

          {activeGroup && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.2rem] border border-primary/12 bg-secondary/80 px-4 py-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Total units</div>
                  <div className="mt-1 font-display text-xl text-foreground glow-soft">{activeGroup.totalUnits}</div>
                </div>
                <div className="rounded-[1.2rem] border border-primary/12 bg-secondary/80 px-4 py-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Available units</div>
                  <div className="mt-1 font-display text-xl text-primary glow-soft">{activeGroup.availableUnits}</div>
                </div>
                <div className="rounded-[1.2rem] border border-primary/12 bg-secondary/80 px-4 py-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Selected</div>
                  <div className="mt-1 font-display text-xl text-foreground glow-soft">
                    {activeGroup.items.filter((item) => selected.has(item.id)).length}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {activeGroup.items.map((asset) => {
                  const effectiveLocationId = asset.current_location_id ?? asset.department_id;
                  const divisionName = asset.division_id ? divisionMap[asset.division_id] ?? "Division" : "Division";
                  const locationName = locationMap[effectiveLocationId] ?? "Location";
                  const normalizedStatus = normalizeAssetStatus(asset.status);
                  const disabled = normalizedStatus !== "available";

                  return (
                    <label
                      key={asset.id}
                      className={cn(
                        "flex items-start gap-3 rounded-[1.2rem] border p-4 transition-all",
                        selected.has(asset.id)
                          ? "border-primary/30 bg-primary/10"
                          : disabled
                            ? "cursor-not-allowed border-primary/10 bg-card opacity-70"
                            : "cursor-pointer border-primary/10 bg-background hover:border-primary/24 hover:bg-primary/8",
                      )}
                    >
                      <Checkbox
                        checked={selected.has(asset.id)}
                        disabled={disabled}
                        onCheckedChange={() => toggle(asset.id)}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-display text-base text-foreground glow-soft">{asset.code}</div>
                          <Badge variant="outline" className={cn("uppercase tracking-[0.16em]", getStatusBadgeClass(normalizedStatus))}>
                            {getAssetStatusLabel(normalizedStatus)}
                          </Badge>
                        </div>
                        <div className="mt-1 text-sm text-foreground/85">{asset.name}</div>
                        <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                          <span>Serial: {asset.serial_number || "-"}</span>
                          <span>{divisionName}</span>
                          <span>{locationName}</span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
