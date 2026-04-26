import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, ShieldAlert, Trash2, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type AppRole = "admin" | "staff" | "volunteer" | "asset_manager";

interface UserRow {
  id: string;
  display_name: string;
  email: string | null;
  role: AppRole | null;
  asset_manager_location_id: string | null;
}

interface LocationRow {
  id: string;
  name: string;
}

const roleOptions: AppRole[] = ["volunteer", "staff", "asset_manager", "admin"];
const roleLabel = (role: AppRole) => (role === "asset_manager" ? "Assets Manager" : role.charAt(0).toUpperCase() + role.slice(1));

export default function Users() {
  const { user, isAdmin } = useAuth();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [draftRoles, setDraftRoles] = useState<Record<string, AppRole>>({});
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [assetManagerTarget, setAssetManagerTarget] = useState<UserRow | null>(null);
  const [assetManagerLocationDraft, setAssetManagerLocationDraft] = useState("none");
  const [assetManagerSaving, setAssetManagerSaving] = useState(false);

  const locationMap = useMemo(
    () => Object.fromEntries(locations.map((location) => [location.id, location.name])),
    [locations],
  );

  const load = async () => {
    setLoading(true);
    const [{ data: profiles, error: pErr }, { data: roles, error: rErr }, { data: locationRows, error: lErr }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, email, asset_manager_location_id").order("display_name"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("locations").select("id, name").order("name"),
    ]);

    if (pErr || rErr || lErr) {
      toast.error("Failed to load users");
      setLoading(false);
      return;
    }

    const roleMap = new Map<string, AppRole>();
    (roles ?? []).forEach((row) => roleMap.set(row.user_id, row.role as AppRole));

    const nextRows = (profiles ?? []).map((profile) => ({
      id: profile.id,
      display_name: profile.display_name,
      email: profile.email,
      role: roleMap.get(profile.id) ?? null,
      asset_manager_location_id: profile.asset_manager_location_id ?? null,
    }));

    setRows(nextRows);
    setLocations((locationRows ?? []) as LocationRow[]);
    setDraftRoles((current) => {
      const nextDrafts = { ...current };
      nextRows.forEach((row) => {
        nextDrafts[row.id] = current[row.id] ?? row.role ?? "volunteer";
      });
      return nextDrafts;
    });
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      load();
    }
  }, [isAdmin]);

  const pendingUsers = useMemo(() => rows.filter((row) => !row.role), [rows]);
  const approvedUsers = useMemo(() => rows.filter((row) => row.role), [rows]);

  const openAssetManagerDialog = (target: UserRow) => {
    setAssetManagerTarget(target);
    setAssetManagerLocationDraft(target.asset_manager_location_id ?? "none");
  };

  const assignRole = async (userId: string, nextRole: AppRole, assetManagerLocationId?: string | null) => {
    if (userId === user?.id && nextRole !== "admin") {
      const ok = confirm("You are about to remove your own admin access. Continue?");
      if (!ok) return false;
    }

    if (nextRole === "asset_manager" && (!assetManagerLocationId || assetManagerLocationId === "none")) {
      toast.error("Choose the locked location for this Assets Manager first.");
      return false;
    }

    setUpdatingId(userId);

    const { error } = await supabase.rpc("admin_assign_user_role", {
      target_user_id: userId,
      next_role: nextRole,
      next_asset_manager_location_id: nextRole === "asset_manager" ? assetManagerLocationId ?? null : null,
    });

    if (error) {
      toast.error(error.message);
      setUpdatingId(null);
      return false;
    }

    setRows((current) =>
      current.map((row) =>
        row.id === userId
          ? { ...row, role: nextRole, asset_manager_location_id: nextRole === "asset_manager" ? assetManagerLocationId ?? null : null }
          : row,
      ),
    );
    setDraftRoles((current) => ({ ...current, [userId]: nextRole }));
    toast.success("User role updated");
    setUpdatingId(null);
    return true;
  };

  const saveAssetManagerRole = async () => {
    if (!assetManagerTarget) return;
    setAssetManagerSaving(true);
    const saved = await assignRole(assetManagerTarget.id, "asset_manager", assetManagerLocationDraft);
    setAssetManagerSaving(false);
    if (saved) {
      setAssetManagerTarget(null);
    }
  };

  const handleRoleSubmit = async (row: UserRow) => {
    const nextRole = draftRoles[row.id] ?? row.role ?? "volunteer";
    if (nextRole === "asset_manager") {
      openAssetManagerDialog(row);
      return;
    }
    await assignRole(row.id, nextRole);
  };

  const deleteUser = async () => {
    if (!deleteTarget) return;

    setDeletingId(deleteTarget.id);
    const { error } = await supabase.rpc("admin_delete_user", { target_user_id: deleteTarget.id });

    if (error) {
      toast.error(error.message);
      setDeletingId(null);
      return;
    }

    setRows((current) => current.filter((row) => row.id !== deleteTarget.id));
    setDraftRoles((current) => {
      const next = { ...current };
      delete next[deleteTarget.id];
      return next;
    });
    toast.success("User deleted");
    setDeletingId(null);
    setDeleteTarget(null);
  };

  if (!isAdmin) {
    return (
      <div className="py-12 text-center font-mono text-sm text-muted-foreground">
        // ACCESS DENIED - admin only
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl text-primary glow">
            <UsersIcon size={22} /> User Management
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Approve operator access, assign roles, and manage active profiles.
          </p>
        </div>

        <Card className="border-primary/30 bg-card/60">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 font-display text-lg text-primary">
              <ShieldAlert size={18} /> Pending Approval ({pendingUsers.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              New operators stay here until an admin approves the account and assigns a role.
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm font-mono text-muted-foreground">Loading...</div>
            ) : pendingUsers.length === 0 ? (
              <div className="rounded-[1.4rem] border border-dashed border-primary/20 bg-background/30 px-5 py-10 text-center text-sm text-muted-foreground">
                No operators are waiting for approval right now.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map((row) => (
                  <div
                    key={row.id}
                    className="flex flex-col gap-4 rounded-[1.5rem] border border-primary/20 bg-background/35 p-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 font-display text-primary">
                        {row.display_name}
                        <Badge variant="outline" className="border-yellow-500/40 text-yellow-400">
                          Pending
                        </Badge>
                      </div>
                      <div className="truncate text-xs font-mono text-muted-foreground">
                        {row.email ?? "-"}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Select
                        value={draftRoles[row.id] ?? "volunteer"}
                        onValueChange={(value) => setDraftRoles((current) => ({ ...current, [row.id]: value as AppRole }))}
                        disabled={updatingId === row.id || deletingId === row.id}
                      >
                        <SelectTrigger className="w-full min-w-[180px] border-primary/30 bg-background/60 text-primary sm:w-[210px]">
                          <SelectValue placeholder="Assign role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role} value={role}>
                              {roleLabel(role)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        onClick={() => handleRoleSubmit(row)}
                        disabled={updatingId === row.id || deletingId === row.id}
                        className="sm:min-w-[170px]"
                      >
                        {updatingId === row.id ? "Approving..." : "Approve user"}
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => setDeleteTarget(row)}
                        disabled={deletingId === row.id}
                        className="sm:min-w-[150px]"
                      >
                        <Trash2 size={15} />
                        Delete user
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-card/60">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 font-display text-lg text-primary">
              <BadgeCheck size={18} /> Approved Users ({approvedUsers.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Change the active role for approved operators here.
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm font-mono text-muted-foreground">Loading...</div>
            ) : approvedUsers.length === 0 ? (
              <div className="rounded-[1.4rem] border border-dashed border-primary/20 bg-background/30 px-5 py-10 text-center text-sm text-muted-foreground">
                No approved users found yet.
              </div>
            ) : (
              <div className="space-y-3">
                {approvedUsers.map((row) => (
                  <div
                    key={row.id}
                    className="flex flex-col gap-4 rounded-[1.5rem] border border-primary/20 bg-background/35 p-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 font-display text-primary">
                        {row.display_name}
                        {row.id === user?.id && (
                          <Badge variant="outline" className="border-primary/40 text-primary">
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="truncate text-xs font-mono text-muted-foreground">
                        {row.email ?? "-"}
                      </div>
                      {row.role === "asset_manager" && (
                        <div className="mt-1 text-xs text-primary/80">
                          Locked to: {locationMap[row.asset_manager_location_id ?? ""] ?? "No location assigned"}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {row.role && (
                        <Badge
                          variant="outline"
                          className={
                            row.role === "admin"
                              ? "border-primary text-primary"
                              : row.role === "staff"
                                ? "border-yellow-500/60 text-yellow-400"
                                : row.role === "asset_manager"
                                  ? "border-cyan-500/60 text-cyan-300"
                                  : "border-muted-foreground/40 text-muted-foreground"
                          }
                        >
                          {roleLabel(row.role).toUpperCase()}
                        </Badge>
                      )}

                      <Select
                        value={draftRoles[row.id] ?? row.role ?? "volunteer"}
                        onValueChange={(value) => setDraftRoles((current) => ({ ...current, [row.id]: value as AppRole }))}
                        disabled={updatingId === row.id || deletingId === row.id}
                      >
                        <SelectTrigger className="w-[190px] border-primary/30 bg-background/60 text-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role} value={role}>
                              {roleLabel(role)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        className="border-primary/30 bg-background/40 text-primary hover:bg-primary/10"
                        onClick={() => handleRoleSubmit(row)}
                        disabled={updatingId === row.id || deletingId === row.id}
                      >
                        {updatingId === row.id ? "Saving..." : "Save"}
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => setDeleteTarget(row)}
                        disabled={row.id === user?.id || deletingId === row.id}
                      >
                        <Trash2 size={15} />
                        Delete user
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!assetManagerTarget} onOpenChange={(open) => !open && setAssetManagerTarget(null)}>
        <DialogContent className="border border-primary/20 bg-background">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-foreground glow-soft">
              Assign Assets Manager
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Operator</Label>
              <div className="rounded-[1rem] border border-primary/15 bg-card px-4 py-3 text-sm text-foreground">
                {assetManagerTarget?.display_name ?? ""}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Locked Location</Label>
              <Select value={assetManagerLocationDraft} onValueChange={setAssetManagerLocationDraft}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Choose location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="border border-primary/20 bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-2xl text-foreground glow-soft">
              Delete user
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-6">
              {deleteTarget
                ? `This will permanently remove ${deleteTarget.display_name} from the app. Accounts linked to sign-outs, requests, handovers, or history cannot be deleted.`
                : "This will permanently remove the selected user from the app."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteUser}
              disabled={!!deletingId}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingId ? "Deleting..." : "Delete user"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
