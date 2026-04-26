import { useEffect, useMemo, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, Check, CheckSquare, Download, FileText, MapPin, PackageSearch, QrCode, Search, Shield, Square, Trash2, UserCheck, Users2, Wrench, X } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { ASSET_STATUSES, generateNameCode, getAssetStatusLabel, getStatusBadgeClass } from "@/lib/assets";
import { exportDamageReportPdf } from "@/lib/pdf";
import { exportAssetQrPdf, type AssetQrLabel } from "@/lib/qr";
import { cn } from "@/lib/utils";

type Role = "admin" | "staff" | "volunteer" | "asset_manager";
type ManagedStatus = "available" | "signed_out" | "out_for_repairs" | "damaged" | "not_assigned";
type AdminSection = "pending-approvals" | "users-roles" | "status" | "locations" | "divisions" | "qrcodes" | "deletions" | "unassigned" | "damage-reports";

interface Profile {
  id: string;
  display_name: string;
  email: string | null;
  asset_manager_location_id: string | null;
}

interface UserRole {
  user_id: string;
  role: Role;
}

interface Loc {
  id: string;
  code: string;
  name: string;
  is_storage?: boolean;
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

interface DamageReport {
  id: string;
  asset_id: string;
  asset_code: string;
  asset_name: string;
  assigned_to: string;
  reported_by: string;
  description: string | null;
  damaged_date: string | null;
  damaged_time: string | null;
  damage_type: string | null;
  other_details: string | null;
  admin_conclusion_notes: string | null;
  admin_conclusion_status: ManagedStatus | null;
  status: "pending" | "completed" | "concluded";
  created_at: string;
  completed_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

interface AssetRequestRow {
  id: string;
  requested_by: string;
  asset_id: string | null;
  item_description: string | null;
  needed_for: string | null;
  needed_by: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const FALLBACK_NAME = "Not Assigned";
const FALLBACK_LOCATION_CODE = "N";
const FALLBACK_DIVISION_CODE = "NASS";
const ROLE_OPTIONS: Role[] = ["admin", "staff", "volunteer", "asset_manager"];
const DEFAULT_ADMIN_SECTION: AdminSection = "pending-approvals";

const ADMIN_SECTIONS: { id: AdminSection; label: string; icon: typeof Shield }[] = [
  { id: "pending-approvals", label: "Pending Approvals", icon: UserCheck },
  { id: "users-roles", label: "Users & Roles", icon: Users2 },
  { id: "status", label: "Status", icon: Shield },
  { id: "locations", label: "Locations", icon: MapPin },
  { id: "divisions", label: "Divisions", icon: Wrench },
  { id: "qrcodes", label: "QR Codes", icon: QrCode },
  { id: "damage-reports", label: "Damage Reports", icon: AlertTriangle },
  { id: "deletions", label: "Deletions", icon: Trash2 },
  { id: "unassigned", label: "Unassigned", icon: PackageSearch },
];

const REQUEST_STATUS_CLASS: Record<string, string> = {
  pending: "border-yellow-500/40 text-yellow-400 bg-yellow-500/10",
  approved: "border-primary/40 text-primary bg-primary/10",
  rejected: "border-destructive/40 text-destructive bg-destructive/10",
  fulfilled: "border-cyan-500/40 text-cyan-300 bg-cyan-500/10",
};

const roleLabel = (role: Role) => (role === "asset_manager" ? "Assets Manager" : role.replace("_", " "));

const parseAdminSection = (value: string | null): AdminSection => {
  const match = ADMIN_SECTIONS.find((section) => section.id === value);
  return match?.id ?? DEFAULT_ADMIN_SECTION;
};

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSection = parseAdminSection(searchParams.get("section"));

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [locs, setLocs] = useState<Loc[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [damageReports, setDamageReports] = useState<DamageReport[]>([]);
  const [assetRequests, setAssetRequests] = useState<AssetRequestRow[]>([]);
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
  const [deleteSearch, setDeleteSearch] = useState("");
  const [stagedForDelete, setStagedForDelete] = useState<AssetRow[]>([]);
  const [qrSearch, setQrSearch] = useState("");
  const [qrStatusFilter, setQrStatusFilter] = useState<ManagedStatus | "all">("all");
  const [qrLocationFilter, setQrLocationFilter] = useState("all");
  const [qrDivisionFilter, setQrDivisionFilter] = useState("all");
  const [qrSelectedIds, setQrSelectedIds] = useState<Set<string>>(new Set());
  const [qrExportingMode, setQrExportingMode] = useState<"selected" | "filtered" | null>(null);
  const [assetManagerTarget, setAssetManagerTarget] = useState<Profile | null>(null);
  const [assetManagerLocationDraft, setAssetManagerLocationDraft] = useState("none");
  const [assetManagerSaving, setAssetManagerSaving] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<Profile | null>(null);
  const [assetRequestBusyId, setAssetRequestBusyId] = useState<string | null>(null);
  const [unassignedSearch, setUnassignedSearch] = useState("");
  const [unassignedLocationFilter, setUnassignedLocationFilter] = useState("all");
  const [unassignedStatusFilter, setUnassignedStatusFilter] = useState<ManagedStatus | "all">("all");
  const [unassignedDivisionFilter, setUnassignedDivisionFilter] = useState("all");
  const [unassignedSelectedIds, setUnassignedSelectedIds] = useState<Set<string>>(new Set());
  const [unassignedDraftDivisionId, setUnassignedDraftDivisionId] = useState("skip");
  const [unassignedDraftStatus, setUnassignedDraftStatus] = useState<ManagedStatus | "skip">("skip");
  const [unassignedDraftLocationId, setUnassignedDraftLocationId] = useState("skip");
  const [unassignedApplying, setUnassignedApplying] = useState(false);
  const [concludingReport, setConcludingReport] = useState<DamageReport | null>(null);
  const [conclusionNotes, setConclusionNotes] = useState("");
  const [conclusionStatus, setConclusionStatus] = useState<ManagedStatus>("available");
  const [concludingBusy, setConcludingBusy] = useState(false);
  const [deletingDamageReportId, setDeletingDamageReportId] = useState<string | null>(null);

  const setSection = (section: AdminSection) => {
    const next = new URLSearchParams(searchParams);
    next.set("section", section);
    setSearchParams(next, { replace: true });
  };

  const load = async () => {
    const [
      { data: p },
      { data: r },
      { data: l },
      { data: divisionRows },
      { data: assetRows },
      { data: deleteRequestRows },
      { data: requestRows },
      { data: damageRows },
    ] = await Promise.all([
      supabase.from("profiles").select("id, display_name, email, asset_manager_location_id").order("display_name"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("locations").select("*").order("name"),
      supabase.from("divisions").select("*").order("name"),
      supabase.from("assets").select("*").order("name"),
      supabase.from("asset_delete_requests").select("id, asset_id, requested_by, created_at").order("created_at", { ascending: false }),
      supabase.from("asset_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("damage_reports").select("*").order("created_at", { ascending: false }),
    ]);

    const nextLocs = (l ?? []) as Loc[];
    const nextDivisions = (divisionRows ?? []) as Division[];

    setProfiles((p ?? []) as Profile[]);
    setUserRoles((r ?? []) as UserRole[]);
    setLocs(nextLocs);
    setDivisions(nextDivisions);
    setAssets((assetRows ?? []) as AssetRow[]);
    setDamageReports((damageRows ?? []) as DamageReport[]);
    setPendingDeleteRequests((deleteRequestRows ?? []) as AssetDeleteRequestRow[]);
    setAssetRequests((requestRows ?? []) as AssetRequestRow[]);
    setLocationDrafts(Object.fromEntries(nextLocs.map((location) => [location.id, { code: location.code, name: location.name }])));
    setDivisionDrafts(Object.fromEntries(nextDivisions.map((division) => [division.id, { code: division.code ?? "", name: division.name }])));
  };

  useEffect(() => {
    if (isAdmin) {
      void load();
    }
  }, [isAdmin]);

  const rolesFor = (uid: string) => userRoles.filter((role) => role.user_id === uid).map((role) => role.role);
  const pendingUsers = useMemo(() => profiles.filter((profile) => rolesFor(profile.id).length === 0), [profiles, userRoles]);
  const approvedUsers = useMemo(() => profiles.filter((profile) => rolesFor(profile.id).length > 0), [profiles, userRoles]);
  const pendingAssetRequests = useMemo(() => assetRequests.filter((request) => request.status === "pending"), [assetRequests]);
  const fallbackLocation = useMemo(() => locs.find((location) => location.name.toLowerCase() === FALLBACK_NAME.toLowerCase()) ?? null, [locs]);
  const fallbackDivision = useMemo(() => divisions.find((division) => division.name.toLowerCase() === FALLBACK_NAME.toLowerCase()) ?? null, [divisions]);
  const isSuperAdmin = user?.email === "barend@encounterchurch.co.za";
  const divisionMap = useMemo(() => Object.fromEntries(divisions.map((division) => [division.id, division.name])), [divisions]);
  const locationMap = useMemo(() => Object.fromEntries(locs.map((location) => [location.id, location.name])), [locs]);
  const profileMap = useMemo(() => Object.fromEntries(profiles.map((profile) => [profile.id, profile.display_name])), [profiles]);
  const assetById = useMemo(() => Object.fromEntries(assets.map((asset) => [asset.id, asset])), [assets]);
  const pendingDeleteAssetIdSet = useMemo(() => new Set(pendingDeleteRequests.map((request) => request.asset_id)), [pendingDeleteRequests]);
  const visibleDamageReports = useMemo(
    () => damageReports.filter((report) => report.status === "pending" || report.status === "completed" || !!report.admin_conclusion_status),
    [damageReports],
  );

  const pendingDeleteDetails = useMemo(
    () =>
      pendingDeleteRequests
        .map((request) => ({
          ...request,
          asset: assetById[request.asset_id],
        }))
        .filter((row) => row.asset),
    [pendingDeleteRequests, assetById],
  );

  const submitDeleteRequest = async () => {
    if (stagedForDelete.length === 0 || !user) return;

    setRequestingDelete(true);
    try {
      const { error } = await supabase.from("asset_delete_requests").insert(
        stagedForDelete.map((asset) => ({
          asset_id: asset.id,
          requested_by: user.id,
        })),
      );

      if (error) throw error;

      toast.success(`${stagedForDelete.length} delete request(s) submitted for admin approval.`);
      setStagedForDelete([]);
      setDeleteSearch("");
      await load();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to request deletion.");
    } finally {
      setRequestingDelete(false);
    }
  };

  const deleteSearchResults = useMemo(() => {
    const q = deleteSearch.trim().toLowerCase();
    if (!q) return [];
    const stagedIds = new Set(stagedForDelete.map((asset) => asset.id));
    return assets
      .filter(
        (asset) =>
          !stagedIds.has(asset.id) &&
          !pendingDeleteAssetIdSet.has(asset.id) &&
          (asset.name.toLowerCase().includes(q) ||
            asset.code.toLowerCase().includes(q) ||
            (asset.serial_number ?? "").toLowerCase().includes(q)),
      )
      .slice(0, 8);
  }, [assets, deleteSearch, pendingDeleteAssetIdSet, stagedForDelete]);

  const qrFilteredAssets = useMemo(() => {
    const q = qrSearch.trim().toLowerCase();
    return assets.filter((asset) => {
      const locationName = locationMap[asset.current_location_id ?? asset.department_id] ?? "";
      const divisionName = asset.division_id ? divisionMap[asset.division_id] ?? "" : "";
      const matchesSearch =
        !q ||
        [asset.name, asset.code, asset.serial_number ?? "", locationName, divisionName, getAssetStatusLabel(asset.status)].some((part) =>
          part.toLowerCase().includes(q),
        );
      const matchesStatus = qrStatusFilter === "all" || asset.status === qrStatusFilter;
      const matchesLocation = qrLocationFilter === "all" || (asset.current_location_id ?? asset.department_id) === qrLocationFilter;
      const matchesDivision = qrDivisionFilter === "all" || asset.division_id === qrDivisionFilter;
      return matchesSearch && matchesStatus && matchesLocation && matchesDivision;
    });
  }, [assets, divisionMap, locationMap, qrDivisionFilter, qrLocationFilter, qrSearch, qrStatusFilter]);

  const allQrFilteredSelected =
    qrFilteredAssets.length > 0 && qrFilteredAssets.every((asset) => qrSelectedIds.has(asset.id));

  const buildQrLabels = (rows: AssetRow[]): AssetQrLabel[] =>
    rows.map((asset) => ({
      id: asset.id,
      assetId: asset.id,
      name: asset.name,
      code: asset.code,
      serialNumber: asset.serial_number,
    }));

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

  const toggleQrAsset = (assetId: string) => {
    setQrSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  };

  const toggleAllQrFiltered = () => {
    setQrSelectedIds((current) => {
      const next = new Set(current);
      if (allQrFilteredSelected) {
        qrFilteredAssets.forEach((asset) => next.delete(asset.id));
      } else {
        qrFilteredAssets.forEach((asset) => next.add(asset.id));
      }
      return next;
    });
  };

  const exportQrCodes = async (mode: "selected" | "filtered") => {
    const sourceRows = mode === "selected" ? assets.filter((asset) => qrSelectedIds.has(asset.id)) : qrFilteredAssets;

    if (sourceRows.length === 0) {
      toast.error("No assets are available for QR export.");
      return;
    }

    setQrExportingMode(mode);
    try {
      await exportAssetQrPdf(
        buildQrLabels(sourceRows),
        mode === "selected" ? "selected-asset-qr-codes.pdf" : "filtered-asset-qr-codes.pdf",
      );
      toast.success(`Downloaded ${sourceRows.length} QR code label${sourceRows.length === 1 ? "" : "s"}.`);
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to export QR codes.");
    } finally {
      setQrExportingMode(null);
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

  const openAssetManagerDialog = (profile: Profile) => {
    setAssetManagerTarget(profile);
    setAssetManagerLocationDraft(profile.asset_manager_location_id ?? "none");
  };

  const assignSingleRole = async (uid: string, role: Role, assetManagerLocationId?: string | null) => {
    if (uid === user?.id && role === "admin" && rolesFor(uid).includes("admin")) {
      toast.error("Cannot remove your own admin role");
      return false;
    }

    if (role === "asset_manager" && (!assetManagerLocationId || assetManagerLocationId === "none")) {
      toast.error("Choose the location for this Assets Manager first.");
      return false;
    }

    setBusyKey(`role-${uid}`);

    try {
      const { error } = await supabase.rpc("admin_assign_user_role", {
        target_user_id: uid,
        next_role: role,
        next_asset_manager_location_id: role === "asset_manager" ? assetManagerLocationId ?? null : null,
      });
      if (error) throw error;

      toast.success("Role updated");
      await load();
      return true;
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to update role");
      return false;
    } finally {
      setBusyKey(null);
    }
  };

  const saveAssetManagerRole = async () => {
    if (!assetManagerTarget) return;

    setAssetManagerSaving(true);
    const saved = await assignSingleRole(assetManagerTarget.id, "asset_manager", assetManagerLocationDraft);
    setAssetManagerSaving(false);
    if (saved) {
      setAssetManagerTarget(null);
    }
  };

  const deleteUser = async () => {
    if (!deleteUserTarget) return;

    setDeletingUserId(deleteUserTarget.id);
    const { error } = await supabase.rpc("admin_delete_user", { target_user_id: deleteUserTarget.id });

    if (error) {
      toast.error(error.message);
      setDeletingUserId(null);
      return;
    }

    toast.success("User deleted");
    setDeleteUserTarget(null);
    setDeletingUserId(null);
    await load();
  };

  const reviewAssetRequest = async (request: AssetRequestRow, status: "approved" | "rejected") => {
    setAssetRequestBusyId(request.id);
    try {
      if (status === "approved") {
        const { error } = await supabase.rpc("approve_asset_request", { target_request_id: request.id, admin_notes: null });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("asset_requests")
          .update({
            status,
            reviewed_by: user!.id,
            reviewed_at: new Date().toISOString(),
            admin_notes: null,
          })
          .eq("id", request.id);
        if (error) throw error;
      }

      toast.success(`Request ${status}`);
      await load();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to process request");
    } finally {
      setAssetRequestBusyId(null);
    }
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
    await load();
  };

  const saveLocation = async (locationId: string) => {
    const draft = locationDrafts[locationId];
    if (!draft?.name.trim() || !draft?.code.trim()) {
      toast.error("Location code and name are required");
      return;
    }

    const originalLocation = locs.find((location) => location.id === locationId);
    if (
      originalLocation?.name.toLowerCase() === FALLBACK_NAME.toLowerCase() &&
      draft.name.trim().toLowerCase() !== FALLBACK_NAME.toLowerCase()
    ) {
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
    await load();
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

      const results = await Promise.all([
        supabase.from("assets").update({ department_id: fallback.id } as any).eq("department_id", location.id),
        supabase.from("assets").update({ current_location_id: fallback.id } as any).eq("current_location_id", location.id),
        supabase.from("profiles").update({ department_id: fallback.id } as any).eq("department_id", location.id),
        supabase.from("profiles").update({ asset_manager_location_id: fallback.id } as any).eq("asset_manager_location_id", location.id),
        supabase.from("signouts").update({ to_department_id: fallback.id } as any).eq("to_department_id", location.id),
        supabase.from("bulk_packet_items").update({ location_id: fallback.id } as any).eq("location_id", location.id),
      ]);

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
      await load();
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
    await load();
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
    if (status === "not_assigned") {
      toast.error("Not Assigned is already the fallback status.");
      return;
    }

    if (!window.confirm(`Delete "${getAssetStatusLabel(status)}" usage and move all linked items to Not Assigned?`)) return;

    setBusyKey(`status-delete-${status}`);
    const { error } = await supabase.from("assets").update({ status: "not_assigned" } as any).eq("status", status);
    setBusyKey(null);

    if (error) return toast.error(error.message);
    toast.success(`${getAssetStatusLabel(status)} was deleted. Linked items now use Not Assigned.`);
    await load();
  };

  const unassignedAssets = useMemo(() => {
    const q = unassignedSearch.trim().toLowerCase();
    const fallbackDivisionId = fallbackDivision?.id ?? null;
    const fallbackLocationId = fallbackLocation?.id ?? null;

    return assets.filter((asset) => {
      const effectiveLocationId = asset.current_location_id ?? asset.department_id;
      const isUnassigned =
        asset.status === "not_assigned" ||
        asset.division_id === fallbackDivisionId ||
        effectiveLocationId === fallbackLocationId;

      if (!isUnassigned) return false;

      const divisionName = asset.division_id ? divisionMap[asset.division_id] ?? "" : "";
      const locationName = locationMap[effectiveLocationId] ?? "";
      const matchesSearch =
        !q || [asset.code, asset.name, asset.serial_number ?? "", divisionName, locationName].some((part) => part.toLowerCase().includes(q));
      const matchesStatus = unassignedStatusFilter === "all" || asset.status === unassignedStatusFilter;
      const matchesLocation = unassignedLocationFilter === "all" || effectiveLocationId === unassignedLocationFilter;
      const matchesDivision = unassignedDivisionFilter === "all" || asset.division_id === unassignedDivisionFilter;

      return matchesSearch && matchesStatus && matchesLocation && matchesDivision;
    });
  }, [assets, divisionMap, fallbackDivision?.id, fallbackLocation?.id, locationMap, unassignedDivisionFilter, unassignedLocationFilter, unassignedSearch, unassignedStatusFilter]);

  const allUnassignedSelected =
    unassignedAssets.length > 0 && unassignedAssets.every((asset) => unassignedSelectedIds.has(asset.id));

  const toggleUnassignedAsset = (assetId: string) => {
    setUnassignedSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  };

  const toggleAllUnassigned = () => {
    setUnassignedSelectedIds((current) => {
      const next = new Set(current);
      if (allUnassignedSelected) {
        unassignedAssets.forEach((asset) => next.delete(asset.id));
      } else {
        unassignedAssets.forEach((asset) => next.add(asset.id));
      }
      return next;
    });
  };

  const applyUnassignedFixes = async () => {
    const selectedIds = Array.from(unassignedSelectedIds);
    if (selectedIds.length === 0) {
      toast.error("Select at least one item to update.");
      return;
    }
    if (unassignedDraftDivisionId === "skip" && unassignedDraftStatus === "skip" && unassignedDraftLocationId === "skip") {
      toast.error("Choose at least one field to update.");
      return;
    }

    const payload: Record<string, any> = {};
    if (unassignedDraftDivisionId !== "skip") payload.division_id = unassignedDraftDivisionId === "none" ? null : unassignedDraftDivisionId;
    if (unassignedDraftStatus !== "skip") payload.status = unassignedDraftStatus;
    if (unassignedDraftLocationId !== "skip") payload.department_id = unassignedDraftLocationId;

    setUnassignedApplying(true);
    try {
      const { error } = await supabase.from("assets").update(payload as any).in("id", selectedIds);
      if (error) throw error;

      toast.success(`Updated ${selectedIds.length} asset${selectedIds.length === 1 ? "" : "s"}.`);
      setUnassignedSelectedIds(new Set());
      setUnassignedDraftDivisionId("skip");
      setUnassignedDraftStatus("skip");
      setUnassignedDraftLocationId("skip");
      await load();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to update unassigned items.");
    } finally {
      setUnassignedApplying(false);
    }
  };

  const submitConclusion = async () => {
    if (!concludingReport || !user) return;

    setConcludingBusy(true);
    try {
      // 1. Update the damage report with conclusion
      const { error: reportError } = await supabase
        .from("damage_reports")
        .update({
          admin_conclusion_notes: conclusionNotes.trim(),
          admin_conclusion_status: conclusionStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq("id", concludingReport.id);

      if (reportError) throw reportError;

      // 2. Update the asset status
      const { error: assetError } = await supabase
        .from("assets")
        .update({ status: conclusionStatus } as any)
        .eq("id", concludingReport.asset_id);

      if (assetError) throw assetError;

      toast.success("Conclusion submitted and item status updated.");
      setConcludingReport(null);
      setConclusionNotes("");
      await load();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to submit conclusion.");
    } finally {
      setConcludingBusy(false);
    }
  };

  const deleteDamageReport = async (report: DamageReport) => {
    if (!window.confirm(`Delete the damage report for ${report.asset_code}? The asset timeline will keep a note showing who had the item.`)) {
      return;
    }

    setDeletingDamageReportId(report.id);
    try {
      const damageType = report.damage_type || "Damage";
      const damagedWhen = report.damaged_date
        ? `${new Date(report.damaged_date).toLocaleDateString()}${report.damaged_time ? ` ${report.damaged_time}` : ""}`
        : new Date(report.created_at).toLocaleDateString();
      const assignedName = profileMap[report.assigned_to] ?? "Unknown user";
      const notes = [
        "Damage report deleted by admin. Asset remains marked as having a damage incident.",
        `User at time: ${assignedName}.`,
        `Type: ${damageType}${report.other_details ? ` (${report.other_details})` : ""}.`,
        `Date: ${damagedWhen}.`,
        report.admin_conclusion_status ? `Resolution: ${report.admin_conclusion_status.replace(/_/g, " ")}.` : "",
        report.admin_conclusion_notes ? `Admin notes: ${report.admin_conclusion_notes}` : "",
      ]
        .filter(Boolean)
        .join(" ");

      const { error: historyError } = await supabase.from("asset_history").insert({
        asset_id: report.asset_id,
        action: "marked_damaged",
        performed_by: user?.id ?? report.reported_by,
        from_user: report.assigned_to,
        notes,
      });

      if (historyError) throw historyError;

      const { error: deleteError } = await supabase.from("damage_reports" as any).delete().eq("id", report.id);
      if (deleteError) throw deleteError;

      toast.success("Damage report deleted. The asset timeline still keeps the damage note.");
      await load();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to delete damage report.");
    } finally {
      setDeletingDamageReportId(null);
    }
  };

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-2 rounded-[1.8rem] border border-primary/16 bg-card/60 p-3 lg:sticky lg:top-28 lg:self-start">
          {ADMIN_SECTIONS.map((section) => {
            const active = currentSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setSection(section.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[1.2rem] px-4 py-3 text-left transition-colors",
                  active
                    ? "border border-primary/24 bg-primary/12 text-primary shadow-[0_0_24px_hsl(var(--primary)/0.08)]"
                    : "border border-transparent text-muted-foreground hover:bg-primary/6 hover:text-foreground",
                )}
              >
                <section.icon size={16} className="shrink-0" />
                <div className="min-w-0">
                  <div className="truncate font-display text-sm">{section.label}</div>
                </div>
              </button>
            );
          })}
        </aside>

        <section className="min-w-0 space-y-5">
          {currentSection === "pending-approvals" && (
            <div className="space-y-5">
              <Card className="bg-card/40 border-primary/30 p-5 space-y-4">
                <div>
                  <h3 className="font-display text-primary text-sm uppercase">User access approvals</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Approve new operators and assign their first role.</p>
                </div>
                {pendingUsers.length === 0 ? (
                  <div className="rounded-[1.4rem] border border-dashed border-primary/20 bg-background/30 px-5 py-10 text-center text-sm text-muted-foreground">
                    No operators are waiting for approval right now.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingUsers.map((profile) => (
                      <div
                        key={profile.id}
                        className="flex flex-col gap-4 rounded-[1.4rem] border border-primary/18 bg-background/40 p-4 lg:flex-row lg:items-center lg:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 font-display text-primary">
                            {profile.display_name}
                            <Badge variant="outline" className="border-yellow-500/40 text-yellow-400">
                              Pending
                            </Badge>
                          </div>
                          <div className="truncate text-xs font-mono text-muted-foreground">{profile.email ?? "-"}</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" onClick={() => assignSingleRole(profile.id, "volunteer")} disabled={busyKey === `role-${profile.id}`}>
                            Approve as Volunteer
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => assignSingleRole(profile.id, "staff")} disabled={busyKey === `role-${profile.id}`}>
                            Approve as Staff
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openAssetManagerDialog(profile)} disabled={busyKey === `role-${profile.id}`}>
                            Approve as Assets Manager
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="bg-card/40 border-primary/30 p-5 space-y-4">
                <div>
                  <h3 className="font-display text-primary text-sm uppercase">Asset request approvals</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Review pending asset requests and approve or reject them from the admin hub.</p>
                </div>
                {pendingAssetRequests.length === 0 ? (
                  <div className="rounded-[1.4rem] border border-dashed border-primary/20 bg-background/30 px-5 py-10 text-center text-sm text-muted-foreground">
                    No asset requests are waiting for review.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingAssetRequests.map((request) => {
                      const asset = request.asset_id ? assetById[request.asset_id] : null;
                      return (
                        <div key={request.id} className="rounded-[1.4rem] border border-primary/18 bg-background/40 p-4 space-y-3">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 text-sm">
                              <div>
                                <span className="text-muted-foreground">By</span>{" "}
                                <span className="text-primary">{profileMap[request.requested_by] ?? "Unknown user"}</span>
                              </div>
                              {asset ? (
                                <div className="mt-1 font-display text-foreground">
                                  {asset.code} · {asset.name}
                                </div>
                              ) : request.item_description ? (
                                <div className="mt-1 text-foreground">{request.item_description}</div>
                              ) : null}
                              {(request.needed_for || request.needed_by) && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {request.needed_for} {request.needed_by ? `by ${new Date(request.needed_by).toLocaleString()}` : ""}
                                </div>
                              )}
                            </div>
                            <Badge variant="outline" className={REQUEST_STATUS_CLASS[request.status] ?? "border-primary/30 text-primary"}>
                              {request.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" onClick={() => reviewAssetRequest(request, "approved")} disabled={assetRequestBusyId === request.id}>
                              <Check size={14} className="mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-destructive text-destructive"
                              onClick={() => reviewAssetRequest(request, "rejected")}
                              disabled={assetRequestBusyId === request.id}
                            >
                              <X size={14} className="mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              <Card className="bg-card/40 border-primary/30 p-5 space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="font-display text-primary text-sm uppercase">Delete approvals</h3>
                    <p className="mt-1 text-xs text-muted-foreground">Review asset deletions that have been requested and either approve or cancel them.</p>
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
                  <div className="rounded-[1.4rem] border border-dashed border-primary/20 bg-background/30 px-5 py-10 text-center text-sm text-muted-foreground">
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
                            const requestedLabel = request.requested_by === user?.id ? "You" : profileMap[request.requested_by] ?? "Admin";
                            return (
                              <tr key={request.id} className="transition-colors hover:bg-primary/5">
                                <td className="px-4 py-3 font-mono text-foreground/85">{asset.code}</td>
                                <td className="px-4 py-3 text-foreground">{asset.name}</td>
                                <td className="px-4 py-3 text-muted-foreground">{requestedLabel}</td>
                                <td className="px-4 py-3 flex gap-2">
                                  {isSuperAdmin && (
                                    <Button type="button" size="sm" onClick={() => approveDeleteRequests([asset.id])} disabled={approvingDelete}>
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
            </div>
          )}

          {currentSection === "users-roles" && (
            <Card className="bg-card/40 border-primary/30 p-5 space-y-4">
              <div>
                <h3 className="font-display text-primary text-sm uppercase">Users & Roles</h3>
                <p className="mt-1 text-xs text-muted-foreground">Manage approved operators, switch roles, and assign Assets Manager locked locations.</p>
              </div>
              <div className="space-y-3">
                {approvedUsers.map((profile) => {
                  const activeRole = rolesFor(profile.id)[0];
                  return (
                    <div
                      key={profile.id}
                      className="flex flex-col gap-4 rounded-[1.4rem] border border-primary/18 bg-background/40 p-4 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 font-display text-primary">
                          {profile.display_name}
                          {profile.id === user?.id && (
                            <Badge variant="outline" className="border-primary/40 text-primary">
                              You
                            </Badge>
                          )}
                        </div>
                        <div className="truncate text-xs font-mono text-muted-foreground">{profile.email ?? "-"}</div>
                        {activeRole === "asset_manager" && (
                          <div className="mt-1 text-xs text-primary/80">
                            Locked to {locationMap[profile.asset_manager_location_id ?? ""] ?? "No location assigned"}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ROLE_OPTIONS.map((role) => {
                          const active = activeRole === role;
                          return (
                            <Button
                              key={role}
                              type="button"
                              size="sm"
                              variant={active ? "default" : "outline"}
                              disabled={busyKey === `role-${profile.id}` || (active && role !== "asset_manager")}
                              onClick={() => (role === "asset_manager" ? openAssetManagerDialog(profile) : assignSingleRole(profile.id, role))}
                              className={cn("rounded-full", !active && "border-primary/25 bg-card text-foreground hover:border-primary/45")}
                            >
                              {roleLabel(role)}
                            </Button>
                          );
                        })}
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteUserTarget(profile)}
                          disabled={profile.id === user?.id || deletingUserId === profile.id}
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete user
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {currentSection === "status" && (
            <div className="space-y-3">
              <Card className="bg-card/40 border-primary/30 p-4 text-sm text-muted-foreground">
                Delete any status here and all linked items will be moved into <span className="text-foreground">Not Assigned</span>.
              </Card>

              <div className="grid gap-3">
                {managedStatuses.map((status) => (
                  <Card key={status} className="bg-card/40 border-primary/20 p-4 space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={cn("uppercase tracking-[0.16em]", getStatusBadgeClass(status))}>
                          {getAssetStatusLabel(status)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {statusCounts[status]} item{statusCounts[status] === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => moveStatusToFallback(status)}
                        disabled={busyKey === `status-delete-${status}` || status === "not_assigned"}
                      >
                        {busyKey === `status-delete-${status}` ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentSection === "locations" && (
            <div className="space-y-3">
              <Card className="bg-card/40 border-primary/30 p-4 space-y-3">
                <h3 className="font-display text-primary text-sm uppercase">Add Location</h3>
                <div className="flex gap-2">
                  <div className="w-20">
                    <Label>Code</Label>
                    <Input maxLength={1} value={newLocCode} onChange={(event) => setNewLocCode(event.target.value)} className="text-center font-display uppercase" />
                  </div>
                  <div className="flex-1">
                    <Label>Name</Label>
                    <Input value={newLocName} onChange={(event) => setNewLocName(event.target.value)} maxLength={80} />
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
                            onChange={(event) =>
                              setLocationDrafts((current) => ({
                                ...current,
                                [location.id]: { ...draft, code: event.target.value },
                              }))
                            }
                            className="text-center font-display uppercase"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Name</Label>
                          <Input
                            value={draft.name}
                            onChange={(event) =>
                              setLocationDrafts((current) => ({
                                ...current,
                                [location.id]: { ...draft, name: event.target.value },
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
            </div>
          )}

          {currentSection === "divisions" && (
            <div className="space-y-3">
              <Card className="bg-card/40 border-primary/30 p-4 space-y-3">
                <h3 className="font-display text-primary text-sm uppercase">Add Division</h3>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label>Name</Label>
                    <Input value={newDivisionName} onChange={(event) => setNewDivisionName(event.target.value)} maxLength={80} />
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
                            onChange={(event) =>
                              setDivisionDrafts((current) => ({
                                ...current,
                                [division.id]: { ...draft, code: event.target.value },
                              }))
                            }
                            className="font-display uppercase"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Name</Label>
                          <Input
                            value={draft.name}
                            onChange={(event) =>
                              setDivisionDrafts((current) => ({
                                ...current,
                                [division.id]: { ...draft, name: event.target.value },
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
            </div>
          )}

          {currentSection === "qrcodes" && (
            <Card className="bg-card/40 border-primary/30 p-4 space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="font-display text-primary text-sm uppercase">Asset QR Codes</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Search exact asset units, select one or many, and download a printable PDF sheet of QR labels.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => exportQrCodes("filtered")}
                    disabled={qrFilteredAssets.length === 0 || qrExportingMode !== null}
                  >
                    <Download size={15} className="mr-2" />
                    {qrExportingMode === "filtered" ? "Building PDF..." : `Download all filtered (${qrFilteredAssets.length})`}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => exportQrCodes("selected")}
                    disabled={qrSelectedIds.size === 0 || qrExportingMode !== null}
                  >
                    <QrCode size={15} className="mr-2" />
                    {qrExportingMode === "selected" ? "Building PDF..." : `Download selected (${qrSelectedIds.size})`}
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1.7fr)_repeat(3,minmax(0,0.9fr))]">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search by name, tag, serial, division, location, or status..."
                    value={qrSearch}
                    onChange={(event) => setQrSearch(event.target.value)}
                  />
                </div>

                <Select value={qrStatusFilter} onValueChange={(value) => setQrStatusFilter(value as ManagedStatus | "all")}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {managedStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {getAssetStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={qrLocationFilter} onValueChange={setQrLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    {locs.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={qrDivisionFilter} onValueChange={setQrDivisionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All divisions" />
                  </SelectTrigger>
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

              <div className="flex flex-wrap items-center gap-2 rounded-[1.2rem] border border-primary/12 bg-background px-4 py-3">
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-primary/72">{qrSelectedIds.size} selected</span>
                <Button type="button" variant="outline" size="sm" className="ml-auto" onClick={toggleAllQrFiltered}>
                  {allQrFilteredSelected ? <CheckSquare size={14} className="mr-2" /> : <Square size={14} className="mr-2" />}
                  {allQrFilteredSelected ? "Deselect all filtered" : `Select all filtered (${qrFilteredAssets.length})`}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setQrSelectedIds(new Set())} disabled={qrSelectedIds.size === 0}>
                  Clear selection
                </Button>
              </div>

              <div className="overflow-hidden rounded-[1.4rem] border border-primary/12">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-primary/12 text-left font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        <th className="px-4 py-3 font-normal">Select</th>
                        <th className="px-4 py-3 font-normal">Tag</th>
                        <th className="px-4 py-3 font-normal">Item Name</th>
                        <th className="px-4 py-3 font-normal">Serial Number</th>
                        <th className="px-4 py-3 font-normal">Division</th>
                        <th className="px-4 py-3 font-normal">Location</th>
                        <th className="px-4 py-3 font-normal">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10">
                      {qrFilteredAssets.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                            No assets matched the QR export filters.
                          </td>
                        </tr>
                      ) : (
                        qrFilteredAssets.map((asset) => {
                          const locationName = locationMap[asset.current_location_id ?? asset.department_id] ?? "—";
                          const divisionName = asset.division_id ? divisionMap[asset.division_id] ?? "—" : "—";
                          const isSelected = qrSelectedIds.has(asset.id);

                          return (
                            <tr key={asset.id} className="transition-colors hover:bg-primary/5">
                              <td className="px-4 py-3">
                                <Checkbox checked={isSelected} onCheckedChange={() => toggleQrAsset(asset.id)} />
                              </td>
                              <td className="px-4 py-3 font-mono text-foreground/85">{asset.code}</td>
                              <td className="px-4 py-3 text-foreground">{asset.name}</td>
                              <td className="px-4 py-3 text-muted-foreground">{asset.serial_number || "—"}</td>
                              <td className="px-4 py-3 text-muted-foreground">{divisionName}</td>
                              <td className="px-4 py-3 text-muted-foreground">{locationName}</td>
                              <td className="px-4 py-3">
                                <Badge variant="outline" className={cn("uppercase tracking-[0.16em]", getStatusBadgeClass(asset.status))}>
                                  {getAssetStatusLabel(asset.status)}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          )}

          {currentSection === "deletions" && (
            <div className="space-y-4">
              <Card className="bg-card/40 border-primary/30 p-4 space-y-4">
                <div>
                  <h3 className="font-display text-primary text-sm uppercase">Request Asset Deletion</h3>
                  <p className="text-xs text-muted-foreground mt-1">Search for assets and add them to the list. Submit all at once for admin approval.</p>
                </div>

                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Search by name, tag, or serial number..." value={deleteSearch} onChange={(event) => setDeleteSearch(event.target.value)} />
                  {deleteSearchResults.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full rounded-[1rem] border border-primary/20 bg-card shadow-lg overflow-hidden">
                      {deleteSearchResults.map((asset) => (
                        <button
                          key={asset.id}
                          type="button"
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors flex items-center gap-3"
                          onClick={() => {
                            setStagedForDelete((current) => [...current, asset]);
                            setDeleteSearch("");
                          }}
                        >
                          <span className="font-mono text-xs text-primary/70">{asset.code}</span>
                          <span className="text-foreground">{asset.name}</span>
                          {asset.serial_number && <span className="ml-auto text-xs text-muted-foreground">{asset.serial_number}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {stagedForDelete.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Queued for deletion ({stagedForDelete.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {stagedForDelete.map((asset) => (
                        <div key={asset.id} className="flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-sm text-destructive">
                          <span className="font-mono text-xs opacity-70">{asset.code}</span>
                          <span>{asset.name}</span>
                          <button
                            type="button"
                            onClick={() => setStagedForDelete((current) => current.filter((row) => row.id !== asset.id))}
                            className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
                            aria-label={`Remove ${asset.name}`}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="button" onClick={submitDeleteRequest} disabled={requestingDelete || stagedForDelete.length === 0}>
                    <Trash2 size={16} className="mr-2" />
                    {requestingDelete ? "Requesting..." : `Request Deletion (${stagedForDelete.length})`}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {currentSection === "unassigned" && (
            <div className="space-y-4">
              <Card className="bg-card/40 border-primary/30 p-4 space-y-4">
                <div>
                  <h3 className="font-display text-primary text-sm uppercase">Unassigned cleanup queue</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fix items that still have Not Assigned status, division, or location. Select one or many items and apply the fields you want to update.
                  </p>
                </div>

                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.7fr)_repeat(3,minmax(0,0.9fr))]">
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Search by name, tag, serial, division, or location..."
                      value={unassignedSearch}
                      onChange={(event) => setUnassignedSearch(event.target.value)}
                    />
                  </div>

                  <Select value={unassignedStatusFilter} onValueChange={(value) => setUnassignedStatusFilter(value as ManagedStatus | "all")}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      {managedStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {getAssetStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={unassignedLocationFilter} onValueChange={setUnassignedLocationFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All locations</SelectItem>
                      {locs.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={unassignedDivisionFilter} onValueChange={setUnassignedDivisionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All divisions" />
                    </SelectTrigger>
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

                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Set division</Label>
                    <Select value={unassignedDraftDivisionId} onValueChange={setUnassignedDraftDivisionId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Leave unchanged" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="skip">Leave unchanged</SelectItem>
                        <SelectItem value="none">Clear division</SelectItem>
                        {divisions.map((division) => (
                          <SelectItem key={division.id} value={division.id}>
                            {division.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Set status</Label>
                    <Select value={unassignedDraftStatus} onValueChange={(value) => setUnassignedDraftStatus(value as ManagedStatus | "skip")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Leave unchanged" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="skip">Leave unchanged</SelectItem>
                        {managedStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {getAssetStatusLabel(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Set location</Label>
                    <Select value={unassignedDraftLocationId} onValueChange={setUnassignedDraftLocationId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Leave unchanged" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="skip">Leave unchanged</SelectItem>
                        {locs.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 rounded-[1.2rem] border border-primary/12 bg-background px-4 py-3">
                  <span className="font-mono text-xs uppercase tracking-[0.16em] text-primary/72">{unassignedSelectedIds.size} selected</span>
                  <Button type="button" variant="outline" size="sm" className="ml-auto" onClick={toggleAllUnassigned}>
                    {allUnassignedSelected ? <CheckSquare size={14} className="mr-2" /> : <Square size={14} className="mr-2" />}
                    {allUnassignedSelected ? "Deselect all filtered" : `Select all filtered (${unassignedAssets.length})`}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setUnassignedSelectedIds(new Set())} disabled={unassignedSelectedIds.size === 0}>
                    Clear selection
                  </Button>
                  <Button type="button" onClick={applyUnassignedFixes} disabled={unassignedApplying || unassignedSelectedIds.size === 0}>
                    {unassignedApplying ? "Applying..." : `Apply to selected (${unassignedSelectedIds.size})`}
                  </Button>
                </div>

                <div className="overflow-hidden rounded-[1.4rem] border border-primary/12">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-primary/12 text-left font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          <th className="px-4 py-3 font-normal">Select</th>
                          <th className="px-4 py-3 font-normal">Tag</th>
                          <th className="px-4 py-3 font-normal">Item Name</th>
                          <th className="px-4 py-3 font-normal">Status</th>
                          <th className="px-4 py-3 font-normal">Division</th>
                          <th className="px-4 py-3 font-normal">Location</th>
                          <th className="px-4 py-3 font-normal">Serial Number</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-primary/10">
                        {unassignedAssets.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                              No unassigned items matched the current filters.
                            </td>
                          </tr>
                        ) : (
                          unassignedAssets.map((asset) => {
                            const effectiveLocationId = asset.current_location_id ?? asset.department_id;
                            const divisionName = asset.division_id ? divisionMap[asset.division_id] ?? "—" : "—";
                            const locationName = locationMap[effectiveLocationId] ?? "—";
                            const isSelected = unassignedSelectedIds.has(asset.id);

                            return (
                              <tr key={asset.id} className="transition-colors hover:bg-primary/5">
                                <td className="px-4 py-3">
                                  <Checkbox checked={isSelected} onCheckedChange={() => toggleUnassignedAsset(asset.id)} />
                                </td>
                                <td className="px-4 py-3 font-mono text-foreground/85">{asset.code}</td>
                                <td className="px-4 py-3 text-foreground">{asset.name}</td>
                                <td className="px-4 py-3">
                                  <Badge variant="outline" className={cn("uppercase tracking-[0.16em]", getStatusBadgeClass(asset.status))}>
                                    {getAssetStatusLabel(asset.status)}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{divisionName}</td>
                                <td className="px-4 py-3 text-muted-foreground">{locationName}</td>
                                <td className="px-4 py-3 text-muted-foreground">{asset.serial_number || "—"}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {currentSection === "damage-reports" && (
            <div className="space-y-4">
              <Card className="bg-card/40 border-primary/30 p-5 space-y-4">
                <div>
                  <h3 className="font-display text-primary text-sm uppercase">Damage Reports</h3>
                  <p className="mt-1 text-xs text-muted-foreground">View and export reports for items marked as damaged by operators.</p>
                </div>

                {visibleDamageReports.length === 0 ? (
                  <div className="rounded-[1.4rem] border border-dashed border-primary/20 bg-background/30 px-5 py-10 text-center text-sm text-muted-foreground">
                    No damage reports found.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {visibleDamageReports.map((report) => (
                      <div
                        key={report.id}
                        className="flex flex-col gap-4 rounded-[1.4rem] border border-primary/18 bg-background/40 p-4 lg:flex-row lg:items-center lg:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-bold text-primary">{report.asset_code}</span>
                            <span className="font-display text-foreground">{report.asset_name}</span>
                            <Badge variant="outline" className={report.status === "completed" ? "border-primary/40 text-primary bg-primary/5" : "border-amber-500/40 text-amber-400 bg-amber-500/5"}>
                              {report.admin_conclusion_status ? "CONCLUDED" : report.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                            <div><span className="opacity-60">Assigned to:</span> {profileMap[report.assigned_to] ?? "Unknown"}</div>
                            <div><span className="opacity-60">Damaged on:</span> {report.damaged_date ? `${new Date(report.damaged_date).toLocaleDateString()} ${report.damaged_time || ""}` : "Pending"}</div>
                            <div><span className="opacity-60">Type:</span> <span className="text-primary/90">{report.damage_type}{report.other_details ? ` (${report.other_details})` : ""}</span></div>
                            <div><span className="opacity-60">Reported by:</span> {profileMap[report.reported_by] ?? "Admin"}</div>
                          </div>
                          {report.description && (
                            <div className="mt-3 rounded-lg bg-black/20 p-3 text-xs text-foreground/80 italic border-l-2 border-primary/30">
                              "{report.description}"
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 flex flex-col gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 border-primary/20 hover:border-primary/40"
                            onClick={() => exportDamageReportPdf(report, profileMap)}
                          >
                            <FileText size={14} />
                            Export PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 border-destructive/25 text-destructive hover:bg-destructive/10"
                            onClick={() => deleteDamageReport(report)}
                            disabled={deletingDamageReportId === report.id}
                          >
                            <Trash2 size={14} />
                            {deletingDamageReportId === report.id ? "Deleting..." : "Delete"}
                          </Button>
                          {report.status === "completed" && !report.admin_conclusion_status && (
                            <Button 
                              size="sm" 
                              className="gap-2"
                              onClick={() => {
                                setConcludingReport(report);
                                setConclusionStatus("available");
                                setConclusionNotes("");
                              }}
                            >
                              <Shield size={14} />
                              Conclusion
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Conclusion Dialog */}
          <Dialog open={!!concludingReport} onOpenChange={(open) => !open && setConcludingReport(null)}>
            <DialogContent className="border-primary/20 bg-card">
              <DialogHeader>
                <DialogTitle className="font-display text-foreground">Damage Report Conclusion</DialogTitle>
              </DialogHeader>

              {concludingReport && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                    <div className="font-mono text-sm font-bold text-primary">{concludingReport.asset_code} · {concludingReport.asset_name}</div>
                    <div className="mt-1 text-xs text-muted-foreground italic">"{concludingReport.description}"</div>
                  </div>

                  <div className="space-y-2">
                    <Label>Admin Conclusion Status</Label>
                    <Select value={conclusionStatus} onValueChange={(value) => setConclusionStatus(value as ManagedStatus)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="out_for_repairs">Out for Repairs</SelectItem>
                        <SelectItem value="damaged">Damaged (Keep Retired)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Conclusion Notes</Label>
                    <Textarea 
                      placeholder="Add any final notes or repair details..." 
                      value={conclusionNotes}
                      onChange={(e) => setConclusionNotes(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setConcludingReport(null)}>Cancel</Button>
                <Button onClick={submitConclusion} disabled={concludingBusy}>
                  {concludingBusy ? "Submitting..." : "Submit Conclusion"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>
      </div>

      <Dialog open={!!assetManagerTarget} onOpenChange={(open) => !open && setAssetManagerTarget(null)}>
        <DialogContent className="border-primary/20 bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">Assign Assets Manager</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Operator</Label>
              <div className="rounded-[1rem] border border-primary/15 bg-background px-4 py-3 text-sm text-foreground">
                {assetManagerTarget?.display_name ?? ""}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Locked Location</Label>
              <Select value={assetManagerLocationDraft} onValueChange={setAssetManagerLocationDraft}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Choose location" />
                </SelectTrigger>
                <SelectContent>
                  {locs.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Assets Managers will only work inside this location when signing items in and out.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAssetManagerTarget(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveAssetManagerRole} disabled={assetManagerSaving}>
              {assetManagerSaving ? "Saving..." : "Save Assets Manager"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteUserTarget} onOpenChange={(open) => !open && setDeleteUserTarget(null)}>
        <DialogContent className="border-primary/20 bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">Delete user</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            {deleteUserTarget
              ? `This will permanently remove ${deleteUserTarget.display_name} from the app. Accounts linked to sign-outs, requests, handovers, or history cannot be deleted.`
              : "This will permanently remove the selected user from the app."}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteUserTarget(null)} disabled={!!deletingUserId}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={deleteUser} disabled={!!deletingUserId}>
              {deletingUserId ? "Deleting..." : "Delete user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
