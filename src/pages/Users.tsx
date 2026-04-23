import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, ShieldAlert, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type AppRole = "admin" | "staff" | "volunteer";

interface UserRow {
  id: string;
  display_name: string;
  email: string | null;
  role: AppRole | null;
}

const roleOptions: AppRole[] = ["volunteer", "staff", "admin"];

export default function Users() {
  const { user, isAdmin } = useAuth();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [draftRoles, setDraftRoles] = useState<Record<string, AppRole>>({});

  const load = async () => {
    setLoading(true);
    const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, email").order("display_name"),
      supabase.from("user_roles").select("user_id, role"),
    ]);

    if (pErr || rErr) {
      toast.error("Failed to load users");
      setLoading(false);
      return;
    }

    const roleMap = new Map<string, AppRole>();
    (roles ?? []).forEach((row: any) => roleMap.set(row.user_id, row.role));

    const nextRows = (profiles ?? []).map((profile: any) => ({
      id: profile.id,
      display_name: profile.display_name,
      email: profile.email,
      role: roleMap.get(profile.id) ?? null,
    }));

    setRows(nextRows);
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

  const assignRole = async (userId: string, nextRole: AppRole) => {
    if (userId === user?.id && nextRole !== "admin") {
      const ok = confirm("You are about to remove your own admin access. Continue?");
      if (!ok) return;
    }

    setUpdatingId(userId);

    const { error: deleteError } = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (deleteError) {
      toast.error(deleteError.message);
      setUpdatingId(null);
      return;
    }

    const { error: insertError } = await supabase.from("user_roles").insert({ user_id: userId, role: nextRole });
    if (insertError) {
      toast.error(insertError.message);
      setUpdatingId(null);
      return;
    }

    setRows((current) => current.map((row) => (row.id === userId ? { ...row, role: nextRole } : row)));
    setDraftRoles((current) => ({ ...current, [userId]: nextRole }));
    toast.success("User approved and role assigned");
    setUpdatingId(null);
  };

  if (!isAdmin) {
    return (
      <div className="py-12 text-center font-mono text-sm text-muted-foreground">
        // ACCESS DENIED - admin only
      </div>
    );
  }

  return (
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
                      disabled={updatingId === row.id}
                    >
                      <SelectTrigger className="w-full min-w-[180px] border-primary/30 bg-background/60 text-primary sm:w-[190px]">
                        <SelectValue placeholder="Assign role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="volunteer">Volunteer</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={() => assignRole(row.id, draftRoles[row.id] ?? "volunteer")}
                      disabled={updatingId === row.id}
                      className="sm:min-w-[170px]"
                    >
                      {updatingId === row.id ? "Approving..." : "Approve user"}
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
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        row.role === "admin"
                          ? "border-primary text-primary"
                          : row.role === "staff"
                            ? "border-yellow-500/60 text-yellow-400"
                            : "border-muted-foreground/40 text-muted-foreground"
                      }
                    >
                      {row.role?.toUpperCase()}
                    </Badge>

                    <Select
                      value={draftRoles[row.id] ?? row.role ?? "volunteer"}
                      onValueChange={(value) => setDraftRoles((current) => ({ ...current, [row.id]: value as AppRole }))}
                      disabled={updatingId === row.id}
                    >
                      <SelectTrigger className="w-[170px] border-primary/30 bg-background/60 text-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      className="border-primary/30 bg-background/40 text-primary hover:bg-primary/10"
                      onClick={() => assignRole(row.id, draftRoles[row.id] ?? row.role ?? "volunteer")}
                      disabled={updatingId === row.id}
                    >
                      {updatingId === row.id ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
