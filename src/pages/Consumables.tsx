import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, Cable, PackagePlus, Plus, ShieldAlert, Wrench } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  AssetConsumableLink,
  ConsumableAggregate,
  ConsumableStock,
  groupConsumablesByAsset,
  getConsumableModeClass,
  getConsumableModeLabel,
  getConsumableSummary,
} from "@/lib/consumables";
import { cn } from "@/lib/utils";

interface AssetOption {
  id: string;
  code: string;
  name: string;
  department_id: string;
  status: string;
}

interface LocationOption {
  id: string;
  name: string;
}

interface DivisionOption {
  id: string;
  name: string;
}

type LinkWithSelection = AssetConsumableLink & { selected?: boolean };

const EMPTY_ATTACH = {
  assetId: "",
  typeId: "",
  locationId: "",
  quantity: "1",
  notes: "",
  followsParent: true,
};

const EMPTY_STOCK = {
  typeId: "",
  locationId: "",
  quantity: "1",
  notes: "",
};

const EMPTY_TYPE = {
  name: "",
  description: "",
  divisionId: "none",
  defaultLocationId: "none",
};

export default function Consumables() {
  const { isAdmin, isAssetManager, assetManagerLocationId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [totals, setTotals] = useState<ConsumableAggregate[]>([]);
  const [stockRows, setStockRows] = useState<ConsumableStock[]>([]);
  const [links, setLinks] = useState<AssetConsumableLink[]>([]);
  const [assets, setAssets] = useState<AssetOption[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [divisions, setDivisions] = useState<DivisionOption[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [damageOpen, setDamageOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [detachLink, setDetachLink] = useState<AssetConsumableLink | null>(null);
  const [reassignLink, setReassignLink] = useState<AssetConsumableLink | null>(null);
  const [overrideAssetId, setOverrideAssetId] = useState("");

  const [typeForm, setTypeForm] = useState(EMPTY_TYPE);
  const [stockForm, setStockForm] = useState(EMPTY_STOCK);
  const [damageForm, setDamageForm] = useState({ ...EMPTY_STOCK, moveToDamaged: true });
  const [attachForm, setAttachForm] = useState(EMPTY_ATTACH);
  const [detachForm, setDetachForm] = useState({ quantity: "1", locationId: "", moveToDamaged: false, notes: "" });
  const [reassignForm, setReassignForm] = useState({ quantity: "1", assetId: "", followsParent: true, notes: "" });

  const load = async () => {
    setLoading(true);
    try {
      const [
        { data: totalsRows, error: totalsError },
        { data: stockData, error: stockError },
        { data: linkData, error: linkError },
        { data: assetData, error: assetError },
        { data: locationData, error: locationError },
        { data: divisionData, error: divisionError },
      ] = await Promise.all([
        supabase.from("consumable_type_totals").select("*").order("name"),
        supabase.from("consumable_stock").select("*"),
        supabase.from("asset_consumables_active").select("*").order("attached_at", { ascending: false }),
        supabase.from("assets").select("id, code, name, department_id, status").order("name"),
        supabase.from("locations").select("id, name").order("name"),
        supabase.from("divisions").select("id, name").order("name"),
      ]);

      if (totalsError || stockError || linkError || assetError || locationError || divisionError) {
        throw totalsError ?? stockError ?? linkError ?? assetError ?? locationError ?? divisionError;
      }

      const scopedAssets = isAssetManager && assetManagerLocationId
        ? (assetData ?? []).filter((asset) => asset.department_id === assetManagerLocationId)
        : assetData ?? [];
      const scopedLinks = isAssetManager && assetManagerLocationId
        ? (linkData ?? []).filter((link) => scopedAssets.some((asset) => asset.id === link.asset_id))
        : linkData ?? [];
      const scopedTotals = (totalsRows ?? []).filter((row) =>
        !isAssetManager || !assetManagerLocationId
          ? true
          : scopedLinks.some((link) => link.consumable_type_id === row.consumable_type_id) ||
            (stockData ?? []).some((stock) => stock.consumable_type_id === row.consumable_type_id && stock.location_id === assetManagerLocationId),
      );
      const scopedStock = isAssetManager && assetManagerLocationId
        ? (stockData ?? []).filter((stock) => stock.location_id === assetManagerLocationId)
        : stockData ?? [];

      setTotals(scopedTotals as ConsumableAggregate[]);
      setStockRows(scopedStock as ConsumableStock[]);
      setLinks(scopedLinks as AssetConsumableLink[]);
      setAssets(scopedAssets as AssetOption[]);
      setLocations(locationData ?? []);
      setDivisions(divisionData ?? []);

      if (isAssetManager && assetManagerLocationId) {
        setStockForm((current) => ({ ...current, locationId: current.locationId || assetManagerLocationId }));
        setDamageForm((current) => ({ ...current, locationId: current.locationId || assetManagerLocationId }));
        setAttachForm((current) => ({ ...current, locationId: current.locationId || assetManagerLocationId }));
      }
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to load consumables.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [isAssetManager, assetManagerLocationId]);

  const locationMap = useMemo(() => Object.fromEntries(locations.map((location) => [location.id, location.name])), [locations]);
  const divisionMap = useMemo(() => Object.fromEntries(divisions.map((division) => [division.id, division.name])), [divisions]);
  const assetMap = useMemo(() => Object.fromEntries(assets.map((asset) => [asset.id, asset])), [assets]);
  const linksByAsset = useMemo(() => groupConsumablesByAsset(links), [links]);
  const stockByType = useMemo(() => {
    return stockRows.reduce<Record<string, ConsumableStock[]>>((acc, row) => {
      if (!acc[row.consumable_type_id]) acc[row.consumable_type_id] = [];
      acc[row.consumable_type_id].push(row);
      return acc;
    }, {});
  }, [stockRows]);
  const linksByType = useMemo(() => {
    return links.reduce<Record<string, AssetConsumableLink[]>>((acc, link) => {
      if (!acc[link.consumable_type_id]) acc[link.consumable_type_id] = [];
      acc[link.consumable_type_id].push(link);
      return acc;
    }, {});
  }, [links]);

  const submitAction = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
      await load();
    } finally {
      setBusy(false);
    }
  };

  const handleCreateType = async (event: FormEvent) => {
    event.preventDefault();
    await submitAction(async () => {
      const { error } = await supabase.rpc("create_consumable_type", {
        target_name: typeForm.name,
        target_description: typeForm.description || null,
        target_division_id: typeForm.divisionId === "none" ? null : typeForm.divisionId,
        target_default_location_id: typeForm.defaultLocationId === "none" ? null : typeForm.defaultLocationId,
      });
      if (error) throw error;
      toast.success("Consumable created.");
      setCreateOpen(false);
      setTypeForm(EMPTY_TYPE);
    });
  };

  const handleAddStock = async (event: FormEvent) => {
    event.preventDefault();
    await submitAction(async () => {
      const { error } = await supabase.rpc("add_consumable_stock", {
        target_consumable_type_id: stockForm.typeId,
        target_location_id: stockForm.locationId,
        quantity_to_add: Number(stockForm.quantity),
        stock_notes: stockForm.notes || null,
      });
      if (error) throw error;
      toast.success("Stock added.");
      setStockOpen(false);
      setStockForm({ ...EMPTY_STOCK, locationId: isAssetManager && assetManagerLocationId ? assetManagerLocationId : "" });
    });
  };

  const handleDamageAdjust = async (event: FormEvent) => {
    event.preventDefault();
    await submitAction(async () => {
      const { error } = await supabase.rpc("adjust_consumable_stock_damage", {
        target_consumable_type_id: damageForm.typeId,
        target_location_id: damageForm.locationId,
        quantity_to_move: Number(damageForm.quantity),
        move_to_damaged: damageForm.moveToDamaged,
        adjustment_notes: damageForm.notes || null,
      });
      if (error) throw error;
      toast.success(damageForm.moveToDamaged ? "Stock marked damaged." : "Damaged stock restored.");
      setDamageOpen(false);
      setDamageForm({ ...EMPTY_STOCK, locationId: isAssetManager && assetManagerLocationId ? assetManagerLocationId : "", moveToDamaged: true });
    });
  };

  const handleAttach = async (event: FormEvent) => {
    event.preventDefault();
    await submitAction(async () => {
      const { error } = await supabase.rpc("attach_consumable_to_asset", {
        target_asset_id: attachForm.assetId,
        target_consumable_type_id: attachForm.typeId,
        source_location_id: attachForm.locationId,
        quantity_to_attach: Number(attachForm.quantity),
        follows_parent_by_default: attachForm.followsParent,
        attach_notes: attachForm.notes || null,
      });
      if (error) throw error;
      toast.success("Consumable attached.");
      setAttachOpen(false);
      setAttachForm({ ...EMPTY_ATTACH, locationId: isAssetManager && assetManagerLocationId ? assetManagerLocationId : "" });
    });
  };

  const handleDetach = async (event: FormEvent) => {
    event.preventDefault();
    if (!detachLink) return;
    await submitAction(async () => {
      const { error } = await supabase.rpc("detach_consumable_from_asset", {
        target_asset_id: detachLink.asset_id,
        target_consumable_type_id: detachLink.consumable_type_id,
        quantity_to_detach: Number(detachForm.quantity),
        destination_location_id: detachForm.locationId,
        move_to_damaged: detachForm.moveToDamaged,
        detach_notes: detachForm.notes || null,
      });
      if (error) throw error;
      toast.success("Consumable detached.");
      setDetachLink(null);
      setDetachForm({ quantity: "1", locationId: "", moveToDamaged: false, notes: "" });
    });
  };

  const handleReassign = async (event: FormEvent) => {
    event.preventDefault();
    if (!reassignLink) return;
    await submitAction(async () => {
      const { error } = await supabase.rpc("reassign_consumable_to_asset", {
        from_asset_id: reassignLink.asset_id,
        to_asset_id: reassignForm.assetId,
        target_consumable_type_id: reassignLink.consumable_type_id,
        quantity_to_move: Number(reassignForm.quantity),
        target_follows_parent: reassignForm.followsParent,
        reassign_notes: reassignForm.notes || null,
      });
      if (error) throw error;
      toast.success("Consumable reassigned.");
      setReassignLink(null);
      setReassignForm({ quantity: "1", assetId: "", followsParent: true, notes: "" });
    });
  };

  const handleOverride = async (assetId: string) => {
    await submitAction(async () => {
      const { error } = await supabase.rpc("admin_override_parent_without_consumables", {
        target_asset_ids: [assetId],
        override_notes: "Admin override applied from Consumables page.",
      });
      if (error) throw error;
      toast.success("Override recorded.");
      setOverrideAssetId("");
    });
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center font-mono text-primary/80">Loading consumables...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-foreground glow-soft">Consumables</h1>
          <p className="text-sm text-muted-foreground">Track spare stock, linked parent bundles, and damage stock without changing the asset workflow.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus size={15} /> Create type
          </Button>
          <Button type="button" variant="outline" onClick={() => setStockOpen(true)} className="gap-2">
            <PackagePlus size={15} /> Add stock
          </Button>
          <Button type="button" variant="outline" onClick={() => setDamageOpen(true)} className="gap-2">
            <Wrench size={15} /> Damage stock
          </Button>
          <Button type="button" onClick={() => setAttachOpen(true)} className="gap-2">
            <Cable size={15} /> Attach to asset
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "In stock", value: totals.reduce((sum, row) => sum + row.in_stock, 0), tone: "text-primary" },
          { label: "Assigned", value: totals.reduce((sum, row) => sum + row.assigned, 0), tone: "text-amber-300" },
          { label: "Permanent", value: totals.reduce((sum, row) => sum + row.permanently_checked_out, 0), tone: "text-violet-300" },
          { label: "Damaged", value: totals.reduce((sum, row) => sum + row.damaged, 0), tone: "text-rose-300" },
        ].map((item) => (
          <Card key={item.label} className="rounded-[1.4rem] border-primary/14 bg-card/70 p-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{item.label}</div>
            <div className={cn("mt-2 font-display text-3xl", item.tone)}>{item.value}</div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Inventory</TabsTrigger>
          <TabsTrigger value="links">Attached</TabsTrigger>
          <TabsTrigger value="assets">By asset</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {totals.length === 0 ? (
            <Card className="rounded-[1.4rem] border-primary/14 bg-card/70 p-8 text-center text-muted-foreground">
              No consumable types created yet.
            </Card>
          ) : (
            totals.map((row) => (
              <Card key={row.consumable_type_id} className="rounded-[1.4rem] border-primary/14 bg-card/70 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-xl text-foreground glow-soft">{row.name}</h2>
                      {row.division_id && <Badge variant="outline">{divisionMap[row.division_id] ?? "Division"}</Badge>}
                    </div>
                    {row.description && <p className="text-sm text-muted-foreground">{row.description}</p>}
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>In stock: {row.in_stock}</span>
                      <span>Assigned: {row.assigned}</span>
                      <span>Permanent: {row.permanently_checked_out}</span>
                      <span>Damaged: {row.damaged}</span>
                    </div>
                  </div>
                  <div className="grid min-w-[260px] grid-cols-2 gap-3 text-sm">
                    <div className="rounded-[1.2rem] border border-primary/12 bg-background px-3 py-3">
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Default base</div>
                      <div className="mt-1 text-foreground">{row.default_location_id ? locationMap[row.default_location_id] ?? "Unknown" : "Not set"}</div>
                    </div>
                    <div className="rounded-[1.2rem] border border-primary/12 bg-background px-3 py-3">
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Attached lines</div>
                      <div className="mt-1 text-foreground">{linksByType[row.consumable_type_id]?.length ?? 0}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <div className="rounded-[1.2rem] border border-primary/12 bg-background p-4">
                    <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Stock by location</div>
                    <div className="space-y-2">
                      {(stockByType[row.consumable_type_id] ?? []).length === 0 ? (
                        <div className="text-sm text-muted-foreground">No stock rows yet.</div>
                      ) : (
                        (stockByType[row.consumable_type_id] ?? []).map((stock) => (
                          <div key={stock.id} className="flex items-center justify-between rounded-xl border border-primary/10 px-3 py-2 text-sm">
                            <div>
                              <div className="text-foreground">{locationMap[stock.location_id] ?? "Unknown location"}</div>
                              <div className="text-xs text-muted-foreground">Available {stock.quantity_available} | Damaged {stock.quantity_damaged}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-[1.2rem] border border-primary/12 bg-background p-4">
                    <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Attached parents</div>
                    <div className="space-y-2">
                      {(linksByType[row.consumable_type_id] ?? []).length === 0 ? (
                        <div className="text-sm text-muted-foreground">Nothing attached right now.</div>
                      ) : (
                        (linksByType[row.consumable_type_id] ?? []).map((link) => (
                          <div key={link.id} className="rounded-xl border border-primary/10 px-3 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="font-medium text-foreground">{link.asset_name}</div>
                              <Badge variant="outline" className="font-mono text-[10px]">{link.asset_code}</Badge>
                              <Badge variant="outline" className={cn("text-[10px]", getConsumableModeClass(link))}>
                                {getConsumableModeLabel(link)}
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">{link.quantity} linked</Badge>
                            </div>
                            {link.notes && <div className="mt-1 text-xs text-muted-foreground">{link.notes}</div>}
                            {isAdmin && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setDetachLink(link);
                                    setDetachForm({ quantity: String(link.quantity), locationId: "", moveToDamaged: false, notes: "" });
                                  }}
                                >
                                  Detach
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setReassignLink(link);
                                    setReassignForm({ quantity: String(link.quantity), assetId: "", followsParent: link.follows_parent, notes: "" });
                                  }}
                                >
                                  Reassign
                                </Button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          {links.length === 0 ? (
            <Card className="rounded-[1.4rem] border-primary/14 bg-card/70 p-8 text-center text-muted-foreground">
              No attached consumables yet.
            </Card>
          ) : (
            links.map((link) => (
              <Card key={link.id} className="rounded-[1.4rem] border-primary/14 bg-card/70 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-display text-lg text-foreground glow-soft">{link.consumable_name}</div>
                      <Badge variant="outline">{link.quantity} linked</Badge>
                      <Badge variant="outline" className={cn("text-[10px]", getConsumableModeClass(link))}>
                        {getConsumableModeLabel(link)}
                      </Badge>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {link.asset_name} ({link.asset_code}) | {link.asset_status.replace(/_/g, " ")}
                    </div>
                    {link.notes && <div className="mt-1 text-xs text-muted-foreground">{link.notes}</div>}
                  </div>
                  {isAdmin ? (
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setDetachLink(link)}>
                        Detach
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setReassignLink(link)}>
                        Reassign
                      </Button>
                    </div>
                  ) : null}
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          {assets.length === 0 ? (
            <Card className="rounded-[1.4rem] border-primary/14 bg-card/70 p-8 text-center text-muted-foreground">
              No assets available in scope.
            </Card>
          ) : (
            assets.map((asset) => {
              const assetLinks = linksByAsset[asset.id] ?? [];
              return (
                <Card key={asset.id} className="rounded-[1.4rem] border-primary/14 bg-card/70 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-display text-lg text-foreground glow-soft">{asset.name}</div>
                        <Badge variant="outline" className="font-mono text-[10px]">{asset.code}</Badge>
                        <Badge variant="outline" className="text-[10px]">{asset.status.replace(/_/g, " ")}</Badge>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {assetLinks.length === 0 ? "No linked consumables." : getConsumableSummary(assetLinks)}
                      </div>
                    </div>
                    {isAdmin && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setOverrideAssetId(asset.id);
                          void handleOverride(asset.id);
                        }}
                        disabled={busy && overrideAssetId === asset.id}
                        className="gap-2"
                      >
                        <ShieldAlert size={14} />
                        {busy && overrideAssetId === asset.id ? "Recording..." : "Record override"}
                      </Button>
                    )}
                  </div>
                  {assetLinks.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {assetLinks.map((link) => (
                        <Badge key={link.id} variant="outline" className={cn("text-[10px]", getConsumableModeClass(link))}>
                          {link.quantity} x {link.consumable_name} | {getConsumableModeLabel(link)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-card sm:max-w-xl" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Create consumable type</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateType}>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={typeForm.name} onChange={(event) => setTypeForm((current) => ({ ...current, name: event.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={typeForm.description} onChange={(event) => setTypeForm((current) => ({ ...current, description: event.target.value }))} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Division</Label>
                <Select value={typeForm.divisionId} onValueChange={(value) => setTypeForm((current) => ({ ...current, divisionId: value }))}>
                  <SelectTrigger><SelectValue placeholder="Optional division" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No division</SelectItem>
                    {divisions.map((division) => (
                      <SelectItem key={division.id} value={division.id}>{division.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default location</Label>
                <Select value={typeForm.defaultLocationId} onValueChange={(value) => setTypeForm((current) => ({ ...current, defaultLocationId: value }))}>
                  <SelectTrigger><SelectValue placeholder="Optional base" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No default</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={busy}>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={stockOpen} onOpenChange={setStockOpen}>
        <DialogContent className="bg-card sm:max-w-xl" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Add consumable stock</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={handleAddStock}>
            <div className="space-y-2">
              <Label>Consumable type</Label>
              <Select value={stockForm.typeId} onValueChange={(value) => setStockForm((current) => ({ ...current, typeId: value }))}>
                <SelectTrigger><SelectValue placeholder="Choose a type" /></SelectTrigger>
                <SelectContent>
                  {totals.map((row) => (
                    <SelectItem key={row.consumable_type_id} value={row.consumable_type_id}>{row.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Location</Label>
                {isAssetManager && assetManagerLocationId ? (
                  <div className="rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary/90">{locationMap[assetManagerLocationId] ?? "Locked location"}</div>
                ) : (
                  <Select value={stockForm.locationId} onValueChange={(value) => setStockForm((current) => ({ ...current, locationId: value }))}>
                    <SelectTrigger><SelectValue placeholder="Choose location" /></SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" min="1" step="1" value={stockForm.quantity} onChange={(event) => setStockForm((current) => ({ ...current, quantity: event.target.value }))} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={stockForm.notes} onChange={(event) => setStockForm((current) => ({ ...current, notes: event.target.value }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStockOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={busy}>Add stock</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={damageOpen} onOpenChange={setDamageOpen}>
        <DialogContent className="bg-card sm:max-w-xl" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Adjust damaged stock</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={handleDamageAdjust}>
            <div className="space-y-2">
              <Label>Consumable type</Label>
              <Select value={damageForm.typeId} onValueChange={(value) => setDamageForm((current) => ({ ...current, typeId: value }))}>
                <SelectTrigger><SelectValue placeholder="Choose a type" /></SelectTrigger>
                <SelectContent>
                  {totals.map((row) => (
                    <SelectItem key={row.consumable_type_id} value={row.consumable_type_id}>{row.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Location</Label>
                {isAssetManager && assetManagerLocationId ? (
                  <div className="rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary/90">{locationMap[assetManagerLocationId] ?? "Locked location"}</div>
                ) : (
                  <Select value={damageForm.locationId} onValueChange={(value) => setDamageForm((current) => ({ ...current, locationId: value }))}>
                    <SelectTrigger><SelectValue placeholder="Choose location" /></SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" min="1" step="1" value={damageForm.quantity} onChange={(event) => setDamageForm((current) => ({ ...current, quantity: event.target.value }))} required />
              </div>
            </div>
            <label className="flex items-center gap-3 rounded-xl border border-primary/12 px-3 py-3 text-sm">
              <Checkbox checked={damageForm.moveToDamaged} onCheckedChange={(checked) => setDamageForm((current) => ({ ...current, moveToDamaged: checked === true }))} />
              Move available stock into damaged stock
            </label>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={damageForm.notes} onChange={(event) => setDamageForm((current) => ({ ...current, notes: event.target.value }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDamageOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={busy}>{damageForm.moveToDamaged ? "Mark damaged" : "Restore stock"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={attachOpen} onOpenChange={setAttachOpen}>
        <DialogContent className="bg-card sm:max-w-xl" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Attach consumable to asset</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={handleAttach}>
            <div className="space-y-2">
              <Label>Parent asset</Label>
              <Select value={attachForm.assetId} onValueChange={(value) => setAttachForm((current) => ({ ...current, assetId: value }))}>
                <SelectTrigger><SelectValue placeholder="Choose an asset" /></SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>{asset.name} ({asset.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Consumable type</Label>
                <Select value={attachForm.typeId} onValueChange={(value) => setAttachForm((current) => ({ ...current, typeId: value }))}>
                  <SelectTrigger><SelectValue placeholder="Choose a type" /></SelectTrigger>
                  <SelectContent>
                    {totals.map((row) => (
                      <SelectItem key={row.consumable_type_id} value={row.consumable_type_id}>{row.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stock location</Label>
                {isAssetManager && assetManagerLocationId ? (
                  <div className="rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary/90">{locationMap[assetManagerLocationId] ?? "Locked location"}</div>
                ) : (
                  <Select value={attachForm.locationId} onValueChange={(value) => setAttachForm((current) => ({ ...current, locationId: value }))}>
                    <SelectTrigger><SelectValue placeholder="Choose location" /></SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" min="1" step="1" value={attachForm.quantity} onChange={(event) => setAttachForm((current) => ({ ...current, quantity: event.target.value }))} required />
              </div>
              <label className="flex items-center gap-3 rounded-xl border border-primary/12 px-3 py-3 text-sm">
                <Checkbox checked={attachForm.followsParent} onCheckedChange={(checked) => setAttachForm((current) => ({ ...current, followsParent: checked === true }))} />
                Follows parent workflow
              </label>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={attachForm.notes} onChange={(event) => setAttachForm((current) => ({ ...current, notes: event.target.value }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAttachOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={busy}>Attach</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detachLink} onOpenChange={(open) => !open && setDetachLink(null)}>
        <DialogContent className="bg-card sm:max-w-xl" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Detach consumable</DialogTitle></DialogHeader>
          {detachLink && (
            <form className="space-y-4" onSubmit={handleDetach}>
              <div className="rounded-xl border border-primary/12 bg-background px-4 py-3 text-sm">
                {detachLink.consumable_name} from {detachLink.asset_name} ({detachLink.asset_code})
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input type="number" min="1" max={detachLink.quantity} step="1" value={detachForm.quantity} onChange={(event) => setDetachForm((current) => ({ ...current, quantity: event.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Return location</Label>
                  <Select value={detachForm.locationId} onValueChange={(value) => setDetachForm((current) => ({ ...current, locationId: value }))}>
                    <SelectTrigger><SelectValue placeholder="Choose location" /></SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <label className="flex items-center gap-3 rounded-xl border border-primary/12 px-3 py-3 text-sm">
                <Checkbox checked={detachForm.moveToDamaged} onCheckedChange={(checked) => setDetachForm((current) => ({ ...current, moveToDamaged: checked === true }))} />
                Return detached quantity to damaged stock
              </label>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={detachForm.notes} onChange={(event) => setDetachForm((current) => ({ ...current, notes: event.target.value }))} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDetachLink(null)}>Cancel</Button>
                <Button type="submit" disabled={busy}>Detach</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!reassignLink} onOpenChange={(open) => !open && setReassignLink(null)}>
        <DialogContent className="bg-card sm:max-w-xl" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Reassign consumable</DialogTitle></DialogHeader>
          {reassignLink && (
            <form className="space-y-4" onSubmit={handleReassign}>
              <div className="rounded-xl border border-primary/12 bg-background px-4 py-3 text-sm">
                {reassignLink.consumable_name} from {reassignLink.asset_name} ({reassignLink.asset_code})
              </div>
              <div className="space-y-2">
                <Label>Move to asset</Label>
                <Select value={reassignForm.assetId} onValueChange={(value) => setReassignForm((current) => ({ ...current, assetId: value }))}>
                  <SelectTrigger><SelectValue placeholder="Choose destination asset" /></SelectTrigger>
                  <SelectContent>
                    {assets
                      .filter((asset) => asset.id !== reassignLink.asset_id)
                      .map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>{asset.name} ({asset.code})</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input type="number" min="1" max={reassignLink.quantity} step="1" value={reassignForm.quantity} onChange={(event) => setReassignForm((current) => ({ ...current, quantity: event.target.value }))} required />
                </div>
                <label className="flex items-center gap-3 rounded-xl border border-primary/12 px-3 py-3 text-sm">
                  <Checkbox checked={reassignForm.followsParent} onCheckedChange={(checked) => setReassignForm((current) => ({ ...current, followsParent: checked === true }))} />
                  Follows destination parent
                </label>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={reassignForm.notes} onChange={(event) => setReassignForm((current) => ({ ...current, notes: event.target.value }))} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setReassignLink(null)}>Cancel</Button>
                <Button type="submit" disabled={busy} className="gap-2">
                  <ArrowRightLeft size={14} /> Reassign
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
