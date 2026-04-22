import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Search } from "lucide-react";

interface Asset { id: string; code: string; name: string; status: string; department_id: string; item_type_id: string; }
interface Profile { id: string; display_name: string; }
interface Dept { id: string; name: string; code: string; }
interface ItemType { id: string; name: string; code: string; }

export default function SignOut({ bulk = false }: { bulk?: boolean }) {
  const { user, isStaff } = useAuth();
  const [available, setAvailable] = useState<Asset[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [depts, setDepts] = useState<Dept[]>([]);
  const [items, setItems] = useState<ItemType[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  
  const [toUser, setToUser] = useState("");
  const [toDept, setToDept] = useState("");
  const [packageName, setPackageName] = useState("");
  const [notes, setNotes] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("");
  const [busy, setBusy] = useState(false);

  // Search & Filter State
  const [q, setQ] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterItem, setFilterItem] = useState("all");

  // Multi-code search
  const [multiSearch, setMultiSearch] = useState("");

  const KIT_TEMPLATES = [
    { name: "Camera 5 (Wireless)", items: ["Camera 5", "Lens", "Charger", "Battery", "Wireless", "SD", "Cable"] },
    { name: "Camera 6 (Wireless)", items: ["Camera 6", "Lens", "Charger", "Battery", "Wireless", "SD", "Cable"] },
    { name: "Photo Camera 1", items: ["Photo Camera 1", "Lens", "Meta", "Battery", "SD", "Charger"] },
    { name: "Photo Camera 2", items: ["Photo Camera 2", "Lens", "Meta", "Battery", "SD", "Charger"] },
  ];

  const applyMultiSearch = () => {
    const codes = multiSearch.split(/[\s,]+/).map(c => c.trim().toUpperCase()).filter(c => c.length > 0);
    if (codes.length === 0) return;

    const toSelect = available.filter(a => codes.includes(a.code.toUpperCase())).map(a => a.id);
    if (toSelect.length > 0) {
      const next = new Set(selected);
      toSelect.forEach(id => next.add(id));
      setSelected(next);
      setMultiSearch("");
      toast.success(`Added ${toSelect.length} asset(s) from search`);
    } else {
      toast.error("No matching available assets found for those codes");
    }
  };

  const load = async () => {
    const [{ data: a }, { data: p }, { data: d }, { data: i }] = await Promise.all([
      supabase.from("assets").select("id, code, name, status, department_id, item_type_id").eq("status", "available").order("code"),
      supabase.from("profiles").select("id, display_name").order("display_name"),
      supabase.from("departments").select("id, code, name").order("name"),
      supabase.from("item_types").select("id, code, name").order("name"),
    ]);
    setAvailable(a ?? []);
    setProfiles(p ?? []);
    setDepts(d ?? []);
    setItems(i ?? []);
  };
  useEffect(() => { load(); }, []);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  const submit = async () => {
    if (!isStaff) { toast.error("Insufficient privileges"); return; }
    if (selected.size === 0) { toast.error("Select at least one asset"); return; }
    if (!toUser) { toast.error("Choose a recipient"); return; }
    if (!toDept) { toast.error("Choose a To Department / Location"); return; }
    setBusy(true);
    try {
      const { data: signout, error } = await supabase
        .from("signouts")
        .insert({
          signed_out_by: user!.id,
          signed_out_to: toUser,
          to_department_id: toDept || null,
          package_name: bulk ? (packageName || "Bulk package") : null,
          notes: notes || null,
          expected_return: expectedReturn ? new Date(expectedReturn).toISOString() : null,
        })
        .select("id")
        .single();
      if (error) throw error;

      const ids = [...selected];
      const { error: itemsErr } = await supabase.from("signout_items")
        .insert(ids.map((asset_id) => ({ signout_id: signout.id, asset_id })));
      if (itemsErr) throw itemsErr;

      const { error: updErr } = await supabase.from("assets").update({
        status: "signed_out",
        current_holder: toUser,
        current_location_id: toDept || null,
      }).in("id", ids);
      if (updErr) throw updErr;

      await supabase.from("asset_history").insert(ids.map((asset_id) => ({
        asset_id, action: "signed_out", performed_by: user!.id, to_user: toUser,
        notes: bulk ? `Bulk: ${packageName}` : null,
      })));

      toast.success(`Signed out ${ids.length} asset(s)`);
      setSelected(new Set()); setToUser(""); setToDept(""); setPackageName(""); setNotes(""); setExpectedReturn("");
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally { setBusy(false); }
  };

  const filteredAssets = available.filter(a => {
    const matchesQ = !q || a.code.toLowerCase().includes(q.toLowerCase()) || a.name.toLowerCase().includes(q.toLowerCase());
    const matchesDept = filterDept === "all" || a.department_id === filterDept;
    const matchesItem = filterItem === "all" || a.item_type_id === filterItem;
    return matchesQ && matchesDept && matchesItem;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="font-display text-2xl text-primary glow">
            // {bulk ? "Bulk SignOut" : "SignOut"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {bulk
              ? "Rapidly bundle assets into kits based on Event Checkout Forms."
              : "Pick an available asset and recipient. Returns require Admin processing."}
          </p>
        </div>
        {bulk && (
          <Badge variant="outline" className="border-primary/60 text-primary py-1 px-3 font-mono box-glow-soft">
            {selected.size} ASSETS IN BUNDLE
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Sign-out Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-card/40 border-primary/30 p-4 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 -rotate-45 translate-x-6 -translate-y-6" />
            
            <h2 className="font-display text-xs text-primary uppercase tracking-[0.2em] mb-2">// Session Data</h2>
            
            {bulk && (
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-primary/60">Package Name</Label>
                <Input 
                  value={packageName} 
                  onChange={(e) => setPackageName(e.target.value)} 
                  placeholder="Sunday Service Kit A" 
                  className="bg-primary/5 border-primary/20 font-mono"
                />
              </div>
            )}
            
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-primary/60">Recipient</Label>
              <Select value={toUser} onValueChange={setToUser}>
                <SelectTrigger className="bg-primary/5 border-primary/20 font-mono">
                  <SelectValue placeholder="Select operative" />
                </SelectTrigger>
                <SelectContent className="font-mono">
                  {profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-primary/60">Destination / Location</Label>
              <Select value={toDept} onValueChange={setToDept}>
                <SelectTrigger className="bg-primary/5 border-primary/20 font-mono">
                  <SelectValue placeholder="Required" />
                </SelectTrigger>
                <SelectContent className="font-mono">
                  {depts.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-primary/60">Expected Return</Label>
              <Input 
                type="datetime-local" 
                value={expectedReturn} 
                onChange={(e) => setExpectedReturn(e.target.value)} 
                className="bg-primary/5 border-primary/20 font-mono calendar-icon-green"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-primary/60">Notes</Label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                className="bg-primary/5 border-primary/20 font-mono min-h-[80px]"
                placeholder="Incident details or special instructions..."
              />
            </div>

            <Button 
              onClick={submit} 
              disabled={busy || selected.size === 0} 
              className="w-full bg-primary text-black hover:bg-primary/90 font-display tracking-[0.2em] uppercase transition-all box-glow-soft h-12"
            >
              {busy ? "Processing..." : `▸ Confirm SignOut (${selected.size})`}
            </Button>
          </Card>

          {bulk && (
            <Card className="bg-card/40 border-primary/30 p-4">
              <h2 className="font-display text-xs text-primary uppercase tracking-[0.2em] mb-4">// Quick Kit Templates</h2>
              <div className="grid grid-cols-1 gap-2">
                {KIT_TEMPLATES.map((k) => (
                  <Button
                    key={k.name}
                    variant="outline"
                    className="justify-start border-primary/20 text-primary/70 hover:text-primary hover:border-primary/60 font-mono text-xs uppercase"
                    onClick={() => {
                      setQ(k.items[0]); // Search for first item to help
                      setPackageName(k.name);
                      toast.info(`Selected ${k.name}. Now picking items...`);
                    }}
                  >
                    <Package size={14} className="mr-2 opacity-50" />
                    {k.name}
                  </Button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Asset Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card/40 border-primary/30 p-4">
            <div className="flex flex-col gap-4">
              {/* Multi-code rapid entry */}
              <div className="space-y-2 pb-4 border-b border-primary/10">
                <Label className="text-[10px] uppercase tracking-widest text-primary/60">Rapid Entry (Paste Asset Codes)</Label>
                <div className="flex gap-2">
                  <Input 
                    value={multiSearch} 
                    onChange={(e) => setMultiSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyMultiSearch()}
                    placeholder="AA015, AA016, AA017..." 
                    className="font-mono bg-primary/5 border-primary/30 focus:border-primary/60 transition-all uppercase"
                  />
                  <Button onClick={applyMultiSearch} className="bg-primary/20 hover:bg-primary/40 text-primary border border-primary/40 font-mono px-6">
                    ADD
                  </Button>
                </div>
                <p className="text-[9px] text-muted-foreground font-mono italic">// Separate codes with spaces or commas for fast batch selection.</p>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                  <Input 
                    value={q} 
                    onChange={(e) => setQ(e.target.value)} 
                    placeholder="Search asset registry..." 
                    className="pl-9 font-mono bg-primary/5 border-primary/20" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
                  <Select value={filterDept} onValueChange={setFilterDept}>
                    <SelectTrigger className="font-mono bg-primary/5 border-primary/20 text-xs h-10 min-w-[140px]">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent className="font-mono">
                      <SelectItem value="all">All Locations</SelectItem>
                      {depts.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filterItem} onValueChange={setFilterItem}>
                    <SelectTrigger className="font-mono bg-primary/5 border-primary/20 text-xs h-10 min-w-[140px]">
                      <SelectValue placeholder="Division" />
                    </SelectTrigger>
                    <SelectContent className="font-mono">
                      <SelectItem value="all">All Divisions</SelectItem>
                      {items.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-card/40 border-primary/30 p-4 min-h-[400px]">
            <div className="flex items-center justify-between mb-4 border-b border-primary/10 pb-2">
              <h2 className="font-display text-xs text-primary uppercase tracking-[0.2em]">Available Inventory</h2>
              <div className="font-mono text-[10px] text-muted-foreground uppercase">
                {filteredAssets.length} items found
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[500px] overflow-auto pr-1">
              {filteredAssets.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <div className="font-mono text-sm text-muted-foreground/50 italic">// NO MATCHING ASSETS FOUND</div>
                </div>
              )}
              {filteredAssets.map((a) => (
                <label 
                  key={a.id} 
                  className={cn(
                    "flex items-center gap-3 rounded border p-3 cursor-pointer transition-all duration-200 group relative overflow-hidden",
                    selected.has(a.id) 
                      ? "border-primary/60 bg-primary/10 box-glow-soft" 
                      : "border-primary/10 bg-primary/5 hover:border-primary/40 hover:bg-primary/5"
                  )}
                >
                  {selected.has(a.id) && (
                    <div className="absolute top-0 right-0 w-8 h-8 bg-primary/20 flex items-center justify-center">
                      <div className="size-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,65,0.8)]" />
                    </div>
                  )}
                  <Checkbox 
                    checked={selected.has(a.id)} 
                    onCheckedChange={() => toggle(a.id)}
                    className="border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:text-black"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className={cn(
                      "font-display text-sm tracking-widest",
                      selected.has(a.id) ? "text-primary glow-soft" : "text-primary/70 group-hover:text-primary"
                    )}>
                      {a.code}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase truncate font-mono">
                      {a.name}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
