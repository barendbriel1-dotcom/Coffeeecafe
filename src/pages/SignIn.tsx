import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, CheckSquare, MapPin, Search, Square, Wrench, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  serial_number: string | null;
  division_id: string | null;
  division_name: string;
  current_location_id: string | null;
  location_name: string;
  holder_id: string | null;
  holder_name: string;
  signout_item_id: string | null;
  signout_id: string | null;
  package_name: string | null;
  notes: string | null;
  created_at: string | null;
}

interface BulkDecision {
  items: AssetReturn[];
  nextStatus: "available" | "out_for_repairs" | "damaged";
}

interface LocationRow { id: string; name: string; }
interface DivisionRow { id: string; name: string; }

export default function SignIn() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [rows, setRows] = useState<AssetReturn[]>([]);
  const [locations, setLocations] = useState<LocationRow[]>([]);

  // Filters
  const [searchQ, setSearchQ] = useState("");
  const [holderFilter, setHolderFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [packageFilter, setPackageFilter] = useState("all");

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Bulk decision dialog
  const [bulkDecision, setBulkDecision] = useState<BulkDecision | null>(null);
  const [returnLocationId, setReturnLocationId] = useState("");
  const [decisionNotes, setDecisionNotes] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [
        { data: assets, error: assetError },
        { data: profiles },
        { data: locationRows },
        { data: divisionRows },
      ] = await Promise.all([
        supabase
          .from("assets")
          .select(`
            id, code, name, status, current_holder, serial_number,
            division_id, current_location_id,
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
        supabase.from("divisions").select("id, name"),
      ]);

      if (assetError) throw assetError;

      const orderedLocations = (locationRows ?? []).sort((a: LocationRow, b: LocationRow) => {
        const aIndex = LOCATION_NAMES.indexOf(a.name as (typeof LOCATION_NAMES)[number]);
        const bIndex = LOCATION_NAMES.indexOf(b.name as (typeof LOCATION_NAMES)[number]);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      });

      const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.display_name]));
      const divisionMap = Object.fromEntries((divisionRows ?? []).map((d: DivisionRow) => [d.id, d.name]));
      const locationMap = Object.fromEntries((locationRows ?? []).map((l: LocationRow) => [l.id, l.name]));

      const formattedRows: AssetReturn[] = (assets ?? []).map((asset: any) => {
        const activeItem = asset.signout_items?.find((item: any) => !item.returned);
        const signout = activeItem?.signout;
        const holderId = asset.current_holder || signout?.signed_out_to || null;
        return {
          id: asset.id,
          code: asset.code,
          name: asset.name,
          serial_number: asset.serial_number ?? null,
          division_id: asset.division_id ?? null,
          division_name: divisionMap[asset.division_id ?? ""] || "—",
          current_location_id: asset.current_location_id ?? null,
          location_name: locationMap[asset.current_location_id ?? ""] || "—",
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

  useEffect(() => { load(); }, []);

  // ── Filter option lists derived from live data ─────────────────
  const holderOptions = useMemo(() => [...new Set(rows.map((r) => r.holder_name))].sort(), [rows]);
  const divisionOptions = useMemo(() => [...new Set(rows.map((r) => r.division_name).filter((d) => d !== "—"))].sort(), [rows]);
  const locationFilterOptions = useMemo(() => [...new Set(rows.map((r) => r.location_name).filter((l) => l !== "—"))].sort(), [rows]);
  const packageOptions = useMemo(() => [...new Set(rows.map((r) => r.package_name).filter(Boolean) as string[])].sort(), [rows]);

  const locationOptions = useMemo(() => locations.filter((l) => l.name !== "Traveling"), [locations]);

  // ── Active filter detection ────────────────────────────────────
  const isFilterActive =
    searchQ.trim().length > 0 ||
    holderFilter !== "all" ||
    divisionFilter !== "all" ||
    locationFilter !== "all" ||
    packageFilter !== "all";

  const filteredRows = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    return rows.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        (item.serial_number ?? "").toLowerCase().includes(q) ||
        item.holder_name.toLowerCase().includes(q) ||
        (item.package_name ?? "").toLowerCase().includes(q);
      const matchesHolder = holderFilter === "all" || item.holder_name === holderFilter;
      const matchesDivision = divisionFilter === "all" || item.division_name === divisionFilter;
      const matchesLocation = locationFilter === "all" || item.location_name === locationFilter;
      const matchesPackage = packageFilter === "all" || item.package_name === packageFilter;
      return matchesSearch && matchesHolder && matchesDivision && matchesLocation && matchesPackage;
    });
  }, [rows, searchQ, holderFilter, divisionFilter, locationFilter, packageFilter]);

  // ── Selection helpers ──────────────────────────────────────────
  const allFilteredSelected = filteredRows.length > 0 && filteredRows.every((r) => selectedIds.has(r.id));

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredRows.forEach((r) => next.delete(r.id));
      } else {
        filteredRows.forEach((r) => next.add(r.id));
      }
      return next;
    });
  };

  // ── Bulk decision ──────────────────────────────────────────────
  const openBulkDecision = (items: AssetReturn[], nextStatus: "available" | "out_for_repairs" | "damaged") => {
    setBulkDecision({ items, nextStatus });
    setReturnLocationId("");
    setDecisionNotes("");
  };

  const openSelectedDecision = (nextStatus: "available" | "out_for_repairs" | "damaged") => {
    const items = rows.filter((r) => selectedIds.has(r.id));
    if (items.length === 0) return;
    openBulkDecision(items, nextStatus);
  };

  const confirmBulkDecision = async () => {
    if (!bulkDecision) return;
    if (!returnLocationId) {
      toast.error("Select a return location before confirming.");
      return;
    }

    setProcessing(true);
    try {
      const { items, nextStatus } = bulkDecision;

      await Promise.all(
        items.map((item) =>
          supabase
            .from("assets")
            .update({ status: nextStatus, current_holder: null, current_location_id: returnLocationId } as any)
            .eq("id", item.id)
        )
      );

      const signoutItemIds = items.map((i) => i.signout_item_id).filter(Boolean) as string[];
      if (signoutItemIds.length > 0) {
        await supabase.from("signout_items").update({ returned: true }).in("id", signoutItemIds);
      }

      const signoutIds = [...new Set(items.map((i) => i.signout_id).filter(Boolean) as string[])];
      await Promise.all(
        signoutIds.map(async (signoutId) => {
          const { data: remaining } = await supabase
            .from("signout_items").select("id").eq("signout_id", signoutId).eq("returned", false);
          if (!remaining || remaining.length === 0) {
            await supabase.from("signouts")
              .update({ status: "returned", signed_in_at: new Date().toISOString(), signed_in_by: user?.id })
              .eq("id", signoutId);
          }
        })
      );

      const returnLocationName = locations.find((l) => l.id === returnLocationId)?.name ?? "Unknown location";
      const action =
        nextStatus === "available" ? "signed_in" : nextStatus === "out_for_repairs" ? "sent_for_repairs" : "marked_damaged";

      await supabase.from("asset_history").insert(
        items.map((item) => ({
          asset_id: item.id,
          action,
          performed_by: user?.id,
          from_user: item.holder_id,
          notes: `${decisionNotes || "Admin bulk sign-in."} Returned to ${returnLocationName}.`,
        }))
      );

      toast.success(`${items.length} item${items.length === 1 ? "" : "s"} signed in as ${getAssetStatusLabel(nextStatus)}.`);
      setBulkDecision(null);
      setSelectedIds(new Set());
      load();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to complete sign-in.");
    } finally {
      setProcessing(false);
    }
  };

  const resetFilters = () => {
    setSearchQ("");
    setHolderFilter("all");
    setDivisionFilter("all");
    setLocationFilter("all");
    setPackageFilter("all");
  };

  if (!isAdmin) return null;

  const selectedCount = selectedIds.size;

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="font-display text-3xl text-foreground glow-soft">Sign in</h1>

      {/* ── Search bar ── */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by name, tag, serial number, holder or group…"
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
        />
      </div>

      {/* ── Filter row ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={divisionFilter} onValueChange={setDivisionFilter}>
          <SelectTrigger className="h-8 w-40 text-xs">
            <SelectValue placeholder="Division" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All divisions</SelectItem>
            {divisionOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="h-8 w-40 text-xs">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {locationFilterOptions.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={holderFilter} onValueChange={setHolderFilter}>
          <SelectTrigger className="h-8 w-40 text-xs">
            <SelectValue placeholder="User" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All users</SelectItem>
            {holderOptions.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={packageFilter} onValueChange={setPackageFilter}>
          <SelectTrigger className="h-8 w-44 text-xs">
            <SelectValue placeholder="Group signout" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All groups</SelectItem>
            {packageOptions.map((pkg) => <SelectItem key={pkg} value={pkg}>{pkg}</SelectItem>)}
          </SelectContent>
        </Select>

        {isFilterActive && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
          >
            Clear filters
          </button>
        )}

        {/* Select-all — only when results visible */}
        {filteredRows.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto gap-2 h-8 text-xs"
            onClick={toggleAllFiltered}
          >
            {allFilteredSelected ? <CheckSquare size={13} /> : <Square size={13} />}
            {allFilteredSelected ? "Deselect all" : `Select all (${filteredRows.length})`}
          </Button>
        )}
      </div>

      {/* ── Sticky bulk action bar ── */}
      {selectedCount > 0 && (
        <div className="sticky top-4 z-30 flex flex-wrap items-center gap-2 rounded-[1.3rem] border border-primary/30 bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
          <span className="mr-auto font-mono text-sm text-primary">
            {selectedCount} item{selectedCount === 1 ? "" : "s"} selected
          </span>
          <Button size="sm" className="gap-1.5" onClick={() => openSelectedDecision("available")}>
            <Check size={13} /> Sign in as Available
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
            onClick={() => openSelectedDecision("out_for_repairs")}>
            <Wrench size={13} /> Out for Repairs
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
            onClick={() => openSelectedDecision("damaged")}>
            <XCircle size={13} /> Damaged
          </Button>
          <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setSelectedIds(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {/* ── Content area ── */}
      {loading ? (
        <div className="rounded-[1.5rem] border border-primary/12 bg-card/70 px-6 py-12 text-center font-mono text-sm text-primary/70">
          Loading signed-out assets…
        </div>

      ) : filteredRows.length === 0 ? (
        <div className="rounded-[1.5rem] border border-primary/12 bg-card/70 px-6 py-12 text-center font-mono text-sm text-muted-foreground/70">
          No signed-out assets match your search or filters.
        </div>

      ) : (
        <div className="flex flex-wrap gap-3">
          {filteredRows.map((item) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(item.id)}
                className={cn(
                  "group flex flex-col gap-1 rounded-[1.3rem] border px-4 py-3 text-left transition-all w-full sm:w-auto sm:min-w-[240px]",
                  isSelected
                    ? "border-primary/60 bg-primary/10 shadow-[0_0_12px_rgba(0,200,100,0.12)]"
                    : "border-primary/15 bg-card/50 hover:border-primary/35 hover:bg-primary/5"
                )}
              >
                <div className="flex items-center gap-2">
                  {isSelected
                    ? <CheckSquare size={14} className="shrink-0 text-primary" />
                    : <Square size={14} className="shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground" />
                  }
                  <span className="font-mono text-xs text-primary/70">{item.code}</span>
                  <Badge
                    variant="outline"
                    className={cn("ml-auto text-[10px] uppercase tracking-wider", getStatusBadgeClass("signed_out"))}
                  >
                    Signed Out
                  </Badge>
                </div>

                <div className="pl-5 space-y-0.5">
                  <p className="text-sm font-medium text-foreground leading-tight">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.holder_name}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[10px] text-muted-foreground/60">
                    {item.division_name !== "—" && <span>{item.division_name}</span>}
                    {item.location_name !== "—" && <span>{item.location_name}</span>}
                    {item.serial_number && <span>{item.serial_number}</span>}
                    {item.package_name && (
                      <span className="text-primary/60">📦 {item.package_name}</span>
                    )}
                  </div>
                </div>

                {/* Quick-action buttons on hover / when selected */}
                <div className={cn(
                  "pl-5 flex flex-wrap gap-1.5 mt-1 transition-all overflow-hidden",
                  isSelected ? "max-h-20 opacity-100" : "max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100"
                )}>
                  <button type="button"
                    onClick={(e) => { e.stopPropagation(); openBulkDecision([item], "available"); }}
                    className="flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] text-primary hover:bg-primary/20 transition-colors">
                    <Check size={10} /> Available
                  </button>
                  <button type="button"
                    onClick={(e) => { e.stopPropagation(); openBulkDecision([item], "out_for_repairs"); }}
                    className="flex items-center gap-1 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-300 hover:bg-cyan-500/20 transition-colors">
                    <Wrench size={10} /> Repairs
                  </button>
                  <button type="button"
                    onClick={(e) => { e.stopPropagation(); openBulkDecision([item], "damaged"); }}
                    className="flex items-center gap-1 rounded-full border border-rose-500/25 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-300 hover:bg-rose-500/20 transition-colors">
                    <XCircle size={10} /> Damaged
                  </button>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Bulk decision dialog ── */}
      <Dialog open={!!bulkDecision} onOpenChange={(open) => !open && setBulkDecision(null)}>
        <DialogContent className="bg-card/95">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              {bulkDecision
                ? `Sign in ${bulkDecision.items.length} item${bulkDecision.items.length === 1 ? "" : "s"} — ${getAssetStatusLabel(bulkDecision.nextStatus)}`
                : "Complete sign-in"}
            </DialogTitle>
          </DialogHeader>

          {bulkDecision && (
            <div className="space-y-4">
              <div className="max-h-44 overflow-y-auto rounded-[1.2rem] border border-primary/12 bg-secondary/60 px-3 py-2 space-y-1.5">
                {bulkDecision.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <span className="font-mono text-xs text-primary/70 shrink-0">{item.code}</span>
                    <span className="text-foreground truncate">{item.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground shrink-0">{item.holder_name}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Return location</Label>
                <Select value={returnLocationId} onValueChange={setReturnLocationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the return location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationOptions.map((location) => (
                      <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Notes (optional)</Label>
                <Textarea
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder={
                    bulkDecision.nextStatus === "damaged"
                      ? "Describe why the asset(s) are not usable."
                      : bulkDecision.nextStatus === "out_for_repairs"
                        ? "Describe the repair issue."
                        : "Optional sign-in notes."
                  }
                />
              </div>

              <div className="rounded-[1.25rem] border border-primary/12 bg-primary/6 p-3 text-sm space-y-2">
                <div className="flex items-center gap-2 text-foreground">
                  <MapPin size={14} className="text-primary shrink-0" />
                  All selected items will be moved to the chosen return location.
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <AlertCircle size={14} className="text-primary shrink-0" />
                  History records both the admin completing this action and the last holder.
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setBulkDecision(null)}>Cancel</Button>
            <Button onClick={confirmBulkDecision} disabled={!bulkDecision || processing}>
              {processing ? "Processing…" : `Confirm (${bulkDecision?.items.length ?? 0})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
