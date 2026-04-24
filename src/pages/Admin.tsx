import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { generateNameCode, generateSingleCharacterCode } from "@/lib/assets";

type Role = "admin" | "staff" | "volunteer";

interface Profile { id: string; display_name: string; email: string | null; }
interface UserRole { user_id: string; role: Role; }
interface Loc { id: string; code: string; name: string; }
interface Department { id: string; code: string; name: string; }
interface Division { id: string; code: string | null; name: string; }

export default function Admin() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [locs, setLocs] = useState<Loc[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [newLocCode, setNewLocCode] = useState("");
  const [newLocName, setNewLocName] = useState("");
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDivisionName, setNewDivisionName] = useState("");

  const load = async () => {
    const [{ data: p }, { data: r }, { data: l }, { data: departmentRows }, { data: divisionRows }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, email").order("display_name"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("locations").select("*").order("name"),
      supabase.from("item_types").select("*").order("name"),
      supabase.from("divisions").select("*").order("name"),
    ]);
    setProfiles(p ?? []);
    setUserRoles((r ?? []) as UserRole[]);
    setLocs(l ?? []);
    setDepartments((departmentRows ?? []) as Department[]);
    setDivisions((divisionRows ?? []) as Division[]);
  };

  useEffect(() => { load(); }, []);

  const rolesFor = (uid: string) => userRoles.filter((r) => r.user_id === uid).map((r) => r.role);

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

  const addLoc = async () => {
    if (!newLocCode || !newLocName) return toast.error("Code and name required");
    if (newLocCode.length !== 1) return toast.error("Code must be 1 letter");
    const { error } = await supabase.from("locations").insert({ code: newLocCode.toUpperCase(), name: newLocName });
    if (error) return toast.error(error.message);
    setNewLocCode("");
    setNewLocName("");
    load();
  };

  const addDepartment = async () => {
    const trimmedName = newDepartmentName.trim();
    if (!trimmedName) return toast.error("Department name required");

    try {
      const code = generateSingleCharacterCode(trimmedName, departments.map((department) => department.code));
      const { error } = await supabase.from("item_types").insert({ code, name: trimmedName });
      if (error) throw error;
      toast.success("Department added");
      setNewDepartmentName("");
      load();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to add department");
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

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="font-display text-2xl text-primary glow">// Admin Console</h1>

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
          <TabsTrigger value="locs" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Locations</TabsTrigger>
          <TabsTrigger value="departments" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Departments</TabsTrigger>
          <TabsTrigger value="divisions" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Divisions</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-2 mt-4">
          <div className="text-xs text-muted-foreground mb-4 uppercase tracking-widest px-1">
            // NEW ENROLMENT REQUESTS
          </div>
          {profiles.filter((p) => rolesFor(p.id).length === 0).length === 0 ? (
            <div className="py-12 text-center font-mono text-sm text-muted-foreground/50 border border-dashed border-primary/20 rounded">
              // NO PENDING REQUESTS
            </div>
          ) : (
            profiles.filter((p) => rolesFor(p.id).length === 0).map((p) => (
              <Card key={p.id} className="bg-card/40 border-primary/20 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm text-primary truncate flex items-center gap-2">
                    <span className="text-primary/60">▸</span> {p.display_name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate ml-5">{p.email}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => toggleRole(p.id, "volunteer")}
                    className="bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30 font-mono text-[10px] uppercase tracking-widest px-4"
                  >
                    Approve as Volunteer
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => toggleRole(p.id, "staff")}
                    className="bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30 font-mono text-[10px] uppercase tracking-widest px-4"
                  >
                    Approve as Staff
                  </Button>
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
                      className={`cursor-pointer uppercase text-[10px] ${
                        active ? "bg-primary text-primary-foreground border-primary" : "border-primary/30 text-muted-foreground"
                      }`}
                    >
                      {r}
                    </Badge>
                  );
                })}
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="locs" className="space-y-3 mt-4">
          <Card className="bg-card/40 border-primary/30 p-4 space-y-2">
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
                <Button onClick={addLoc} className="bg-primary text-primary-foreground">Add</Button>
              </div>
            </div>
          </Card>
          <div className="grid sm:grid-cols-2 gap-2">
            {locs.map((location) => (
              <Card key={location.id} className="bg-card/30 border-primary/20 p-3 flex items-center gap-3">
                <span className="font-display text-2xl text-primary glow w-10 text-center">{location.code}</span>
                <span className="text-sm">{location.name}</span>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-3 mt-4">
          <Card className="bg-card/40 border-primary/30 p-4 space-y-2">
            <h3 className="font-display text-primary text-sm uppercase">Add Department</h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label>Name</Label>
                <Input value={newDepartmentName} onChange={(e) => setNewDepartmentName(e.target.value)} maxLength={80} />
              </div>
              <div className="self-end">
                <Button onClick={addDepartment} className="bg-primary text-primary-foreground">Add</Button>
              </div>
            </div>
          </Card>
          <div className="grid sm:grid-cols-2 gap-2">
            {departments.map((department) => (
              <Card key={department.id} className="bg-card/30 border-primary/20 p-3 flex items-center gap-3">
                <span className="font-display text-2xl text-primary glow w-10 text-center">{department.code}</span>
                <span className="text-sm">{department.name}</span>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="divisions" className="space-y-3 mt-4">
          <Card className="bg-card/40 border-primary/30 p-4 space-y-2">
            <h3 className="font-display text-primary text-sm uppercase">Add Division</h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label>Name</Label>
                <Input value={newDivisionName} onChange={(e) => setNewDivisionName(e.target.value)} maxLength={80} />
              </div>
              <div className="self-end">
                <Button onClick={addDivision} className="bg-primary text-primary-foreground">Add</Button>
              </div>
            </div>
          </Card>
          <div className="grid sm:grid-cols-2 gap-2">
            {divisions.map((division) => (
              <Card key={division.id} className="bg-card/30 border-primary/20 p-3 flex items-center gap-3">
                <span className="font-display text-lg text-primary glow min-w-12 text-center">{division.code || "-"}</span>
                <span className="text-sm">{division.name}</span>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
