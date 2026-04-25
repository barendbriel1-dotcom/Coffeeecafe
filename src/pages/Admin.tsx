import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ASSET_STATUSES, generateNameCode, getAssetStatusLabel, getStatusBadgeClass } from "@/lib/assets";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

type Role = "admin" | "staff" | "volunteer";
type ManagedStatus = "available" | "signed_out" | "out_for_repairs" | "damaged" | "not_assigned";

interface Profile {
  id: string;
  display_name: string;
  email: string | null;
}

interface UserRole {
  user_id: string;
  role: Role;
}

interface Loc {
  id: string;
  code: string;
  name: string;
}

interface Division {
  id: string;
  code: string | null;
  name: string;
}

interface AssetRow {
  id: string;
  code: string;
  name: string;
  serial_number: string | null;
  status: ManagedStatus;
  department_id: string;
  current_location_id: string | null;
  division_id: string | null;
}

interface AssetDeleteRequestRow {
  id: string;
  asset_id: string;
  requested_by: string;
  created_at: string;
}

const FALLBACK_NAME = "Not Assigned";
const FALLBACK_LOCATION_CODE = "N";
const FALLBACK_DIVISION_CODE = "NASS";

export default function Admin() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [locs, setLocs] = useState<Loc[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [newLocCode, setNewLocCode] = useState("");
  const [newLocName, setNewLocName] = useState("");
  const [newDivisionName, setNewDivisionName] = useState("");
  const [locationDrafts, setLocationDrafts] = useState<Record<string, { code: string; name: string }>>({});
  const [divisionDrafts, setDivisionDrafts] = useState<Record<string, { code: string; name: string }>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const [pendingDeleteRequests, setPendingDeleteRequests] = useState<AssetDeleteRequestRow[]>([]);
  const [requestingDelete, setRequestingDelete] = useState(false);
  const [approvingDelete, setApprovingDelete] = useState(false);
  const [cancellingDeleteId, setCancellingDeleteId] = useState<string | null>(null);
  const [assetToDeleteId, setAssetToDeleteId] = useState<string>("all");


  const load = async () => {
    const [
      { data: p },
      { data: r },
      { data: l },
      { data: divisionRows },
      { data: assetRows },
      { data: deleteRequestRows },
    ] = await Promise.all([
      supabase.from("profiles").select("id, display_name, email").order("display_name"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("locations").select("*").order("name"),
      supabase.from("divisions").select("*").order("name"),
      supabase.from("assets").select("*").order("name"),
      supabase.from("asset_delete_requests").select("id, asset_id, requested_by, created_at").order("created_at", { ascending: false }),
    ]);

    const nextLocs = (l ?? []) as Loc[];
    const nextDivisions = (divisionRows ?? []) as Division[];

    setProfiles(p ?? []);
    setUserRoles((r ?? []) as UserRole[]);
    setLocs(nextLocs);
    setDivisions(nextDivisions);
    setAssets((assetRows ?? []) as AssetRow[]);
    setPendingDeleteRequests((deleteRequestRows ?? []) as AssetDeleteRequestRow[]);
    setLocationDrafts(
      Object.fromEntries(nextLocs.map((location) => [location.id, { code: location.code, name: location.name }])),
    );
    setDivisionDrafts(
      Object.fromEntries(
        nextDivisions.map((division) => [division.id, { code: division.code ?? "", name: division.name }]),
      ),
    );
  };

  useEffect(() => {
    load();
  }, []);

  const rolesFor = (uid: string) => userRoles.filter((r) => r.user_id === uid).map((r) => r.role);

  const fallbackLocation = useMemo(
    () => locs.find((location) => location.name.toLowerCase() === FALLBACK_NAME.toLowerCase()) ?? null,
    [locs],
  );
  const fallbackDivision = useMemo(
    () => divisions.find((division) => division.name.toLowerCase() === FALLBACK_NAME.toLowerCase()) ?? null,
  );

  const isSuperAdmin = user?.email === "barend@encounterchurch.co.za";
  const divisionMap = useMemo(() => Object.fromEntries(divisions.map((division) => [division.id, division.name])), [divisions]);
  const locationMap = useMemo(() => Object.fromEntries(locs.map((location) => [location.id, location.name])), [locs]);
  const assetById = useMemo(() => Object.fromEntries(assets.map((asset) => [asset.id, asset])), [assets]);
  const pendingDeleteAssetIdSet = useMemo(() => new Set(pendingDeleteRequests.map((request) => request.asset_id)), [pendingDeleteRequests]);
  
  const pendingDeleteDetails = useMemo(
    () =>
      pendingDeleteRequests
        .map((request) => ({
          ...request,
          asset: assetById[request.asset_id],
        }))
        .filter((r) => r.asset),
    [pendingDeleteRequests, assetById],
  );

  const submitDeleteRequest = async () => {
    if (!assetToDeleteId || assetToDeleteId === "all") return;
    
    setRequestingDelete(true);
    try {
      const { error } = await supabase.from("asset_delete_requests").insert({
        asset_id: assetToDeleteId,
        requested_by: user!.id,
      });

      if (error) throw error;

      toast.success("Delete request submitted and is pending admin approval.");
      setAssetToDeleteId("all");
      await load();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to request deletion.");
    } finally {
      setRequestingDelete(false);
    }
  };

  const approveDeleteRequests = async (assetIds: string[]) => {
    if (!isSuperAdmin) return toast.error("Only barend@encounterchurch.co.za can approve deletions.");
    if (assetIds.length === 0) return;

    if (!window.confirm(`Permanently delete ${assetIds.length} asset(s)? This action cannot be undone.`)) {
      return;
    }

    setApprovingDelete(true);
    try {
      await supabase.from("signout_items").delete().in("asset_id", assetIds);
      await supabase.from("handover_items").delete().in("asset_id", assetIds);
      await supabase.from("asset_requests").delete().in("asset_id", assetIds);
      await supabase.from("asset_history").delete().in("asset_id", assetIds);
      await supabase.from("asset_delete_requests").delete().in("asset_id", assetIds);

      const { error } = await supabase.from("assets").delete().in("id", assetIds);
      if (error) throw error;

      toast.success(`Successfully permanently deleted ${assetIds.length} asset(s).`);
      await load();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to delete assets.");
    } finally {
      setApprovingDelete(false);
    }
  };

  const cancelDeleteRequest = async (requestId: string) => {
    setCancellingDeleteId(requestId);
    try {
      const { error } = await supabase.from("asset_delete_requests").delete().eq("id", requestId);
      if (error) throw error;

      toast.success("Delete request cancelled.");
      await load();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to cancel the delete request.");
    } finally {
      setCancellingDeleteId(null);
    }
  };

  const managedStatuses = ASSET_STATUSES.filter(
    (status): status is ManagedStatus =>
      ["available", "signed_out", "out_for_repairs", "damaged", "not_assigned"].includes(status),
  );

  const statusCounts = useMemo(
    () =>
      Object.fromEntries(
        managedStatuses.map((status) => [status, assets.filter((asset) => asset.status === status).length]),
      ) as Record<ManagedStatus, number>,
    [assets, managedStatuses],
  );

  const toggleRole = async (uid: string, role: Role) => {
    if (uid === user?.id && role === "admin" && rolesFor(uid).includes("admin")) {
      toast.error("Cannot remove your own admin role");
      return;
    }

    const has = rolesFor(uid).includes(role);
    if (has) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", role);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: uid, role });
      if (error) return toast.error(error.message);
    }

    toast.success("Roles updated");
    load();
  };

  const ensureFallbackLocation = async () => {
    if (fallbackLocation) return fallbackLocation;

    const { data, error } = await supabase
      .from("locations")
      .insert({ code: FALLBACK_LOCATION_CODE, name: FALLBACK_NAME, is_storage: true })
      .select("*")
      .single();

    if (error) throw error;
    return data as Loc;
  };

  const ensureFallbackDivision = async () => {
    if (fallbackDivision) return fallbackDivision;

    const { data, error } = await supabase
      .from("divisions")
      .insert({ code: FALLBACK_DIVISION_CODE, name: FALLBACK_NAME })
      .select("*")
      .single();

    if (error) throw error;
    return data as Division;
  };

  const addLoc = async () => {
    if (!newLocCode || !newLocName) return toast.error("Code and name required");
    if (newLocCode.length !== 1) return toast.error("Code must be 1 letter");
    const { error } = await supabase.from("locations").insert({ code: newLocCode.toUpperCase(), name: newLocName });
    if (error) return toast.error(error.message);
    setNewLocCode("");
    setNewLocName("");
    toast.success("Location added");
    load();
  };

  const saveLocation = async (locationId: string) => {
    const draft = locationDrafts[locationId];
    if (!draft?.name.trim() || !draft?.code.trim()) {
      toast.error("Location code and name are required");
      return;
    }

    const originalLocation = locs.find(l => l.id === locationId);
    if (originalLocation?.name.toLowerCase() === FALLBACK_NAME.toLowerCase() && draft.name.trim().toLowerCase() !== FALLBACK_NAME.toLowerCase()) {
      toast.error(`The ${FALLBACK_NAME} location cannot be renamed.`);
      return;
    }
    if (originalLocation?.name.toLowerCase() === "traveling" && draft.name.trim().toLowerCase() !== "traveling") {
      toast.error("The Traveling location cannot be renamed as it is required for the sign-out workflow.");
      return;
    }

    setBusyKey(`location-save-${locationId}`);
    const { error } = await supabase
      .from("locations")
      .update({ code: draft.code.trim().toUpperCase(), name: draft.name.trim() })
      .eq("id", locationId);
    setBusyKey(null);

    if (error) return toast.error(error.message);
    toast.success("Location updated");
    load();
  };

  const deleteLocation = async (location: Loc) => {
    if (location.name.toLowerCase() === FALLBACK_NAME.toLowerCase()) {
      toast.error(`The ${FALLBACK_NAME} location cannot be deleted.`);
      return;
    }
    if (location.name.toLowerCase() === "traveling") {
      toast.error("The Traveling location cannot be deleted as it is required for the sign-out workflow.");
      return;
    }

    if (!window.confirm(`Delete location "${location.name}" and move linked items to Not Assigned?`)) return;

    setBusyKey(`location-delete-${location.id}`);

    try {
      const fallback = await ensureFallbackLocation();

      const updates = [
        supabase.from("assets").update({ department_id: fallback.id } as any).eq("department_id", location.id),
        supabase.from("assets").update({ current_location_id: fallback.id } as any).eq("current_location_id", location.id),
        supabase.from("profiles").update({ department_id: fallback.id } as any).eq("department_id", location.id),
        supabase.from("signouts").update({ to_department_id: fallback.id } as any).eq("to_department_id", location.id),
        supabase.from("bulk_packet_items").update({ location_id: fallback.id } as any).eq("location_id", location.id),
      ];

      const results = await Promise.all(updates);
      const failed = results.find((result) => result.error);
      if (failed?.error) throw failed.error;

      const { error: deleteError } = await supabase.from("locations").delete().eq("id", location.id);
      if (deleteError) throw deleteError;

      toast.success(`Location deleted. Linked items were reassigned to ${FALLBACK_NAME}.`);
      await load();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to delete location");
    } finally {
      setBusyKey(null);
    }
  };

  const addDivision = async () => {
    const trimmedName = newDivisionName.trim();
    if (!trimmedName) return toast.error("Division name required");

    try {
      const code = generateNameCode(trimmedName, divisions.map((division) => division.code ?? ""), 4);
      const { error } = await supabase.from("divisions").insert({ code, name: trimmedName });
      if (error) throw error;
      toast.success("Division added");
      setNewDivisionName("");
      load();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to add division");
    }
  };

  const saveDivision = async (divisionId: string) => {
    const draft = divisionDrafts[divisionId];
    if (!draft?.name.trim()) {
      toast.error("Division name is required");
      return;
    }

    setBusyKey(`division-save-${divisionId}`);
    const { error } = await supabase
      .from("divisions")
      .update({ code: draft.code.trim().toUpperCase() || null, name: draft.name.trim() })
      .eq("id", divisionId);
    setBusyKey(null);

    if (error) return toast.error(error.message);
    toast.success("Division updated");
    load();
  };

  const deleteDivision = async (division: Division) => {
    if (division.name.toLowerCase() === FALLBACK_NAME.toLowerCase()) {
      toast.error("The Not Assigned division cannot be deleted.");
      return;
    }

    if (!window.confirm(`Delete division "${division.name}" and move linked items to Not Assigned?`)) return;

    setBusyKey(`division-delete-${division.id}`);

    try {
      const fallback = await ensureFallbackDivision();

      const results = await Promise.all([
        supabase.from("assets").update({ division_id: fallback.id } as any).eq("division_id", division.id),
        supabase.from("bulk_packet_items").update({ division_id: fallback.id } as any).eq("division_id", division.id),
      ]);

      const failed = results.find((result) => result.error);
      if (failed?.error) throw failed.error;

      const { error: deleteError } = await supabase.from("divisions").delete().eq("id", division.id);
      if (deleteError) throw deleteError;

      toast.success(`Division deleted. Linked items were reassigned to ${FALLBACK_NAME}.`);
      await load();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to delete division");
    } finally {
      setBusyKey(null);
    }
  };

  const moveStatusToFallback = async (status: ManagedStatus) => {
    if (status === "available") {
      toast.error("Available is the default status and cannot be deleted.");
      return;
    }

    if (status === "signed_out") {
      toast.error("Signed Out cannot be deleted because it is tied to active sign-out workflow.");
      return;
    }

    if (!window.confirm(`Move all assets with status "${getAssetStatusLabel(status)}" to Available?`)) return;

    setBusyKey(`status-delete-${status}`);
    const { error } = await supabase.from("assets").update({ status: "available" } as any).eq("status", status);
    setBusyKey(null);

    if (error) return toast.error(error.message);
    toast.success(`${getAssetStatusLabel(status)} was cleared. Linked items now use Available.`);
    load();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="font-display text-3xl text-foreground glow-soft">Admin</h1>

      <Tabs defaultValue="pending">
        <TabsList className="bg-card border border-primary/30">
          <TabsTrigger value="pending" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary relative">
            Pending Approval
            {profiles.filter((p) => rolesFor(p.id).length === 0).length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Users & Roles</TabsTrigger>
          <TabsTrigger value="statuses" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Statuses</TabsTrigger>
          <TabsTrigger value="locs" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Locations</TabsTrigger>
          <TabsTrigger value="divisions" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Divisions</TabsTrigger>
          <TabsTrigger value="deletions" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Deletions</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-2 mt-4">
          <div className="text-xs text-muted-foreground mb-4 uppercase tracking-widest px-1">
            Pending operator approval
          </div>
          {profiles.filter((p) => rolesFor(p.id).length === 0).length === 0 ? (
            <div className="py-12 text-center font-mono text-sm text-muted-foreground/50 border border-dashed border-primary/20 rounded-[1.4rem]">
              No pending requests
            </div>
          ) : (
            profiles.filter((p) => rolesFor(p.id).length === 0).map((p) => (
              <Card key={p.id} className="bg-card/40 border-primary/20 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm text-primary truncate">{p.display_name}</div>
                  <div className="text-xs text-muted-foreground truncate">{p.email}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => toggleRole(p.id, "volunteer")}>Approve as Volunteer</Button>
                  <Button size="sm" variant="outline" onClick={() => toggleRole(p.id, "staff")}>Approve as Staff</Button>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-2 mt-4">
          {profiles.filter((p) => rolesFor(p.id).length > 0).map((p) => (
            <Card key={p.id} className="bg-card/40 border-primary/20 p-3 flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm text-primary truncate">{p.display_name}</div>
                <div className="text-xs text-muted-foreground truncate">{p.email}</div>
              </div>
              <div className="flex gap-1 flex-wrap">
                {(["admin", "staff", "volunteer"] as Role[]).map((r) => {
                  const active = rolesFor(p.id).includes(r);
                  return (
                    <Badge
                      key={r}
                      variant="outline"
                      onClick={() => toggleRole(p.id, r)}
                      className={cn(
                        "cursor-pointer uppercase text-[10px]",
                        active ? "bg-primary text-primary-foreground border-primary" : "border-primary/30 text-muted-foreground",
                      )}
                    >
                      {r}
                    </Badge>
                  );
                })}
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="statuses" className="space-y-3 mt-4">
          <Card className="bg-card/40 border-primary/30 p-4 text-sm text-muted-foreground">
            Core workflow statuses stay in the system. From here, admin can delete a status usage, moving all linked items back into 
            <span className="text-foreground"> Available</span>. Signed Out is protected because it is linked to the live sign-out process.
          </Card>

          <div className="grid gap-3">
            {managedStatuses.map((status) => (
              <Card key={status} className="bg-card/40 border-primary/20 p-4 space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={cn("uppercase tracking-[0.16em]", getStatusBadgeClass(status))}>
                      {getAssetStatusLabel(status)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{statusCounts[status]} item{statusCounts[status] === 1 ? "" : "s"}</span>
                  </div>
                  {(status === "signed_out" || status === "available") && (
                    <span className="text-xs text-amber-300 uppercase tracking-[0.16em]">Protected workflow status</span>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => moveStatusToFallback(status)}
                    disabled={busyKey === `status-delete-${status}` || status === "available" || status === "signed_out"}
                  >
                    {busyKey === `status-delete-${status}` ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="locs" className="space-y-3 mt-4">
          <Card className="bg-card/40 border-primary/30 p-4 space-y-3">
            <h3 className="font-display text-primary text-sm uppercase">Add Location</h3>
            <div className="flex gap-2">
              <div className="w-20">
                <Label>Code</Label>
                <Input maxLength={1} value={newLocCode} onChange={(e) => setNewLocCode(e.target.value)} className="text-center font-display uppercase" />
              </div>
              <div className="flex-1">
                <Label>Name</Label>
                <Input value={newLocName} onChange={(e) => setNewLocName(e.target.value)} maxLength={80} />
              </div>
              <div className="self-end">
                <Button onClick={addLoc}>Add</Button>
              </div>
            </div>
          </Card>

          <div className="grid gap-3">
            {locs.map((location) => {
              const draft = locationDrafts[location.id] ?? { code: location.code, name: location.name };
              return (
                <Card key={location.id} className="bg-card/40 border-primary/20 p-4 space-y-3">
                  <div className="grid gap-3 md:grid-cols-[90px_minmax(0,1fr)_auto_auto]">
                    <div className="space-y-1">
                      <Label>Code</Label>
                      <Input
                        maxLength={1}
                        value={draft.code}
                        onChange={(e) =>
                          setLocationDrafts((current) => ({
                            ...current,
                            [location.id]: { ...draft, code: e.target.value },
                          }))
                        }
                        className="text-center font-display uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Name</Label>
                      <Input
                        value={draft.name}
                        onChange={(e) =>
                          setLocationDrafts((current) => ({
                            ...current,
                            [location.id]: { ...draft, name: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="self-end">
                      <Button type="button" variant="outline" onClick={() => saveLocation(location.id)} disabled={busyKey === `location-save-${location.id}`}>
                        {busyKey === `location-save-${location.id}` ? "Saving..." : "Save"}
                      </Button>
                    </div>
                    <div className="self-end">
                      <Button type="button" onClick={() => deleteLocation(location)} disabled={busyKey === `location-delete-${location.id}`}>
                        {busyKey === `location-delete-${location.id}` ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="divisions" className="space-y-3 mt-4">
          <Card className="bg-card/40 border-primary/30 p-4 space-y-3">
            <h3 className="font-display text-primary text-sm uppercase">Add Division</h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label>Name</Label>
                <Input value={newDivisionName} onChange={(e) => setNewDivisionName(e.target.value)} maxLength={80} />
              </div>
              <div className="self-end">
                <Button onClick={addDivision}>Add</Button>
              </div>
            </div>
          </Card>

          <div className="grid gap-3">
            {divisions.map((division) => {
              const draft = divisionDrafts[division.id] ?? { code: division.code ?? "", name: division.name };
              return (
                <Card key={division.id} className="bg-card/40 border-primary/20 p-4 space-y-3">
                  <div className="grid gap-3 md:grid-cols-[120px_minmax(0,1fr)_auto_auto]">
                    <div className="space-y-1">
                      <Label>Code</Label>
                      <Input
                        value={draft.code}
                        onChange={(e) =>
                          setDivisionDrafts((current) => ({
                            ...current,
                            [division.id]: { ...draft, code: e.target.value },
                          }))
                        }
                        className="font-display uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Name</Label>
                      <Input
                        value={draft.name}
                        onChange={(e) =>
                          setDivisionDrafts((current) => ({
                            ...current,
                            [division.id]: { ...draft, name: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="self-end">
                      <Button type="button" variant="outline" onClick={() => saveDivision(division.id)} disabled={busyKey === `division-save-${division.id}`}>
                        {busyKey === `division-save-${division.id}` ? "Saving..." : "Save"}
                      </Button>
                    </div>
                    <div className="self-end">
                      <Button type="button" onClick={() => deleteDivision(division)} disabled={busyKey === `division-delete-${division.id}`}>
                        {busyKey === `division-delete-${division.id}` ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="deletions" className="space-y-4 mt-4">
          <Card className="bg-card/40 border-primary/30 p-4 space-y-4">
            <div>
              <h3 className="font-display text-primary text-sm uppercase">Request Asset Deletion</h3>
              <p className="text-xs text-muted-foreground mt-1">Select an asset to request its deletion. Only the Super Admin can approve.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={assetToDeleteId} onValueChange={setAssetToDeleteId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Search or select an asset..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">-- Select an asset --</SelectItem>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      [{asset.code}] {asset.name} {asset.serial_number ? `(${asset.serial_number})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                type="button" 
                onClick={submitDeleteRequest} 
                disabled={requestingDelete || assetToDeleteId === "all" || !assetToDeleteId}
              >
                <Trash2 size={16} className="mr-2" />
                {requestingDelete ? "Requesting..." : "Request Deletion"}
              </Button>
            </div>
          </Card>

          <Card className="bg-card/40 border-primary/30 p-4 space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="font-display text-primary text-sm uppercase">Pending Delete Approvals</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Review the requested assets below. Only barend@encounterchurch.co.za can approve the final deletion.
                </p>
              </div>
              {isSuperAdmin && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => approveDeleteRequests(pendingDeleteDetails.map((request) => request.asset_id))}
                  disabled={pendingDeleteDetails.length === 0 || approvingDelete}
                >
                  {approvingDelete ? "Approving..." : "Approve all pending"}
                </Button>
              )}
            </div>

            {pendingDeleteDetails.length === 0 ? (
              <div className="rounded-[1.2rem] border border-primary/10 bg-background px-4 py-8 text-center text-sm text-muted-foreground">
                No assets are waiting for delete approval.
              </div>
            ) : (
              <div className="overflow-hidden rounded-[1.4rem] border border-primary/12">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-primary/12 text-left font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        <th className="px-4 py-3 font-normal">Tag</th>
                        <th className="px-4 py-3 font-normal">Item Name</th>
                        <th className="px-4 py-3 font-normal">Requested By</th>
                        <th className="px-4 py-3 font-normal">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10">
                      {pendingDeleteDetails.map((request) => {
                        const asset = request.asset!;
                        const requestedLabel = request.requested_by === user?.id ? "You" : "Admin";

                        return (
                          <tr key={request.id} className="transition-colors hover:bg-primary/5">
                            <td className="px-4 py-3 font-mono text-foreground/85">{asset?.code}</td>
                            <td className="px-4 py-3 text-foreground">{asset?.name}</td>
                            <td className="px-4 py-3 text-muted-foreground">{requestedLabel}</td>
                            <td className="px-4 py-3 flex gap-2">
                              {isSuperAdmin && (
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => approveDeleteRequests([asset!.id])}
                                  disabled={approvingDelete}
                                >
                                  Approve
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 border-primary/20 text-xs hover:border-primary/50"
                                onClick={() => cancelDeleteRequest(request.id)}
                                disabled={cancellingDeleteId === request.id}
                              >
                                {cancellingDeleteId === request.id ? "Cancelling..." : "Cancel"}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
