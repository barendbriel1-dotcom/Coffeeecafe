import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, CheckSquare, LogIn, MapPin, Search, Square, User, Wrench, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getAssetStatusLabel, getStatusBadgeClass, groupAssetsByName, LOCATION_NAMES } from "@/lib/assets";
import { cn } from "@/lib/utils";

interface AssetReturn {
  id: string;
  code: string;
  name: string;
  serial_number: string | null;
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

interface LocationRow {
  id: string;
  name: string;
}

export default function SignIn() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [rows, setRows] = useState<AssetReturn[]>([]);
  const [locations, setLocations] = useState<LocationRow[]>([]);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Bulk decision dialog
  const [bulkDecision, setBulkDecision] = useState<BulkDecision | null>(null);
  const [returnLocationId, setReturnLocationId] = useState("");
  const [decisionNotes, setDecisionNotes] = useState("");

  // Group drill-in dialog
  const [activeGroupKey, setActiveGroupKey] = useState<string | null>(null);

  // Filter / search
  const [searchQ, setSearchQ] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: assets, error: assetError }, { data: profiles }, { data: locationRows }] = await Promise.all([
        supabase
          .from("assets")
          .select(`
            id, code, name, status, current_holder, serial_number,
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

      const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.display_name]));
      const formattedRows: AssetReturn[] = (assets ?? []).map((asset: any) => {
        const activeItem = asset.signout_items?.find((item: any) => !item.returned);
        const signout = activeItem?.signout;
        const holderId = asset.current_holder || signout?.signed_out_to || null;

        return {
          id: asset.id,
          code: asset.code,
          name: asset.name,
          serial_number: asset.serial_number ?? null,
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

  const groupedReturns = useMemo(() => groupAssetsByName(rows, (item) => item.holder_name), [rows]);

  // Filter groups by search
  const filteredGroups = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    if (!q) return groupedReturns;
    return groupedReturns.filter(
      (group) =>
        group.name.toLowerCase().includes(q) ||
        group.items.some(
          (item) =>
            item.code.toLowerCase().includes(q) ||
            item.name.toLowerCase().includes(q) ||
            (item.serial_number ?? "").toLowerCase().includes(q) ||
            item.holder_name.toLowerCase().includes(q)
        )
    );
  }, [groupedReturns, searchQ]);

  const activeGroup = useMemo(
    () => groupedReturns.find((group) => group.key === activeGroupKey) ?? null,
    [activeGroupKey, groupedReturns]
  );

  const locationOptions = useMemo(() => locations.filter((l) => l.name !== "Traveling"), [locations]);

  // ── Selection helpers ──────────────────────────────────────────
  const visibleIds = useMemo(
    () => filteredGroups.flatMap((group) => group.items.map((item) => item.id)),
    [filteredGroups]
  );

  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleGroup = (ids: string[], force?: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = ids.every((id) => next.has(id));
      const shouldSelect = force !== undefined ? force : !allSelected;
      ids.forEach((id) => (shouldSelect ? next.add(id) : next.delete(id)));
      return next;
    });
  };

  const toggleAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  // ── Open bulk decision dialog ──────────────────────────────────
  const openBulkDecision = (
    items: AssetReturn[],
    nextStatus: "available" | "out_for_repairs" | "damaged"
  ) => {
    setBulkDecision({ items, nextStatus });
    setReturnLocationId("");
    setDecisionNotes("");
  };

  const openSelectedDecision = (nextStatus: "available" | "out_for_repairs" | "damaged") => {
    const items = rows.filter((r) => selectedIds.has(r.id));
    if (items.length === 0) return;
    openBulkDecision(items, nextStatus);
  };

  // ── Confirm bulk sign-in ───────────────────────────────────────
  const confirmBulkDecision = async () => {
    if (!bulkDecision) return;
    if (!returnLocationId) {
      toast.error("Select the return location before confirming.");
      return;
    }

    setProcessing(true);
    try {
      const { items, nextStatus } = bulkDecision;

      // Update all assets in one call per item (supabase doesn't support bulk update with diff rows)
      await Promise.all(
        items.map((item) =>
          supabase
            .from("assets")
            .update({ status: nextStatus, current_holder: null, current_location_id: returnLocationId } as any)
            .eq("id", item.id)
        )
      );

      // Mark signout_items as returned
      const signoutItemIds = items.map((i) => i.signout_item_id).filter(Boolean) as string[];
      if (signoutItemIds.length > 0) {
        await supabase.from("signout_items").update({ returned: true }).in("id", signoutItemIds);
      }

      // Close out signouts that have no remaining unreturned items
      const signoutIds = [...new Set(items.map((i) => i.signout_id).filter(Boolean) as string[])];
      await Promise.all(
        signoutIds.map(async (signoutId) => {
          const { data: remaining } = await supabase
            .from("signout_items")
            .select("id")
            .eq("signout_id", signoutId)
            .eq("returned", false);
          if (!remaining || remaining.length === 0) {
            await supabase
              .from("signouts")
              .update({ status: "returned", signed_in_at: new Date().toISOString(), signed_in_by: user?.id })
              .eq("id", signoutId);
          }
        })
      );

      // Write history for each item
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
      setActiveGroupKey(null);
      load();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to complete sign-in.");
    } finally {
      setProcessing(false);
    }
  };

  if (!isAdmin) return null;

  const selectedCount = selectedIds.size;

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="font-display text-3xl text-foreground glow-soft">Sign in</h1>

      {/* ── Top action bar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, tag, holder, serial…"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
          />
        </div>

        {/* Select-all visible */}
        <Button
          type="button"
          variant="outline"
          className="gap-2 whitespace-nowrap"
          onClick={toggleAllVisible}
          disabled={visibleIds.length === 0}
        >
          {allVisibleSelected ? <CheckSquare size={15} /> : <Square size={15} />}
          {allVisibleSelected ? "Deselect all" : `Select all (${visibleIds.length})`}
        </Button>
      </div>

      {/* ── Sticky bulk-action bar ── */}
      {selectedCount > 0 && (
        <div className="sticky top-4 z-30 flex flex-wrap items-center gap-2 rounded-[1.3rem] border border-primary/30 bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
          <span className="mr-auto font-mono text-sm text-primary">{selectedCount} item{selectedCount === 1 ? "" : "s"} selected</span>
          <Button size="sm" className="gap-1.5" onClick={() => openSelectedDecision("available")}>
            <Check size={13} /> Sign in as Available
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10" onClick={() => openSelectedDecision("out_for_repairs")}>
            <Wrench size={13} /> Out for Repairs
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 border-rose-500/30 text-rose-300 hover:bg-rose-500/10" onClick={() => openSelectedDecision("damaged")}>
            <XCircle size={13} /> Damaged
          </Button>
          <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setSelectedIds(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {/* ── Main list ── */}
      {loading ? (
        <div className="rounded-[1.5rem] border border-primary/12 bg-card/70 px-6 py-12 text-center font-mono text-sm text-primary/70">
          Loading signed-out assets...
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="rounded-[1.5rem] border border-primary/12 bg-card/70 px-6 py-12 text-center font-mono text-sm text-muted-foreground/70">
          {searchQ ? "No results match your search." : "No signed-out assets are waiting for sign-in."}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredGroups.map((group) => {
            const groupIds = group.items.map((i) => i.id);
            const allGroupSelected = groupIds.length > 0 && groupIds.every((id) => selectedIds.has(id));
            const someGroupSelected = groupIds.some((id) => selectedIds.has(id));

            return (
              <Card
                key={group.key}
                className="space-y-0 bg-card/40 p-5 transition-colors hover:bg-primary/5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* Checkbox + info */}
                  <div className="flex items-start gap-3">
                    {/* Group-level checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleGroup(groupIds)}
                      className="mt-1 shrink-0 text-primary/60 hover:text-primary transition-colors"
                      aria-label={allGroupSelected ? "Deselect group" : "Select group"}
                    >
                      {allGroupSelected ? (
                        <CheckSquare size={18} className="text-primary" />
                      ) : someGroupSelected ? (
                        <CheckSquare size={18} className="text-primary/40" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>

                    <div
                      className="flex-1 cursor-pointer space-y-2"
                      onClick={() => setActiveGroupKey(group.key)}
                    >
                      <div className="flex items-center gap-2">
                        <LogIn size={18} className="text-primary" />
                        <h2 className="font-display text-xl text-foreground glow-soft">{group.name}</h2>
                        <Badge variant="outline" className={cn("uppercase tracking-[0.16em]", getStatusBadgeClass("signed_out"))}>
                          Signed Out
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        <span>{group.totalUnits} signed-out unit{group.totalUnits === 1 ? "" : "s"}</span>
                        <span>{group.locationSummary}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => openBulkDecision(group.items, "available")}
                    >
                      <Check size={13} /> Sign in all
                    </Button>
                    <Badge
                      variant="outline"
                      className="cursor-pointer w-fit border-primary/20 bg-primary/10 px-3 py-1.5 font-mono text-primary"
                      onClick={() => setActiveGroupKey(group.key)}
                    >
                      Choose unit
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Group drill-in dialog ── */}
      <Dialog open={!!activeGroup} onOpenChange={(open) => !open && setActiveGroupKey(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-card/95 sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              {activeGroup?.name ?? "Signed-out units"}
            </DialogTitle>
          </DialogHeader>

          {activeGroup && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.2rem] border border-primary/12 bg-secondary/80 px-4 py-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Signed-out units</div>
                  <div className="mt-1 font-display text-xl text-foreground glow-soft">{activeGroup.totalUnits}</div>
                </div>
                <div className="rounded-[1.2rem] border border-primary/12 bg-secondary/80 px-4 py-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Users</div>
                  <div className="mt-1 text-sm text-foreground">{activeGroup.locationSummary}</div>
                </div>
              </div>

              {/* Select-all for this group */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm text-primary/80 hover:text-primary transition-colors"
                  onClick={() => {
                    const ids = activeGroup.items.map((i) => i.id);
                    const allSelected = ids.every((id) => selectedIds.has(id));
                    toggleGroup(ids, !allSelected);
                  }}
                >
                  {activeGroup.items.every((i) => selectedIds.has(i.id)) ? (
                    <CheckSquare size={15} />
                  ) : (
                    <Square size={15} />
                  )}
                  Select all in this group
                </button>
              </div>

              <div className="space-y-3">
                {activeGroup.items.map((item) => {
                  const isSelected = selectedIds.has(item.id);

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "space-y-4 rounded-[1.3rem] border p-4 transition-colors",
                        isSelected ? "border-primary/40 bg-primary/5" : "border-primary/12 bg-card"
                      )}
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-3">
                          {/* Per-item checkbox */}
                          <button
                            type="button"
                            onClick={() => toggleItem(item.id)}
                            className="mt-1 shrink-0 text-primary/60 hover:text-primary transition-colors"
                            aria-label={isSelected ? `Deselect ${item.code}` : `Select ${item.code}`}
                          >
                            {isSelected ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                          </button>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="font-display text-lg text-foreground glow-soft">{item.code}</div>
                              <Badge variant="outline" className={cn("uppercase tracking-[0.16em]", getStatusBadgeClass("signed_out"))}>
                                Signed Out
                              </Badge>
                            </div>
                            <div className="text-sm text-foreground/85">{item.name}</div>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                              <span className="flex items-center gap-1.5"><User size={12} /> Used by {item.holder_name}</span>
                              <span>Tag {item.code}</span>
                              <span>Serial {item.serial_number || "-"}</span>
                              {item.created_at && <span>Signed out {new Date(item.created_at).toLocaleString()}</span>}
                              {item.package_name && <span>Group: {item.package_name}</span>}
                            </div>
                            {item.notes && <div className="text-xs text-muted-foreground">{item.notes}</div>}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button disabled={processing} onClick={() => openBulkDecision([item], "available")} className="gap-1.5">
                            <Check size={14} /> Sign in as Available
                          </Button>
                          <Button disabled={processing} variant="outline" onClick={() => openBulkDecision([item], "out_for_repairs")} className="gap-1.5 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-200">
                            <Wrench size={14} /> Out for Repairs
                          </Button>
                          <Button disabled={processing} variant="outline" onClick={() => openBulkDecision([item], "damaged")} className="gap-1.5 border-rose-500/30 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200">
                            <XCircle size={14} /> Damaged
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bulk action bar inside dialog if items are selected */}
              {activeGroup.items.some((i) => selectedIds.has(i.id)) && (
                <div className="flex flex-wrap items-center gap-2 rounded-[1.2rem] border border-primary/30 bg-primary/5 px-4 py-3">
                  <span className="mr-auto font-mono text-xs text-primary">
                    {activeGroup.items.filter((i) => selectedIds.has(i.id)).length} selected in this group
                  </span>
                  <Button size="sm" className="gap-1.5" onClick={() => openSelectedDecision("available")}>
                    <Check size={13} /> Sign in as Available
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10" onClick={() => openSelectedDecision("out_for_repairs")}>
                    <Wrench size={13} /> Out for Repairs
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 border-rose-500/30 text-rose-300 hover:bg-rose-500/10" onClick={() => openSelectedDecision("damaged")}>
                    <XCircle size={13} /> Damaged
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
              {/* Item list summary */}
              <div className="max-h-40 overflow-y-auto rounded-[1.2rem] border border-primary/12 bg-secondary/60 px-3 py-2 space-y-1">
                {bulkDecision.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <span className="font-mono text-xs text-primary/70">{item.code}</span>
                    <span className="text-foreground">{item.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{item.holder_name}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Return location</Label>
                <Select value={returnLocationId} onValueChange={setReturnLocationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the location to return the items to" />
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

              <div className="rounded-[1.25rem] border border-primary/12 bg-primary/6 p-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 text-foreground">
                  <MapPin size={14} className="text-primary" />
                  All selected items will be moved to the chosen return location.
                </div>
                <div className="mt-2 flex items-center gap-2 text-foreground">
                  <AlertCircle size={14} className="text-primary" />
                  History will record both the admin completing this action and the user who last used each item.
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
