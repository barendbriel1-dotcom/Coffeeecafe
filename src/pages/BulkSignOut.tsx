import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, PackagePlus, Save, Search, Trash2, User2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { buildSearchBlob, getAssetStatusLabel, getStatusBadgeClass, groupAssetsByName, LOCATION_NAMES, normalizeAssetStatus } from "@/lib/assets";
import { cn } from "@/lib/utils";

interface BulkPacketRow {
  id: string;
  name: string;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface BulkPacketItemRow {
  id: string;
  packet_id: string;
  line_label: string;
  division_id: string | null;
  location_id: string | null;
  notes: string | null;
  sort_order: number;
}

interface BulkPacketItemDraft {
  id: string;
  line_label: string;
  division_id: string | null;
  location_id: string | null;
  notes: string;
  sort_order: number;
}

interface BulkPacket {
  id: string;
  name: string;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  items: BulkPacketItemDraft[];
}

interface Profile {
  id: string;
  display_name: string;
}

interface Asset {
  id: string;
  code: string;
  name: string;
  status: string;
  department_id: string;
  current_location_id: string | null;
  division_id: string | null;
  serial_number: string | null;
  description: string | null;
}

interface LocationRow {
  id: string;
  name: string;
}

interface DivisionRow {
  id: string;
  name: string;
}

const EMPTY_ITEM = (): BulkPacketItemDraft => ({
  id: `draft-${crypto.randomUUID()}`,
  line_label: "",
  division_id: null,
  location_id: null,
  notes: "",
  sort_order: 0,
});

export default function BulkSignOut() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savingPacket, setSavingPacket] = useState(false);
  const [deletingPacket, setDeletingPacket] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [packets, setPackets] = useState<BulkPacket[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [divisions, setDivisions] = useState<DivisionRow[]>([]);

  const [activePacketId, setActivePacketId] = useState<string | "new" | null>(null);
  const [editorName, setEditorName] = useState("");
  const [editorNotes, setEditorNotes] = useState("");
  const [editorItems, setEditorItems] = useState<BulkPacketItemDraft[]>([EMPTY_ITEM()]);
  const [activeEditorSearchId, setActiveEditorSearchId] = useState<string | null>(null);
  const [activeAssignmentLineId, setActiveAssignmentLineId] = useState<string | null>(null);

  const [recipientId, setRecipientId] = useState("");
  const [signoutNotes, setSignoutNotes] = useState("");
  const [assignments, setAssignments] = useState<Record<string, string>>({});

  const load = async (preferredPacketId?: string | "new" | null) => {
    setLoading(true);

    try {
      const [
        { data: packetRows, error: packetError },
        { data: packetItemRows, error: packetItemError },
        { data: profileRows, error: profileError },
        { data: assetRows, error: assetError },
        { data: locationRows, error: locationError },
        { data: divisionRows, error: divisionError },
      ] = await Promise.all([
        supabase.from("bulk_packets").select("*").order("name"),
        supabase.from("bulk_packet_items").select("*").order("packet_id").order("sort_order"),
        supabase.from("profiles").select("id, display_name").order("display_name"),
        supabase
          .from("assets")
          .select("id, code, name, status, department_id, current_location_id, division_id, serial_number, description")
          .order("name"),
        supabase.from("locations").select("id, name"),
        supabase.from("divisions").select("id, name").order("name"),
      ]);

      if (packetError) throw packetError;
      if (packetItemError) throw packetItemError;
      if (profileError) throw profileError;
      if (assetError) throw assetError;
      if (locationError) throw locationError;
      if (divisionError) throw divisionError;

      const groupedItems = new Map<string, BulkPacketItemDraft[]>();
      (packetItemRows ?? []).forEach((row: BulkPacketItemRow) => {
        const items = groupedItems.get(row.packet_id) ?? [];
        items.push({
          id: row.id,
          line_label: row.line_label,
          division_id: row.division_id,
          location_id: row.location_id,
          notes: row.notes ?? "",
          sort_order: row.sort_order,
        });
        groupedItems.set(row.packet_id, items);
      });

      const nextPackets = (packetRows ?? []).map((packet: BulkPacketRow) => ({
        ...packet,
        items: (groupedItems.get(packet.id) ?? []).sort((a, b) => a.sort_order - b.sort_order),
      }));

      const orderedLocations = (locationRows ?? []).sort((a: LocationRow, b: LocationRow) => {
        const aIndex = LOCATION_NAMES.indexOf(a.name as (typeof LOCATION_NAMES)[number]);
        const bIndex = LOCATION_NAMES.indexOf(b.name as (typeof LOCATION_NAMES)[number]);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      });

      setPackets(nextPackets);
      setProfiles(profileRows ?? []);
      setAssets(assetRows ?? []);
      setLocations(orderedLocations);
      setDivisions(divisionRows ?? []);

      const nextActivePacketId =
        preferredPacketId === "new"
          ? "new"
          : preferredPacketId && nextPackets.some((packet) => packet.id === preferredPacketId)
            ? preferredPacketId
            : nextPackets[0]?.id ?? null;

      setActivePacketId(nextActivePacketId);
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to load bulk signout data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !isAdmin) return;
    load();
  }, [user, isAdmin]);

  const activeSavedPacket = useMemo(
    () => (activePacketId && activePacketId !== "new" ? packets.find((packet) => packet.id === activePacketId) ?? null : null),
    [activePacketId, packets],
  );

  useEffect(() => {
    if (activePacketId === "new") {
      setEditorName("");
      setEditorNotes("");
      setEditorItems([EMPTY_ITEM()]);
      setAssignments({});
      return;
    }

    if (!activeSavedPacket) {
      setEditorName("");
      setEditorNotes("");
      setEditorItems([EMPTY_ITEM()]);
      setAssignments({});
      return;
    }

    setEditorName(activeSavedPacket.name);
    setEditorNotes(activeSavedPacket.notes ?? "");
    setEditorItems(
      activeSavedPacket.items.length > 0
        ? activeSavedPacket.items.map((item, index) => ({ ...item, notes: item.notes ?? "", sort_order: index }))
        : [EMPTY_ITEM()],
    );
    setAssignments({});
  }, [activePacketId, activeSavedPacket]);

  const locationMap = useMemo(() => Object.fromEntries(locations.map((location) => [location.id, location.name])), [locations]);
  const divisionMap = useMemo(() => Object.fromEntries(divisions.map((division) => [division.id, division.name])), [divisions]);
  const profileMap = useMemo(() => Object.fromEntries(profiles.map((profile) => [profile.id, profile.display_name])), [profiles]);

  const availableAssets = useMemo(
    () => assets.filter((asset) => normalizeAssetStatus(asset.status) === "available"),
    [assets],
  );

  const groupedAssets = useMemo(
    () =>
      groupAssetsByName(assets, (asset) => {
        const effectiveLocationId = asset.current_location_id ?? asset.department_id;
        return locationMap[effectiveLocationId] ?? "";
      }),
    [assets, locationMap],
  );

  const normalizedEditorItems = useMemo(
    () =>
      editorItems.map((item, index) => ({
        line_label: item.line_label.trim(),
        division_id: item.division_id ?? null,
        location_id: item.location_id ?? null,
        notes: item.notes.trim(),
        sort_order: index,
      })),
    [editorItems],
  );

  const packetDirty = useMemo(() => {
    if (activePacketId === "new") {
      return Boolean(
        editorName.trim() ||
          editorNotes.trim() ||
          normalizedEditorItems.some((item) => item.line_label || item.notes || item.division_id || item.location_id),
      );
    }

    if (!activeSavedPacket) return false;

    return (
      editorName.trim() !== activeSavedPacket.name ||
      editorNotes.trim() !== (activeSavedPacket.notes ?? "") ||
      JSON.stringify(normalizedEditorItems) !==
        JSON.stringify(
          activeSavedPacket.items.map((item, index) => ({
            line_label: item.line_label.trim(),
            division_id: item.division_id ?? null,
            location_id: item.location_id ?? null,
            notes: (item.notes ?? "").trim(),
            sort_order: index,
          })),
        )
    );
  }, [activePacketId, activeSavedPacket, editorName, editorNotes, normalizedEditorItems]);

  const activePacketForSignout = activeSavedPacket;

  const candidateAssetsForLine = (item: BulkPacketItemDraft) => {
    const normalizedLineLabel = item.line_label.trim().toLowerCase();
    if (!normalizedLineLabel) return [];

    const matchingByName = assets.filter((asset) => asset.name.trim().toLowerCase() === normalizedLineLabel);
    const basePool =
      normalizedLineLabel && matchingByName.length > 0
        ? matchingByName
        : assets.filter((asset) => buildSearchBlob([asset.name, asset.code, asset.serial_number]).includes(normalizedLineLabel));

    return [...basePool]
      .filter((asset) => (item.division_id ? asset.division_id === item.division_id : true))
      .filter((asset) => {
        const effectiveLocationId = asset.current_location_id ?? asset.department_id;
        return item.location_id ? effectiveLocationId === item.location_id : true;
      })
      .sort((a, b) => {
        const aAvailable = normalizeAssetStatus(a.status) === "available" ? 0 : 1;
        const bAvailable = normalizeAssetStatus(b.status) === "available" ? 0 : 1;
        if (aAvailable !== bAvailable) return aAvailable - bAvailable;
        return a.code.localeCompare(b.code);
      });
  };

  const createNewPacket = () => {
    setActivePacketId("new");
  };

  const getEditorSuggestions = (item: BulkPacketItemDraft) => {
    const query = item.line_label.trim();
    if (!query) return [];

    const normalizedQuery = buildSearchBlob([query]);

    return groupedAssets
      .filter((group) =>
        group.items.some((asset) => {
          const effectiveLocationId = asset.current_location_id ?? asset.department_id;
          const locationName = locationMap[effectiveLocationId] ?? "";
          const divisionName = asset.division_id ? divisionMap[asset.division_id] ?? "" : "";
          const searchBlob = buildSearchBlob([
            group.name,
            asset.name,
            asset.code,
            asset.serial_number,
            asset.description,
            locationName,
            divisionName,
          ]);
          return searchBlob.includes(normalizedQuery);
        }),
      )
      .sort((a, b) => {
        const aExact = a.name.toLowerCase() === query.toLowerCase() ? 0 : 1;
        const bExact = b.name.toLowerCase() === query.toLowerCase() ? 0 : 1;
        if (aExact !== bExact) return aExact - bExact;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 8);
  };

  const assignTemplateAssetGroup = (itemId: string, groupName: string) => {
    const matchingGroup = groupedAssets.find((group) => group.name.trim().toLowerCase() === groupName.trim().toLowerCase());
    const divisionIds = Array.from(new Set((matchingGroup?.items ?? []).map((asset) => asset.division_id).filter(Boolean)));
    const locationIds = Array.from(
      new Set(
        (matchingGroup?.items ?? [])
          .map((asset) => asset.current_location_id ?? asset.department_id)
          .filter(Boolean),
      ),
    );

    updateEditorItem(itemId, {
      line_label: groupName,
      division_id: divisionIds.length === 1 ? divisionIds[0] ?? null : null,
      location_id: locationIds.length === 1 ? locationIds[0] ?? null : null,
    });
    setActiveEditorSearchId(null);
  };

  const activeAssignmentLine = useMemo(
    () => activePacketForSignout?.items.find((item) => item.id === activeAssignmentLineId) ?? null,
    [activeAssignmentLineId, activePacketForSignout],
  );

  const assignmentCandidates = activeAssignmentLine ? candidateAssetsForLine(activeAssignmentLine) : [];

  const activeAssignedAssetId = activeAssignmentLine ? assignments[activeAssignmentLine.id] ?? "" : "";

  const assignedElsewhereIds = useMemo(
    () =>
      new Set(
        Object.entries(assignments)
          .filter(([lineId, assetId]) => lineId !== activeAssignmentLineId && assetId)
          .map(([, assetId]) => assetId),
      ),
    [assignments, activeAssignmentLineId],
  );

  const updateEditorItem = (id: string, patch: Partial<BulkPacketItemDraft>) => {
    setEditorItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const addEditorItem = () => {
    setEditorItems((current) => [...current, { ...EMPTY_ITEM(), sort_order: current.length }]);
  };

  const moveEditorItem = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= editorItems.length) return;

    setEditorItems((current) => {
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next.map((item, itemIndex) => ({ ...item, sort_order: itemIndex }));
    });
  };

  const removeEditorItem = (id: string) => {
    setEditorItems((current) => {
      const next = current.filter((item) => item.id !== id);
      return next.length > 0 ? next.map((item, index) => ({ ...item, sort_order: index })) : [EMPTY_ITEM()];
    });
  };

  const savePacket = async () => {
    if (!user) return;

    const trimmedName = editorName.trim();
    const validItems = normalizedEditorItems.filter((item) => item.line_label);

    if (!trimmedName) {
      toast.error("Group name is required.");
      return;
    }

    if (validItems.length === 0) {
      toast.error("Add at least one group line.");
      return;
    }

    setSavingPacket(true);

    try {
      let packetId = activePacketId !== "new" ? activePacketId : null;

      if (packetId) {
        const { error } = await supabase
          .from("bulk_packets")
          .update({ name: trimmedName, notes: editorNotes.trim() || null })
          .eq("id", packetId);

        if (error) throw error;

        const { error: deleteItemsError } = await supabase.from("bulk_packet_items").delete().eq("packet_id", packetId);
        if (deleteItemsError) throw deleteItemsError;
      } else {
        const { data, error } = await supabase
          .from("bulk_packets")
          .insert({ name: trimmedName, notes: editorNotes.trim() || null, created_by: user.id })
          .select("id")
          .single();

        if (error) throw error;
        packetId = data.id;
      }

      const { error: insertItemsError } = await supabase.from("bulk_packet_items").insert(
        validItems.map((item, index) => ({
          packet_id: packetId!,
          line_label: item.line_label,
          division_id: item.division_id,
          location_id: item.location_id,
          notes: item.notes || null,
          sort_order: index,
        })),
      );

      if (insertItemsError) throw insertItemsError;

      toast.success(packetId === activePacketId ? "Group updated." : "Group created.");
      await load(packetId);
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to save group.");
    } finally {
      setSavingPacket(false);
    }
  };

  const deletePacket = async () => {
    if (!activeSavedPacket) return;
    const confirmed = window.confirm(`Delete group "${activeSavedPacket.name}"?`);
    if (!confirmed) return;

    setDeletingPacket(true);
    try {
      const { error } = await supabase.from("bulk_packets").delete().eq("id", activeSavedPacket.id);
      if (error) throw error;

      toast.success("Group deleted.");
      await load(null);
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to delete group.");
    } finally {
      setDeletingPacket(false);
    }
  };

  const updateAssignment = (lineId: string, assetId: string) => {
    setAssignments((current) => ({
      ...current,
      [lineId]: assetId === "unassigned" ? "" : assetId,
    }));
  };

  const submitBulkSignout = async () => {
    if (!user || !activePacketForSignout) {
      toast.error("Choose a saved group first.");
      return;
    }

    if (packetDirty) {
      toast.error("Save group changes before signing it out.");
      return;
    }

    if (!recipientId) {
      toast.error("Choose the user receiving this group.");
      return;
    }

    const packetItems = activePacketForSignout.items;
    if (packetItems.length === 0) {
      toast.error("This group has no saved lines.");
      return;
    }

    const unresolvedItems = packetItems.filter((item) => !assignments[item.id]);
    if (unresolvedItems.length > 0) {
      toast.error("Assign an asset to every group line before signout.");
      return;
    }

    const assignedAssetIds = packetItems.map((item) => assignments[item.id]);
    if (new Set(assignedAssetIds).size !== assignedAssetIds.length) {
      toast.error("Each group line must use a different asset.");
      return;
    }

    const traveling = locations.find((location) => location.name === "Traveling");
    if (!traveling) {
      toast.error("Traveling location was not found.");
      return;
    }

    setSubmitting(true);

    try {
      const { data: latestAssets, error: latestAssetsError } = await supabase
        .from("assets")
        .select("id, name, status")
        .in("id", assignedAssetIds);

      if (latestAssetsError) throw latestAssetsError;

      const invalidIds = new Set(
        (latestAssets ?? [])
          .filter((asset) => normalizeAssetStatus(asset.status) !== "available")
          .map((asset) => asset.id),
      );

      if ((latestAssets ?? []).length !== assignedAssetIds.length) {
        assignedAssetIds.forEach((id) => {
          if (!(latestAssets ?? []).some((asset) => asset.id === id)) invalidIds.add(id);
        });
      }

      if (invalidIds.size > 0) {
        setAssignments((current) => {
          const next = { ...current };
          Object.entries(next).forEach(([lineId, assetId]) => {
            if (invalidIds.has(assetId)) next[lineId] = "";
          });
          return next;
        });

        toast.error("One or more assets are no longer available. Replace them before completing the group.");
        return;
      }

      const signedOutAt = new Date().toISOString();
      const { data: signout, error: signoutError } = await supabase
        .from("signouts")
        .insert({
          signed_out_by: user.id,
          signed_out_to: recipientId,
          to_department_id: traveling.id,
          package_name: activePacketForSignout.name,
          notes: signoutNotes.trim() || activePacketForSignout.notes || null,
          expected_return: signedOutAt,
        })
        .select("id")
        .single();

      if (signoutError) throw signoutError;

      const { error: signoutItemsError } = await supabase.from("signout_items").insert(
        assignedAssetIds.map((assetId) => ({
          signout_id: signout.id,
          asset_id: assetId,
        })),
      );

      if (signoutItemsError) throw signoutItemsError;

      const { error: updateAssetsError } = await supabase
        .from("assets")
        .update({
          status: "signed_out",
          current_holder: recipientId,
          current_location_id: traveling.id,
        } as any)
        .in("id", assignedAssetIds);

      if (updateAssetsError) throw updateAssetsError;

      const historyRows = packetItems.map((item) => ({
        asset_id: assignments[item.id],
        action: "signed_out",
        performed_by: user.id,
        to_user: recipientId,
        notes: `Group: ${activePacketForSignout.name} | Line: ${item.line_label}${signoutNotes.trim() ? ` | ${signoutNotes.trim()}` : ""}`,
      }));

      const { error: historyError } = await supabase.from("asset_history").insert(historyRows);
      if (historyError) throw historyError;

      toast.success(`Group "${activePacketForSignout.name}" signed out to ${profileMap[recipientId] ?? "selected user"}.`);
      setRecipientId("");
      setSignoutNotes("");
      setAssignments({});
      await load(activePacketForSignout.id);
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to complete bulk signout.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-3xl text-foreground glow-soft">Bulk sign out</h1>

      <Card className="space-y-5 bg-card/40 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-display text-lg text-foreground glow-soft">Group management</div>
            <div className="text-sm text-muted-foreground">Create reusable groups, then edit or remove them anytime.</div>
          </div>
          <Button type="button" onClick={createNewPacket} className="gap-2">
            <PackagePlus size={16} /> New group
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-3 rounded-[1.5rem] border border-primary/12 bg-card p-4">
            <div className="flex items-center justify-between border-b border-primary/10 pb-3">
              <div className="font-display text-sm uppercase tracking-[0.2em] text-primary">Saved groups</div>
              <Badge variant="outline" className="border-primary/20 bg-card px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {packets.length}
              </Badge>
            </div>

            <div className="space-y-2">
              {loading ? (
                <div className="rounded-[1.2rem] border border-primary/10 bg-card px-4 py-8 text-center text-sm text-muted-foreground">
                  Loading groups...
                </div>
              ) : packets.length === 0 ? (
                <div className="rounded-[1.2rem] border border-primary/10 bg-card px-4 py-8 text-center text-sm text-muted-foreground">
                  No groups saved yet.
                </div>
              ) : (
                packets.map((packet) => (
                  <button
                    key={packet.id}
                    type="button"
                    onClick={() => setActivePacketId(packet.id)}
                    className={cn(
                      "w-full rounded-[1.2rem] border px-4 py-3 text-left transition-all",
                      activePacketId === packet.id
                        ? "border-primary/28 bg-primary/10 shadow-[0_0_24px_hsl(var(--primary)/0.1)]"
                        : "border-primary/10 bg-card hover:border-primary/22 hover:bg-primary/6",
                    )}
                  >
                    <div className="font-display text-sm text-foreground glow-soft">{packet.name}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {packet.items.length} line{packet.items.length === 1 ? "" : "s"}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-[1.5rem] border border-primary/12 bg-card p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="font-display text-sm uppercase tracking-[0.2em] text-primary">
                  {activePacketId === "new" ? "Create group" : "Edit group"}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Groups are reusable checklist templates. Admins assign the real assets later when signing out.
                </div>
              </div>
              {activeSavedPacket && (
                <Button type="button" variant="outline" onClick={deletePacket} disabled={deletingPacket} className="gap-2 border-destructive/25 text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 size={14} /> {deletingPacket ? "Deleting..." : "Delete group"}
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Group Name</Label>
                <Input value={editorName} onChange={(event) => setEditorName(event.target.value)} placeholder="Camera 5 Wireless Kit" maxLength={120} />
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Group Notes</Label>
                <Input value={editorNotes} onChange={(event) => setEditorNotes(event.target.value)} placeholder="Optional group notes" maxLength={160} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-display text-sm uppercase tracking-[0.2em] text-primary">Group lines</div>
                <Button type="button" variant="outline" onClick={addEditorItem}>Add line</Button>
              </div>

              <div className="space-y-3">
                {editorItems.map((item, index) => (
                  <div key={item.id} className="space-y-3 rounded-[1.3rem] border border-primary/12 bg-background/90 p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Line {index + 1}</div>
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="icon" onClick={() => moveEditorItem(index, -1)} disabled={index === 0}>
                          <ArrowUp size={14} />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => moveEditorItem(index, 1)} disabled={index === editorItems.length - 1}>
                          <ArrowDown size={14} />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeEditorItem(item.id)} disabled={editorItems.length === 1}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary/72">Search and add item</Label>
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            value={item.line_label}
                            onChange={(event) => updateEditorItem(item.id, { line_label: event.target.value })}
                            onFocus={() => setActiveEditorSearchId(item.id)}
                            onBlur={() => {
                              window.setTimeout(() => {
                                setActiveEditorSearchId((current) => (current === item.id ? null : current));
                              }, 120);
                            }}
                            className="pl-10"
                            placeholder="Search asset by name, tag, or serial number"
                            maxLength={120}
                          />
                        </div>

                        {activeEditorSearchId === item.id && item.line_label.trim() && (
                          <div className="max-h-64 overflow-y-auto rounded-[1.1rem] border border-primary/12 bg-card p-2">
                            {getEditorSuggestions(item).length === 0 ? (
                              <div className="px-3 py-4 text-sm text-muted-foreground">
                                No matching assets found. You can still type your own group line name manually.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {getEditorSuggestions(item).map((group) => {
                                  return (
                                    <button
                                      key={group.key}
                                      type="button"
                                      onMouseDown={(event) => {
                                        event.preventDefault();
                                        assignTemplateAssetGroup(item.id, group.name);
                                      }}
                                      className="w-full rounded-[1rem] border border-primary/10 bg-background px-3 py-3 text-left transition-all hover:border-primary/24 hover:bg-primary/8"
                                    >
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-display text-sm text-foreground glow-soft">{group.name}</span>
                                        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">
                                          {group.totalUnits} unit{group.totalUnits === 1 ? "" : "s"}
                                        </span>
                                      </div>
                                      <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                                        <span>{group.availableUnits} available</span>
                                        <span>{group.locationSummary}</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                        <Select value={item.division_id ?? "any"} onValueChange={(value) => updateEditorItem(item.id, { division_id: value === "any" ? null : value })}>
                          <SelectTrigger><SelectValue placeholder="Division" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any division</SelectItem>
                            {divisions.map((division) => (
                              <SelectItem key={division.id} value={division.id}>
                                {division.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={item.location_id ?? "any"} onValueChange={(value) => updateEditorItem(item.id, { location_id: value === "any" ? null : value })}>
                          <SelectTrigger><SelectValue placeholder="Location" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any location</SelectItem>
                            {locations.map((location) => (
                              <SelectItem key={location.id} value={location.id}>
                                {location.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Textarea
                      value={item.notes}
                      onChange={(event) => updateEditorItem(item.id, { notes: event.target.value })}
                      placeholder="Optional line notes"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button type="button" onClick={savePacket} disabled={savingPacket} className="gap-2">
              <Save size={16} /> {savingPacket ? "Saving..." : activePacketId === "new" ? "Create group" : "Save group"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="space-y-5 bg-card/40 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="font-display text-lg text-foreground glow-soft">Group signout</div>
            <div className="text-sm text-muted-foreground">Choose a saved group, assign one real asset to each line, and sign the full group out to one user.</div>
          </div>
          {activePacketForSignout && (
            <Badge variant="outline" className="border-primary/20 bg-card px-3 py-1.5 font-mono text-primary">
              {activePacketForSignout.items.length} line{activePacketForSignout.items.length === 1 ? "" : "s"}
            </Badge>
          )}
        </div>

        {!activePacketForSignout ? (
          <div className="rounded-[1.5rem] border border-primary/12 bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            Save or select a group first to start bulk signout.
          </div>
        ) : (
          <>
            {packetDirty && (
              <div className="rounded-[1.2rem] border border-amber-500/24 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                Save your group changes before using this group in bulk signout.
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Group</Label>
                <Input value={activePacketForSignout.name} readOnly className="text-muted-foreground" />
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">User receiving group</Label>
                <Select value={recipientId} onValueChange={setRecipientId}>
                  <SelectTrigger><SelectValue placeholder="Choose user" /></SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              {activePacketForSignout.items.map((item, index) => {
                const selectedAssetId = assignments[item.id] ?? "";
                const selectedAsset = selectedAssetId ? assets.find((asset) => asset.id === selectedAssetId) : null;
                const selectedAssetUnavailable = Boolean(
                  selectedAsset && normalizeAssetStatus(selectedAsset.status) !== "available",
                );
                const selectedBlockedByOtherLine =
                  selectedAssetId !== "" &&
                  Object.entries(assignments).some(([lineId, assetId]) => lineId !== item.id && assetId === selectedAssetId);

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "space-y-3 rounded-[1.3rem] border p-4",
                      !selectedAssetId || selectedAssetUnavailable
                        ? "border-amber-500/22 bg-amber-500/6"
                        : "border-primary/12 bg-card",
                    )}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="font-display text-sm text-foreground glow-soft">
                          {index + 1}. {item.line_label}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                          {item.division_id && <span>{divisionMap[item.division_id] ?? "Division"}</span>}
                          {item.location_id && <span>{locationMap[item.location_id] ?? "Location"}</span>}
                          {item.notes && <span>{item.notes}</span>}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "w-fit uppercase tracking-[0.16em]",
                          selectedAssetId && !selectedAssetUnavailable
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "border-amber-500/25 bg-amber-500/10 text-amber-200",
                        )}
                      >
                        {selectedAssetId && !selectedAssetUnavailable ? "Assigned" : "Needs asset"}
                      </Badge>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                      <Button
                        type="button"
                        variant="outline"
                        className="justify-start border-primary/12 bg-background text-left text-foreground hover:bg-primary/8"
                        onClick={() => setActiveAssignmentLineId(item.id)}
                      >
                        {selectedAsset ? `Choose item | ${selectedAsset.code}${selectedAsset.serial_number ? ` | ${selectedAsset.serial_number}` : ""}` : "Choose exact item"}
                      </Button>

                      {selectedAsset && (
                        <div className="rounded-[1.1rem] border border-primary/12 bg-background/90 px-3 py-2 text-sm">
                          <div className="font-display text-foreground glow-soft">{selectedAsset.code}</div>
                          <div className="truncate text-[11px] text-muted-foreground">
                            {selectedAsset.serial_number || "No serial"} | {selectedAsset.name}
                          </div>
                        </div>
                      )}
                    </div>

                    {(selectedAssetUnavailable || selectedBlockedByOtherLine) && (
                      <div className="text-sm text-amber-200">
                        {selectedBlockedByOtherLine
                          ? "This item is already assigned to another line in the same group. Choose a different unit."
                          : "This assigned asset is no longer available. Replace it before completing the group."}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Signout notes</Label>
              <Textarea value={signoutNotes} onChange={(event) => setSignoutNotes(event.target.value)} placeholder="Optional notes for this group signout..." />
            </div>

            <Button type="button" onClick={submitBulkSignout} disabled={submitting || packetDirty} className="gap-2">
              <User2 size={16} /> {submitting ? "Processing..." : `Sign out group (${activePacketForSignout.items.length})`}
            </Button>
          </>
        )}
      </Card>

      <Dialog open={!!activeAssignmentLine} onOpenChange={(open) => !open && setActiveAssignmentLineId(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-card sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              {activeAssignmentLine ? `Choose exact unit | ${activeAssignmentLine.line_label}` : "Choose exact unit"}
            </DialogTitle>
          </DialogHeader>

          {activeAssignmentLine && (
            <div className="space-y-4">
              <div className="rounded-[1.2rem] border border-primary/12 bg-secondary/80 px-4 py-3 text-sm text-muted-foreground">
                Choose the exact physical unit by tag and serial number. Unavailable units stay visible but cannot be selected.
              </div>

              {assignmentCandidates.length === 0 ? (
                <div className="rounded-[1.2rem] border border-primary/12 bg-card px-4 py-10 text-center text-sm text-muted-foreground">
                  No matching units were found for this group line.
                </div>
              ) : (
                <div className="space-y-3">
                  {assignmentCandidates.map((asset) => {
                    const effectiveLocationId = asset.current_location_id ?? asset.department_id;
                    const normalizedStatus = normalizeAssetStatus(asset.status);
                    const blockedByOtherLine = assignedElsewhereIds.has(asset.id);
                    const unavailable = normalizedStatus !== "available";
                    const disabled = blockedByOtherLine || unavailable;

                    return (
                      <button
                        key={asset.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          updateAssignment(activeAssignmentLine.id, asset.id);
                          setActiveAssignmentLineId(null);
                        }}
                        className={cn(
                          "w-full rounded-[1.2rem] border p-4 text-left transition-all",
                          activeAssignedAssetId === asset.id
                            ? "border-primary/30 bg-primary/10"
                            : disabled
                              ? "cursor-not-allowed border-primary/10 bg-card opacity-70"
                              : "border-primary/10 bg-background hover:border-primary/24 hover:bg-primary/8",
                        )}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-display text-base text-foreground glow-soft">{asset.code}</span>
                              <Badge variant="outline" className={cn("uppercase tracking-[0.16em]", getStatusBadgeClass(normalizedStatus))}>
                                {getAssetStatusLabel(normalizedStatus)}
                              </Badge>
                            </div>
                            <div className="text-sm text-foreground/85">{asset.name}</div>
                            <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                              <span>Serial: {asset.serial_number || "-"}</span>
                              <span>{asset.division_id ? divisionMap[asset.division_id] ?? "Division" : "Division"}</span>
                              <span>{locationMap[effectiveLocationId] ?? "Location"}</span>
                            </div>
                          </div>
                          <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            {blockedByOtherLine ? "Already assigned" : unavailable ? "Unavailable" : "Selectable"}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
