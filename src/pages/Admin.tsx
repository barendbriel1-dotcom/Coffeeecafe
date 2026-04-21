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

type Role = "admin" | "staff" | "volunteer";

interface Profile { id: string; display_name: string; email: string | null; }
interface UserRole { user_id: string; role: Role; }
interface Dept { id: string; code: string; name: string; }
interface ItemType { id: string; code: string; name: string; }

export default function Admin() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [depts, setDepts] = useState<Dept[]>([]);
  const [items, setItems] = useState<ItemType[]>([]);
  const [newDeptCode, setNewDeptCode] = useState("");
  const [newDeptName, setNewDeptName] = useState("");
  const [newItemCode, setNewItemCode] = useState("");
  const [newItemName, setNewItemName] = useState("");

  const load = async () => {
    const [{ data: p }, { data: r }, { data: d }, { data: it }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, email").order("display_name"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("departments").select("*").order("name"),
      supabase.from("item_types").select("*").order("name"),
    ]);
    setProfiles(p ?? []);
    setUserRoles((r ?? []) as UserRole[]);
    setDepts(d ?? []);
    setItems(it ?? []);
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

  const addDept = async () => {
    if (!newDeptCode || !newDeptName) return toast.error("Code and name required");
    if (newDeptCode.length !== 1) return toast.error("Code must be 1 letter");
    const { error } = await supabase.from("departments").insert({ code: newDeptCode.toUpperCase(), name: newDeptName });
    if (error) return toast.error(error.message);
    setNewDeptCode(""); setNewDeptName(""); load();
  };

  const addItem = async () => {
    if (!newItemCode || !newItemName) return toast.error("Code and name required");
    if (newItemCode.length !== 1) return toast.error("Code must be 1 letter");
    const { error } = await supabase.from("item_types").insert({ code: newItemCode.toUpperCase(), name: newItemName });
    if (error) return toast.error(error.message);
    setNewItemCode(""); setNewItemName(""); load();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="font-display text-2xl text-primary glow">// Admin Console</h1>

      <Tabs defaultValue="users">
        <TabsList className="bg-card border border-primary/30">
          <TabsTrigger value="users" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Users & Roles</TabsTrigger>
          <TabsTrigger value="depts" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Departments</TabsTrigger>
          <TabsTrigger value="items" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Item Types</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-2 mt-4">
          {profiles.map((p) => (
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

        <TabsContent value="depts" className="space-y-3 mt-4">
          <Card className="bg-card/40 border-primary/30 p-4 space-y-2">
            <h3 className="font-display text-primary text-sm uppercase">Add Department</h3>
            <div className="flex gap-2">
              <div className="w-20"><Label>Code</Label><Input maxLength={1} value={newDeptCode} onChange={(e) => setNewDeptCode(e.target.value)} className="text-center font-display uppercase" /></div>
              <div className="flex-1"><Label>Name</Label><Input value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} maxLength={80} /></div>
              <div className="self-end"><Button onClick={addDept} className="bg-primary text-primary-foreground">Add</Button></div>
            </div>
          </Card>
          <div className="grid sm:grid-cols-2 gap-2">
            {depts.map((d) => (
              <Card key={d.id} className="bg-card/30 border-primary/20 p-3 flex items-center gap-3">
                <span className="font-display text-2xl text-primary glow w-10 text-center">{d.code}</span>
                <span className="text-sm">{d.name}</span>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-3 mt-4">
          <Card className="bg-card/40 border-primary/30 p-4 space-y-2">
            <h3 className="font-display text-primary text-sm uppercase">Add Item Type</h3>
            <div className="flex gap-2">
              <div className="w-20"><Label>Code</Label><Input maxLength={1} value={newItemCode} onChange={(e) => setNewItemCode(e.target.value)} className="text-center font-display uppercase" /></div>
              <div className="flex-1"><Label>Name</Label><Input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} maxLength={80} /></div>
              <div className="self-end"><Button onClick={addItem} className="bg-primary text-primary-foreground">Add</Button></div>
            </div>
          </Card>
          <div className="grid sm:grid-cols-2 gap-2">
            {items.map((i) => (
              <Card key={i.id} className="bg-card/30 border-primary/20 p-3 flex items-center gap-3">
                <span className="font-display text-2xl text-primary glow w-10 text-center">{i.code}</span>
                <span className="text-sm">{i.name}</span>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
