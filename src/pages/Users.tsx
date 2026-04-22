import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users as UsersIcon } from "lucide-react";

type AppRole = "admin" | "staff" | "volunteer";

interface UserRow {
  id: string;
  display_name: string;
  email: string | null;
  role: AppRole;
}

export default function Users() {
  const { user, isAdmin } = useAuth();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
    (roles ?? []).forEach((r: any) => roleMap.set(r.user_id, r.role));
    setRows(
      (profiles ?? []).map((p: any) => ({
        id: p.id,
        display_name: p.display_name,
        email: p.email,
        role: roleMap.get(p.id) ?? "volunteer",
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const changeRole = async (userId: string, newRole: AppRole) => {
    if (userId === user?.id && newRole !== "admin") {
      const ok = confirm("You are about to remove your own admin access. Continue?");
      if (!ok) return;
    }
    setUpdatingId(userId);
    // Replace existing role rows for that user with the new single role
    const { error: delErr } = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (delErr) {
      toast.error(delErr.message);
      setUpdatingId(null);
      return;
    }
    const { error: insErr } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: newRole });
    if (insErr) {
      toast.error(insErr.message);
    } else {
      toast.success("Role updated");
      setRows((rs) => rs.map((r) => (r.id === userId ? { ...r, role: newRole } : r)));
    }
    setUpdatingId(null);
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12 text-muted-foreground font-mono">
        // ACCESS DENIED — admin only
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-primary glow flex items-center gap-2">
          <UsersIcon size={22} /> User Management
        </h1>
        <p className="text-sm text-muted-foreground font-mono">
          // assign roles to operatives
        </p>
      </div>

      <Card className="border-primary/30 bg-card/60">
        <CardHeader>
          <CardTitle className="font-display text-primary text-lg">Operatives ({rows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground font-mono text-sm">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="text-muted-foreground font-mono text-sm">No users found.</div>
          ) : (
            <div className="space-y-2">
              {rows.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded border border-primary/20 p-3 hover:bg-primary/5 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-display text-primary truncate flex items-center gap-2">
                      {r.display_name}
                      {r.id === user?.id && (
                        <Badge variant="outline" className="border-primary/40 text-[10px]">YOU</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono truncate">
                      {r.email ?? "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        r.role === "admin"
                          ? "border-primary text-primary"
                          : r.role === "staff"
                          ? "border-yellow-500/60 text-yellow-400"
                          : "border-muted-foreground/40 text-muted-foreground"
                      }
                    >
                      {r.role.toUpperCase()}
                    </Badge>
                    <Select
                      value={r.role}
                      onValueChange={(v) => changeRole(r.id, v as AppRole)}
                      disabled={updatingId === r.id}
                    >
                      <SelectTrigger className="w-[140px] bg-background/50 border-primary/40 text-primary font-mono text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="volunteer">Volunteer</SelectItem>
                      </SelectContent>
                    </Select>
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
