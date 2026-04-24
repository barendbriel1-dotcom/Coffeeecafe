import { useEffect, useMemo, useState } from "react";
import { Package, Search } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { buildSearchBlob, getAssetStatusLabel, getStatusBadgeClass, LOCATION_NAMES, normalizeAssetStatus } from "@/lib/assets";
import { cn } from "@/lib/utils";

interface Asset {
  id: string;
  code: string;
  name: string;
  status: string;
  department_id: string;
  current_location_id: string | null;
  division_id: string | null;
}

interface Loc {
  id: string;
  name: string;
}

interface Div {
  id: string;
  name: string;
}

export default function SignOut({ bulk = false }: { bulk?: boolean }) {
  const { user, isStaff } = useAuth();
  const [available, setAvailable] = useState<Asset[]>([]);
  const [locations, setLocations] = useState<Loc[]>([]);
  const [divisions, setDivisions] = useState<Div[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [recipientName, setRecipientName] = useState("");
  const [packageName, setPackageName] = useState("");
  const [notes, setNotes] = useState("");
  const [signOutAt, setSignOutAt] = useState(() => new Date());
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("available");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterDivision, setFilterDivision] = useState("all");

  const KIT_TEMPLATES = [
    { name: "Camera 5 (Wireless)", items: ["Camera 5", "Lens", "Charger", "Battery", "Wireless", "SD", "Cable"] },
    { name: "Camera 6 (Wireless)", items: ["Camera 6", "Lens", "Charger", "Battery", "Wireless", "SD", "Cable"] },
    { name: "Photo Camera 1", items: ["Photo Camera 1", "Lens", "Meta", "Battery", "SD", "Charger"] },
    { name: "Photo Camera 2", items: ["Photo Camera 2", "Lens", "Meta", "Battery", "SD", "Charger"] },
  ];

  const load = async () => {
    const [{ data: assetRows }, { data: profileRow }, { data: locationRows }, { data: divisionRows }] = await Promise.all([
      supabase.from("assets").select("id, code, name, status, department_id, current_location_id, division_id").order("name"),
      supabase.from("profiles").select("display_name").eq("id", user?.id).maybeSingle(),
      supabase.from("locations").select("id, name"),
      supabase.from("divisions").select("id, name"),
    ]);

    const orderedLocations = (locationRows ?? []).sort((a: Loc, b: Loc) => {
      const aIndex = LOCATION_NAMES.indexOf(a.name as (typeof LOCATION_NAMES)[number]);
      const bIndex = LOCATION_NAMES.indexOf(b.name as (typeof LOCATION_NAMES)[number]);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    setAvailable(assetRows ?? []);
    setLocations(orderedLocations);
    setDivisions(divisionRows ?? []);
    setRecipientName(profileRow?.display_name ?? user?.email ?? "Current user");
  };

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => setSignOutAt(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const divisionMap = useMemo(() => Object.fromEntries(divisions.map((division) => [division.id, division.name])), [divisions]);
  const locationMap = useMemo(() => Object.fromEntries(locations.map((location) => [location.id, location.name])), [locations]);

  const filteredAssets = available.filter((asset) => {
    const normalizedStatus = normalizeAssetStatus(asset.status);
    const effectiveLocationId = asset.current_location_id ?? asset.department_id;
    const locationName = locationMap[effectiveLocationId] ?? "";
    const divisionName = asset.division_id ? divisionMap[asset.division_id] ?? "" : "";
    const searchBlob = buildSearchBlob([asset.code, asset.name, locationName, divisionName, getAssetStatusLabel(normalizedStatus)]);
    const matchesQuery = !q.trim() || searchBlob.includes(q.trim().toLowerCase());
    const matchesStatus = filterStatus === "all" || normalizedStatus === filterStatus;
    const matchesLocation = filterLocation === "all" || effectiveLocationId === filterLocation;
    const matchesDivision = filterDivision === "all" || asset.division_id === filterDivision;
    return matchesQuery && matchesStatus && matchesLocation && matchesDivision;
  });

  const toggle = (id: string) => {
    const asset = available.find((entry) => entry.id === id);
    if (!asset || normalizeAssetStatus(asset.status) !== "available") return;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const submit = async () => {
    if (!isStaff) {
      toast.error("Staff or admin access is required.");
      return;
    }

    if (selected.size === 0) {
      toast.error("Select at least one asset.");
      return;
    }

    const traveling = locations.find((location) => location.name === "Traveling");
    if (!traveling) {
      toast.error("Traveling location was not found.");
      return;
    }

    setBusy(true);

    try {
      const { data: signout, error } = await supabase
        .from("signouts")
        .insert({
          signed_out_by: user!.id,
          signed_out_to: user!.id,
          to_department_id: traveling.id,
          package_name: bulk ? (packageName || "Bulk package") : null,
          notes: notes || null,
          expected_return: signOutAt.toISOString(),
        })
        .select("id")
        .single();

      if (error) throw error;

      const ids = [...selected];
      const { error: itemsError } = await supabase.from("signout_items").insert(ids.map((asset_id) => ({ signout_id: signout.id, asset_id })));
      if (itemsError) throw itemsError;

      const { error: updateError } = await supabase
        .from("assets")
        .update({
          status: "signed_out",
          current_holder: user!.id,
          current_location_id: traveling.id,
        } as any)
        .in("id", ids);

      if (updateError) throw updateError;

      await supabase.from("asset_history").insert(
        ids.map((asset_id) => ({
          asset_id,
          action: "signed_out",
          performed_by: user!.id,
          to_user: user!.id,
          notes: bulk ? `Bulk package: ${packageName}` : "Location moved to Traveling.",
        })),
      );

      toast.success(`Signed out ${ids.length} asset(s). Location moved to Traveling.`);
      setSelected(new Set());
      setPackageName("");
      setNotes("");
      setSignOutAt(new Date());
      load();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to sign out the selected assets.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-foreground glow-soft">{bulk ? "Bulk sign out" : "Sign out"}</h1>
        </div>
        {bulk && (
          <Badge variant="outline" className="border-primary/30 bg-primary/10 px-3 py-1.5 font-mono text-primary">
            {selected.size} asset{selected.size === 1 ? "" : "s"} in bundle
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card className="space-y-4 bg-card/40 p-4">
            <h2 className="font-display text-sm uppercase tracking-[0.2em] text-primary">Sign-out details</h2>

            {bulk && (
              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Package name</Label>
                <Input value={packageName} onChange={(event) => setPackageName(event.target.value)} placeholder="Sunday service kit A" />
              </div>
            )}

            <div className="space-y-2">
              <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">User receiving the item</Label>
              <Input value={recipientName} readOnly className="text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Sign-out date and time</Label>
              <Input value={signOutAt.toLocaleString()} readOnly className="text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Notes</Label>
              <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional checkout notes..." />
            </div>

            <Button onClick={submit} disabled={busy || selected.size === 0} className="w-full">
              {busy ? "Processing..." : `Confirm sign out (${selected.size})`}
            </Button>
          </Card>

          {bulk && (
            <Card className="space-y-3 bg-card/40 p-4">
              <h2 className="font-display text-sm uppercase tracking-[0.2em] text-primary">Quick kit templates</h2>
              <div className="grid gap-2">
                {KIT_TEMPLATES.map((template) => (
                  <Button
                    key={template.name}
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      setQ(template.items[0]);
                      setPackageName(template.name);
                      toast.info(`Selected ${template.name}.`);
                    }}
                  >
                    <Package size={14} className="mr-2 opacity-70" />
                    {template.name}
                  </Button>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card className="space-y-4 bg-card/40 p-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_220px_220px_220px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-muted-foreground" size={16} />
                <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search by tag, name, division, location..." className="pl-9" />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="signed_out">Signed Out</SelectItem>
                  <SelectItem value="out_for_repairs">Out for Repairs</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger><SelectValue placeholder="Location" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterDivision} onValueChange={setFilterDivision}>
                <SelectTrigger><SelectValue placeholder="Division" /></SelectTrigger>
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
          </Card>

          <Card className="min-h-[400px] bg-card/40 p-4">
            <div className="mb-4 flex items-center justify-between border-b border-primary/10 pb-2">
              <h2 className="font-display text-sm uppercase tracking-[0.2em] text-primary">Assets</h2>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {filteredAssets.length} item{filteredAssets.length === 1 ? "" : "s"} found
              </div>
            </div>

            <div className="grid max-h-[500px] grid-cols-1 gap-2 overflow-auto pr-1 md:grid-cols-2">
              {filteredAssets.length === 0 && (
                <div className="col-span-full py-12 text-center font-mono text-sm text-muted-foreground/60">
                  No matching available assets were found.
                </div>
              )}

              {filteredAssets.map((asset) => (
                <label
                  key={asset.id}
                  className={cn(
                    "relative flex cursor-pointer items-center gap-3 rounded-[1.2rem] border p-3 transition-all",
                    selected.has(asset.id)
                      ? "border-primary/35 bg-primary/10 shadow-[0_0_24px_hsl(var(--primary)/0.1)]"
                      : normalizeAssetStatus(asset.status) === "available"
                        ? "border-primary/10 bg-primary/5 hover:border-primary/24 hover:bg-primary/8"
                        : "cursor-not-allowed border-primary/10 bg-card/90 opacity-60",
                  )}
                >
                  <Checkbox
                    checked={selected.has(asset.id)}
                    disabled={normalizeAssetStatus(asset.status) !== "available"}
                    onCheckedChange={() => toggle(asset.id)}
                  />

                  <div className="min-w-0 flex-1">
                    <div className={cn("font-display text-sm tracking-[0.14em]", selected.has(asset.id) ? "text-primary glow-soft" : "text-foreground")}>
                      {asset.code}
                    </div>
                    <div className="truncate text-sm text-foreground/85">{asset.name}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={cn("uppercase tracking-[0.16em]", getStatusBadgeClass(asset.status))}>
                        {getAssetStatusLabel(asset.status)}
                      </Badge>
                      <span className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {asset.division_id ? divisionMap[asset.division_id] ?? "Division" : "Division"} | {locationMap[asset.current_location_id ?? asset.department_id] ?? "Location"}
                      </span>
                    </div>
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
