import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Download, ExternalLink, FileSpreadsheet, Plus, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  buildSearchBlob,
  DEFAULT_ASSET_TYPE_NAME,
  generateAssetTag,
  generateNameCode,
  getAssetStatusLabel,
  getStatusBadgeClass,
  getTagPrefix,
  groupAssetsByName,
  LOCATION_NAMES,
  normalizeAssetStatus,
} from "@/lib/assets";
import { cn } from "@/lib/utils";

interface Asset {
  id: string;
  code: string;
  name: string;
  status: string;
  description: string | null;
  serial_number: string | null;
  department_id: string;
  item_type_id: string;
  division_id: string | null;
  current_holder: string | null;
  current_location_id: string | null;
}

interface LocationRow {
  id: string;
  code: string;
  name: string;
  is_storage?: boolean;
}

interface DivisionRow {
  id: string;
  code: string | null;
  name: string;
}

interface AssetDeleteRequestRow {
  id: string;
  asset_id: string;
  requested_by: string;
  created_at: string;
}

const normalizeImportKey = (value: string) => {
  const compact = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  switch (compact) {
    case "devision":
      return "division";
    case "item_name":
      return "name";
    case "asset_tag":
      return "tag";
    default:
      return compact;
  }
};

const rowsToCsv = (rows: (string | number | boolean | null | undefined)[][]) => {
  const worksheet = XLSX.utils.aoa_to_sheet(
    rows.map((row) =>
      row.map((cell) => {
        if (cell === null || typeof cell === "undefined") return "";
        return String(cell).trim();
      }),
    ),
  );

  return XLSX.utils.sheet_to_csv(worksheet);
};

export default function Assets() {
  const { isAdmin, user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialStatus = normalizeAssetStatus(searchParams.get("status") || "available") || "all";
  const [assets, setAssets] = useState<Asset[]>([]);
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [divisions, setDivisions] = useState<DivisionRow[]>([]);
  const [pendingDeleteRequests, setPendingDeleteRequests] = useState<AssetDeleteRequestRow[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") ? normalizeAssetStatus(searchParams.get("status") || "") : "all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [importing, setImporting] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [serial, setSerial] = useState("");
  const [locationId, setLocationId] = useState("");
  const [divisionId, setDivisionId] = useState("");
  const [newDivisionName, setNewDivisionName] = useState("");
  const [addingDivision, setAddingDivision] = useState(false);
  const [activeGroupKey, setActiveGroupKey] = useState<string | null>(null);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [requestingDelete, setRequestingDelete] = useState(false);
  const [approvingDelete, setApprovingDelete] = useState(false);
  const [cancellingDeleteId, setCancellingDeleteId] = useState<string | null>(null);

  const load = async () => {
    const deleteRequestsPromise = isAdmin
      ? supabase.from("asset_delete_requests").select("id, asset_id, requested_by, created_at").order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null });

    const [{ data: assetRows }, { data: locationRows }, { data: divisionRows }, { data: deleteRequestRows }] = await Promise.all([
      supabase.from("assets").select("*").order("name"),
      supabase.from("locations").select("*"),
      supabase.from("divisions").select("*").order("name"),
      deleteRequestsPromise,
    ]);

    const orderedLocations = (locationRows ?? []).sort((a: LocationRow, b: LocationRow) => {
      const aIndex = LOCATION_NAMES.indexOf(a.name as (typeof LOCATION_NAMES)[number]);
      const bIndex = LOCATION_NAMES.indexOf(b.name as (typeof LOCATION_NAMES)[number]);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    setAssets(assetRows ?? []);
    setLocations(orderedLocations);
    setDivisions(divisionRows ?? []);
    setPendingDeleteRequests((deleteRequestRows ?? []) as AssetDeleteRequestRow[]);
  };

  useEffect(() => {
    load();
  }, [isAdmin]);

  useEffect(() => {
    const existingIds = new Set(assets.map((asset) => asset.id));
    setSelectedAssetIds((current) => current.filter((id) => existingIds.has(id)));
  }, [assets]);

  const divisionMap = useMemo(() => Object.fromEntries(divisions.map((division) => [division.id, division.name])), [divisions]);
  const locationMap = useMemo(() => Object.fromEntries(locations.map((location) => [location.id, location.name])), [locations]);
  const assetById = useMemo(() => Object.fromEntries(assets.map((asset) => [asset.id, asset])), [assets]);
  const selectedAssetIdSet = useMemo(() => new Set(selectedAssetIds), [selectedAssetIds]);
  const pendingDeleteAssetIdSet = useMemo(() => new Set(pendingDeleteRequests.map((request) => request.asset_id)), [pendingDeleteRequests]);

  useEffect(() => {
    if (searchParams.get("status")) {
      setStatusFilter(initialStatus);
    }
  }, [initialStatus, searchParams]);

  const groupedAssets = useMemo(
    () =>
      groupAssetsByName(assets, (asset) => {
        const currentLocationId = asset.current_location_id ?? asset.department_id;
        return locationMap[currentLocationId] ?? "";
      }),
    [assets, locationMap],
  );

  const filteredGroups = useMemo(() => {
    const normalizedQuery = q.trim().toLowerCase();

    return groupedAssets.filter((group) =>
      group.items.some((asset) => {
        const normalizedStatus = normalizeAssetStatus(asset.status);
        const currentLocationId = asset.current_location_id ?? asset.department_id;
        const currentLocationName = locationMap[currentLocationId] ?? "";
        const divisionName = asset.division_id ? divisionMap[asset.division_id] ?? "" : "";
        const searchBlob = buildSearchBlob([
          group.name,
          asset.name,
          asset.code,
          currentLocationName,
          divisionName,
          getAssetStatusLabel(normalizedStatus),
          asset.description,
          asset.serial_number,
        ]);

        const matchesQuery = !normalizedQuery || searchBlob.includes(normalizedQuery);
        const matchesStatus = statusFilter === "all" || normalizedStatus === statusFilter;
        const matchesLocation = locationFilter === "all" || currentLocationId === locationFilter;
        return matchesQuery && matchesStatus && matchesLocation;
      }),
    );
  }, [divisionMap, groupedAssets, locationMap, q, statusFilter, locationFilter]);

  const activeGroup = useMemo(
    () => groupedAssets.find((group) => group.key === activeGroupKey) ?? null,
    [activeGroupKey, groupedAssets],
  );

  const pendingDeleteDetails = useMemo(
    () =>
      pendingDeleteRequests
        .map((request) => ({
          ...request,
          asset: assetById[request.asset_id] ?? null,
        }))
        .filter((request) => request.asset),
    [assetById, pendingDeleteRequests],
  );

  const filteredAssetIds = useMemo(
    () => filteredGroups.flatMap((group) => group.items.map((asset) => asset.id)),
    [filteredGroups],
  );

  const allVisibleSelected = filteredAssetIds.length > 0 && filteredAssetIds.every((id) => selectedAssetIdSet.has(id));
  const someVisibleSelected = filteredAssetIds.some((id) => selectedAssetIdSet.has(id));

  const setAssetSelected = (assetId: string, checked: boolean) => {
    setSelectedAssetIds((current) => {
      if (checked) {
        return current.includes(assetId) ? current : [...current, assetId];
      }
      return current.filter((id) => id !== assetId);
    });
  };

  const setManyAssetsSelected = (assetIds: string[], checked: boolean) => {
    setSelectedAssetIds((current) => {
      const next = new Set(current);
      assetIds.forEach((id) => {
        if (checked) next.add(id);
        else next.delete(id);
      });
      return Array.from(next);
    });
  };

  const submitDeleteRequests = async () => {
    if (!isAdmin || !selectedAssetIds.length || !user) return;

    const requestableIds = selectedAssetIds.filter((id) => !pendingDeleteAssetIdSet.has(id));
    const skippedCount = selectedAssetIds.length - requestableIds.length;

    if (requestableIds.length === 0) {
      toast.error("The selected assets are already waiting for delete approval.");
      return;
    }

    setRequestingDelete(true);
    try {
      const { error } = await supabase.from("asset_delete_requests").insert(
        requestableIds.map((assetId) => ({
          asset_id: assetId,
          requested_by: user.id,
        })),
      );

      if (error) throw error;

      setSelectedAssetIds((current) => current.filter((id) => !requestableIds.includes(id)));
      toast.success(`Sent ${requestableIds.length} asset${requestableIds.length === 1 ? "" : "s"} for delete approval.`, {
        description: skippedCount > 0 ? `${skippedCount} already had a pending delete request.` : undefined,
      });
      await load();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to start the delete approval process.");
    } finally {
      setRequestingDelete(false);
    }
  };

  const approveDeleteRequests = async (assetIds: string[]) => {
    if (!isAdmin || assetIds.length === 0) return;

    setApprovingDelete(true);
    try {
      const { error } = await supabase.from("assets").delete().in("id", assetIds);
      if (error) throw error;

      setSelectedAssetIds((current) => current.filter((id) => !assetIds.includes(id)));
      toast.success(`Deleted ${assetIds.length} asset${assetIds.length === 1 ? "" : "s"} after admin approval.`);
      await load();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to approve and delete the selected assets.");
    } finally {
      setApprovingDelete(false);
    }
  };

  const cancelDeleteRequest = async (requestId: string) => {
    if (!isAdmin) return;

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

  const create = async () => {
    if (!name || !locationId || !divisionId) {
      toast.error("Name, location, and division are required.");
      return;
    }

    try {
      const usedCodes = new Set(assets.map((asset) => asset.code));
      const nextCode = generateAssetTag(divisionMap[divisionId], name, usedCodes);
      let itemTypeId: string | null = null;

      const { data: existingDefault } = await supabase
        .from("item_types")
        .select("id")
        .eq("name", DEFAULT_ASSET_TYPE_NAME)
        .maybeSingle();

      itemTypeId = existingDefault?.id ?? null;

      if (!itemTypeId) {
        const { data: createdDefault, error: createDefaultError } = await supabase
          .from("item_types")
          .insert({ name: DEFAULT_ASSET_TYPE_NAME, code: "G" })
          .select("id")
          .single();

        if (createDefaultError) throw createDefaultError;
        itemTypeId = createdDefault.id;
      }

      const { error } = await supabase.from("assets").insert({
        name: name.trim(),
        description: description.trim() || null,
        serial_number: serial.trim() || null,
        department_id: locationId,
        item_type_id: itemTypeId,
        division_id: divisionId,
        current_location_id: locationId,
        code: nextCode,
        status: "available",
      } as any);

      if (error) throw error;

      toast.success("Asset registered.");
      setOpen(false);
      setName("");
      setDescription("");
      setSerial("");
      setLocationId("");
      setDivisionId("");
      load();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to register asset.");
    }
  };

  const addDivision = async () => {
    const trimmedName = newDivisionName.trim();
    if (!trimmedName) {
      toast.error("Division name is required.");
      return;
    }

    try {
      setAddingDivision(true);
      const code = generateNameCode(trimmedName, divisions.map((division) => division.code ?? ""), 4);
      const { data, error } = await supabase
        .from("divisions")
        .insert({ name: trimmedName, code })
        .select("id, code, name")
        .single();

      if (error) throw error;

      setDivisions((current) => [...current, data].sort((a, b) => a.name.localeCompare(b.name)));
      setDivisionId(data.id);
      setNewDivisionName("");
      toast.success("Division added.");
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to add division.");
    } finally {
      setAddingDivision(false);
    }
  };

  const csvHeader = "Name,Tag,Status,Location,Division,Serial Number,Description";
  const csvSample = `${csvHeader}\nPortable Speaker,,Available,Centurion,Assets,SN12345,Sunday service speaker`;

  const downloadTemplate = () => {
    const blob = new Blob([csvSample], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "assets-template.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const onImportFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB).");
      return;
    }

    const lowerName = file.name.toLowerCase();

    try {
      if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];

        if (!firstSheetName) {
          toast.error("The spreadsheet does not contain any sheets.");
          return;
        }

        const firstSheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(firstSheet, {
          header: 1,
          raw: false,
          defval: "",
        });

        if (rows.length === 0) {
          toast.error("The spreadsheet is empty.");
          return;
        }

        setCsvText(rowsToCsv(rows));
        toast.success(`Loaded ${file.name} for import.`);
        return;
      }

      setCsvText(await file.text());
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to read import file.");
    }
  };

  const parseCsv = (text: string): string[][] => {
    const rows: string[][] = [];
    let row: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];

      if (inQuotes) {
        if (char === '"' && text[index + 1] === '"') {
          current += '"';
          index += 1;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          current += char;
        }
      } else if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(current);
        current = "";
      } else if (char === "\n") {
        row.push(current);
        rows.push(row);
        row = [];
        current = "";
      } else if (char !== "\r") {
        current += char;
      }
    }

    if (current.length > 0 || row.length > 0) {
      row.push(current);
      rows.push(row);
    }

    return rows.filter((candidate) => candidate.some((cell) => cell.trim() !== ""));
  };

  const previewRows = useMemo(() => {
    if (!csvText.trim()) return [] as Record<string, string>[];

    const rows = parseCsv(csvText);
    if (rows.length === 0) return [];

    const header = rows[0].map((value) => normalizeImportKey(value));
    return rows.slice(1).map((values) => {
      const row: Record<string, string> = {};
      header.forEach((key, index) => {
        row[key] = (values[index] ?? "").trim();
      });
      return row;
    });
  }, [csvText]);

  const runImport = async () => {
    if (previewRows.length === 0) {
      toast.error("No rows to import.");
      return;
    }

    setImporting(true);

    const locationByName = new Map(locations.map((location) => [location.name.toLowerCase(), location]));
    const divisionByName = new Map(divisions.map((division) => [division.name.toLowerCase(), division]));
    const usedCodes = new Set(assets.map((asset) => asset.code));
    const errors: string[] = [];
    const validRows: any[] = [];
    let defaultItemTypeId: string | null = null;

    const { data: existingDefault } = await supabase
      .from("item_types")
      .select("id")
      .eq("name", DEFAULT_ASSET_TYPE_NAME)
      .maybeSingle();

    defaultItemTypeId = existingDefault?.id ?? null;

    if (!defaultItemTypeId) {
      const { data: createdDefault, error: createDefaultError } = await supabase
        .from("item_types")
        .insert({ name: DEFAULT_ASSET_TYPE_NAME, code: "G" })
        .select("id")
        .single();

      if (createDefaultError) {
        setImporting(false);
        toast.error(createDefaultError.message);
        return;
      }

      defaultItemTypeId = createdDefault.id;
    }

    const missingDivisionNames = Array.from(
      new Set(
        previewRows
          .map((row) => (row.division ?? "").trim())
          .filter(Boolean)
          .filter((divisionName) => !divisionByName.has(divisionName.toLowerCase())),
      ),
    );

    if (missingDivisionNames.length > 0) {
      const existingCodes = new Set(divisions.map((division) => division.code ?? ""));
      const newDivisionRows = missingDivisionNames.map((divisionName) => {
        const code = generateNameCode(divisionName, existingCodes, 4);
        existingCodes.add(code);
        return { name: divisionName, code };
      });

      const { data: createdDivisions, error: createDivisionError } = await supabase
        .from("divisions")
        .insert(newDivisionRows)
        .select("id, code, name");

      if (createDivisionError) {
        setImporting(false);
        toast.error(createDivisionError.message);
        return;
      }

      (createdDivisions ?? []).forEach((division) => {
        divisionByName.set(division.name.toLowerCase(), division);
      });

      setDivisions((current) =>
        [...current, ...((createdDivisions ?? []) as DivisionRow[])].sort((a, b) => a.name.localeCompare(b.name)),
      );
    }

    previewRows.forEach((row, index) => {
      const lineNo = index + 2;
      const assetName = row.name || row.item_name || row.description || "Unknown Asset";
      const location = locationByName.get((row.location ?? "").toLowerCase());
      const division = divisionByName.get((row.division ?? "").toLowerCase());
      const normalizedStatus = normalizeAssetStatus(
        ((row.status ?? "").trim().toLowerCase() || "available").replace(/[\s-]+/g, "_"),
      );
      const requestedCode = (row.tag ?? row.asset_code ?? "").trim().toUpperCase();

      if (!location || !division) {
        errors.push(`Line ${lineNo}: location or division could not be matched.`);
        return;
      }

      if (normalizedStatus === "signed_out") {
        errors.push(`Line ${lineNo}: signed out assets must go through the sign out workflow.`);
        return;
      }

      if (requestedCode && usedCodes.has(requestedCode)) {
        errors.push(`Line ${lineNo}: tag ${requestedCode} already exists.`);
        return;
      }

      const finalCode = requestedCode || generateAssetTag(division.name, assetName, usedCodes);
      usedCodes.add(finalCode);

      validRows.push({
        name: assetName.slice(0, 120),
        description: (row.description ?? "").slice(0, 500) || null,
        serial_number: (row.serial_number ?? "").slice(0, 80) || null,
        department_id: location.id,
        division_id: division.id,
        item_type_id: defaultItemTypeId,
        current_location_id: location.id,
        code: finalCode,
        status: normalizedStatus,
      });
    });

    if (validRows.length === 0) {
      setImporting(false);
      toast.error(errors[0] ?? "No valid rows.");
      return;
    }

    let inserted = 0;
    for (let index = 0; index < validRows.length; index += 100) {
      const chunk = validRows.slice(index, index + 100);
      const { error } = await supabase.from("assets").insert(chunk);
      if (error) {
        setImporting(false);
        toast.error(`Inserted ${inserted}, then failed: ${error.message}`);
        load();
        return;
      }
      inserted += chunk.length;
    }

    setImporting(false);
    setImportOpen(false);
    setCsvText("");

    if (errors.length > 0) {
      toast.success(`Imported ${inserted} and skipped ${errors.length}.`, {
        description: errors.slice(0, 3).join(" | "),
      });
    } else {
      toast.success(`Imported ${inserted} asset${inserted === 1 ? "" : "s"}.`);
    }

    load();
  };

  const selectedDivisionName = divisionId ? divisionMap[divisionId] : "";
  const tagPreview = `${getTagPrefix(selectedDivisionName, name)}###`;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-3xl text-foreground glow-soft sm:text-4xl">Assets</h1>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-1" /> New Asset
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] overflow-y-auto bg-card sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-display text-foreground">Register asset</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pr-1">
                  <div className="space-y-2">
                    <Label>Item name</Label>
                    <Input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} />
                  </div>

                  <div className="space-y-2">
                    <Label>Serial number</Label>
                    <Input value={serial} onChange={(event) => setSerial(event.target.value)} maxLength={80} />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Select value={locationId} onValueChange={setLocationId}>
                        <SelectTrigger><SelectValue placeholder="Select a location" /></SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Input value="Available" readOnly className="text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Division</Label>
                    <Select value={divisionId} onValueChange={setDivisionId}>
                      <SelectTrigger><SelectValue placeholder="Select a division" /></SelectTrigger>
                      <SelectContent>
                        {divisions.map((division) => (
                          <SelectItem key={division.id} value={division.id}>
                            {division.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Input
                        value={newDivisionName}
                        onChange={(event) => setNewDivisionName(event.target.value)}
                        placeholder="Add a new division"
                        maxLength={80}
                      />
                      <Button type="button" variant="outline" onClick={addDivision} disabled={addingDivision}>
                        {addingDivision ? "Adding..." : "Add"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} />
                  </div>

                  <div className="rounded-[1.25rem] border border-primary/12 bg-secondary/80 px-4 py-3">
                    <div className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Tag preview
                    </div>
                    <div className="mt-1 font-mono text-sm text-primary">{tagPreview}</div>
                  </div>

                  <Button onClick={create} className="w-full">
                    Register asset
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={importOpen} onOpenChange={(value) => { setImportOpen(value); if (!value) setCsvText(""); }}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload size={16} className="mr-1" /> CSV / Excel Import
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-card">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 font-display text-foreground">
                    <FileSpreadsheet size={18} /> Bulk import assets
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="rounded-[1.35rem] border border-primary/12 bg-secondary/80 p-4 text-sm text-muted-foreground">
                    <div className="app-kicker">Expected columns</div>
                    <div className="mt-2">
                      Name, Tag, Status, Location, Division, Serial Number, Description
                    </div>
                    <div className="mt-2">
                      Excel files with only Division, Name, Serial Number, and Location also work. Tags are auto-generated and status defaults to Available.
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={downloadTemplate}>
                      <Download size={14} className="mr-1" /> Download template
                    </Button>

                    <label className="inline-flex">
                      <input
                        type="file"
                        accept=".csv,text/csv,.xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) onImportFile(file);
                          event.target.value = "";
                        }}
                      />
                      <span className="inline-flex cursor-pointer items-center rounded-full border border-primary/14 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-primary/8">
                        <Upload size={14} className="mr-1" /> Choose file
                      </span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Import content</Label>
                    <Textarea value={csvText} onChange={(event) => setCsvText(event.target.value)} placeholder={csvSample} rows={6} className="font-mono text-xs" />
                  </div>

                  {previewRows.length > 0 && (
                    <div className="overflow-hidden rounded-[1.4rem] border border-primary/12">
                      <div className="border-b border-primary/12 px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] text-primary">
                        Preview | {previewRows.length} row{previewRows.length === 1 ? "" : "s"}
                      </div>
                      <div className="max-h-48 overflow-auto">
                        <table className="w-full font-mono text-xs">
                          <thead className="bg-primary/6 text-muted-foreground">
                            <tr>
                              <th className="px-2 py-2 text-left">Name</th>
                              <th className="px-2 py-2 text-left">Tag</th>
                              <th className="px-2 py-2 text-left">Status</th>
                              <th className="px-2 py-2 text-left">Location</th>
                              <th className="px-2 py-2 text-left">Division</th>
                              <th className="px-2 py-2 text-left">Serial</th>
                            </tr>
                          </thead>
                          <tbody>
                            {previewRows.slice(0, 50).map((row, index) => (
                              <tr key={`${row.name}-${index}`} className="border-t border-primary/10">
                                <td className="px-2 py-2 text-foreground/80">{row.name || row.description}</td>
                                <td className="px-2 py-2 text-foreground/80">{row.tag || row.asset_code || "Auto"}</td>
                                <td className="px-2 py-2 text-foreground/80">{row.status || "Available"}</td>
                                <td className="px-2 py-2 text-foreground/80">{row.location}</td>
                                <td className="px-2 py-2 text-foreground/80">{row.division}</td>
                                <td className="px-2 py-2 text-foreground/80">{row.serial_number}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <Button onClick={runImport} disabled={importing || previewRows.length === 0} className="w-full">
                    {importing ? "Importing..." : `Import ${previewRows.length || ""} asset${previewRows.length === 1 ? "" : "s"}`}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="app-panel p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_200px_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={16} />
            <Input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search by name, tag, location, status, division, serial..."
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="signed_out">Signed Out</SelectItem>
              <SelectItem value="out_for_repairs">Out for Repairs</SelectItem>
              <SelectItem value="damaged">Damaged</SelectItem>
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Location</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isAdmin && (
        <div className="app-panel space-y-4 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="app-kicker">Asset Delete Approval</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Only admins can select assets, start the delete approval process, and approve the final deletion.
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-primary/20 bg-card px-3 py-1 uppercase tracking-[0.16em]">
                {selectedAssetIds.length} selected
              </Badge>
              <Badge variant="outline" className="border-primary/20 bg-card px-3 py-1 uppercase tracking-[0.16em]">
                {pendingDeleteDetails.length} pending
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setManyAssetsSelected(filteredAssetIds, !allVisibleSelected)}
              disabled={filteredAssetIds.length === 0}
            >
              {allVisibleSelected ? "Clear visible selection" : "Select all visible items"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedAssetIds([])}
              disabled={selectedAssetIds.length === 0}
            >
              Clear selected items
            </Button>
            <Button
              type="button"
              onClick={submitDeleteRequests}
              disabled={selectedAssetIds.length === 0 || requestingDelete}
              className="gap-2"
            >
              <Trash2 size={15} /> {requestingDelete ? "Starting delete approval..." : "Start delete approval"}
            </Button>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="app-panel space-y-3 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="app-kicker">Pending Delete Approvals</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Review the requested assets below and approve each one when you are ready to remove it from the app.
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => approveDeleteRequests(pendingDeleteDetails.map((request) => request.asset_id))}
              disabled={pendingDeleteDetails.length === 0 || approvingDelete}
            >
              {approvingDelete ? "Approving..." : "Approve all pending"}
            </Button>
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
                      <th className="px-4 py-3 font-normal">Serial</th>
                      <th className="px-4 py-3 font-normal">Division</th>
                      <th className="px-4 py-3 font-normal">Location</th>
                      <th className="px-4 py-3 font-normal">Requested</th>
                      <th className="px-4 py-3 font-normal">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/10">
                    {pendingDeleteDetails.map((request) => {
                      const asset = request.asset!;
                      const divisionName = asset.division_id ? divisionMap[asset.division_id] ?? "-" : "-";
                      const locationName = locationMap[asset.current_location_id ?? asset.department_id] ?? "-";
                      const requestedLabel = request.requested_by === user?.id ? "You" : "Admin";

                      return (
                        <tr key={request.id} className="transition-colors hover:bg-primary/5">
                          <td className="px-4 py-3 font-mono text-foreground/85">{asset.code}</td>
                          <td className="px-4 py-3 text-foreground">{asset.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{asset.serial_number || "-"}</td>
                          <td className="px-4 py-3 text-muted-foreground">{divisionName}</td>
                          <td className="px-4 py-3 text-muted-foreground">{locationName}</td>
                          <td className="px-4 py-3 text-muted-foreground">{requestedLabel}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => approveDeleteRequests([asset.id])}
                                disabled={approvingDelete}
                              >
                                Approve delete
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => cancelDeleteRequest(request.id)}
                                disabled={cancellingDeleteId === request.id}
                              >
                                {cancellingDeleteId === request.id ? "Cancelling..." : "Cancel"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="app-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary/12 text-left font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {isAdmin && (
                  <th className="w-12 px-4 py-3 font-normal">
                    <Checkbox
                      checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
                      onCheckedChange={(checked) => setManyAssetsSelected(filteredAssetIds, checked === true)}
                      aria-label="Select all visible assets"
                    />
                  </th>
                )}
                <th className="px-4 py-3 font-normal">Item Name</th>
                <th className="px-4 py-3 font-normal">Total Units</th>
                <th className="px-4 py-3 font-normal">Available</th>
                <th className="px-4 py-3 font-normal">Locations</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-primary/10">
              {filteredGroups.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-4 py-12 text-center text-muted-foreground/70">
                    No assets matched your search or filters.
                  </td>
                </tr>
              )}

              {filteredGroups.map((group) => {
                const groupAssetIds = group.items.map((asset) => asset.id);
                const allGroupSelected = groupAssetIds.length > 0 && groupAssetIds.every((id) => selectedAssetIdSet.has(id));
                const someGroupSelected = groupAssetIds.some((id) => selectedAssetIdSet.has(id));
                const pendingCount = groupAssetIds.filter((id) => pendingDeleteAssetIdSet.has(id)).length;

                return (
                  <tr
                    key={group.key}
                    className="group cursor-pointer transition-colors hover:bg-primary/5"
                    onClick={() => setActiveGroupKey(group.key)}
                  >
                    {isAdmin && (
                      <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                        <Checkbox
                          checked={allGroupSelected ? true : someGroupSelected ? "indeterminate" : false}
                          onCheckedChange={(checked) => setManyAssetsSelected(groupAssetIds, checked === true)}
                          aria-label={`Select ${group.name}`}
                        />
                      </td>
                    )}
                    <td className="max-w-[320px] px-4 py-3 text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{group.name}</span>
                        {pendingCount > 0 && (
                          <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300">
                            {pendingCount} pending delete
                          </Badge>
                        )}
                        <ExternalLink size={12} className="opacity-0 transition-opacity group-hover:opacity-50" />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-foreground/80">{group.totalUnits}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn("uppercase tracking-[0.16em]", group.availableUnits > 0 ? getStatusBadgeClass("available") : getStatusBadgeClass("signed_out"))}>
                        {group.availableUnits}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{group.locationSummary}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!activeGroup} onOpenChange={(open) => !open && setActiveGroupKey(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-card sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              {activeGroup?.name ?? "Asset instances"}
            </DialogTitle>
          </DialogHeader>

          {activeGroup && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.2rem] border border-primary/12 bg-secondary/80 px-4 py-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Total units</div>
                  <div className="mt-1 font-display text-xl text-foreground glow-soft">{activeGroup.totalUnits}</div>
                </div>
                <div className="rounded-[1.2rem] border border-primary/12 bg-secondary/80 px-4 py-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Available units</div>
                  <div className="mt-1 font-display text-xl text-primary glow-soft">{activeGroup.availableUnits}</div>
                </div>
                <div className="rounded-[1.2rem] border border-primary/12 bg-secondary/80 px-4 py-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Locations</div>
                  <div className="mt-1 text-sm text-foreground">{activeGroup.locationSummary}</div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.4rem] border border-primary/12">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-primary/12 text-left font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {isAdmin && <th className="px-4 py-3 font-normal">Select</th>}
                        <th className="px-4 py-3 font-normal">Tag</th>
                        <th className="px-4 py-3 font-normal">Serial Number</th>
                        <th className="px-4 py-3 font-normal">Division</th>
                        <th className="px-4 py-3 font-normal">Location</th>
                        <th className="px-4 py-3 font-normal">Status</th>
                        <th className="px-4 py-3 font-normal">Open</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10">
                      {activeGroup.items.map((asset) => {
                        const divisionName = asset.division_id ? divisionMap[asset.division_id] ?? "-" : "-";
                        const locationName = locationMap[asset.current_location_id ?? asset.department_id] ?? "-";
                        const normalizedStatus = normalizeAssetStatus(asset.status);

                        return (
                          <tr key={asset.id} className="transition-colors hover:bg-primary/5">
                            {isAdmin && (
                              <td className="px-4 py-3">
                                <Checkbox
                                  checked={selectedAssetIdSet.has(asset.id)}
                                  onCheckedChange={(checked) => setAssetSelected(asset.id, checked === true)}
                                  aria-label={`Select ${asset.code}`}
                                />
                              </td>
                            )}
                            <td className="px-4 py-3 font-mono text-foreground/85">{asset.code}</td>
                            <td className="px-4 py-3 text-muted-foreground">{asset.serial_number || "-"}</td>
                            <td className="px-4 py-3 text-muted-foreground">{divisionName}</td>
                            <td className="px-4 py-3 text-muted-foreground">{locationName}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className={cn("uppercase tracking-[0.16em]", getStatusBadgeClass(normalizedStatus))}>
                                  {getAssetStatusLabel(normalizedStatus)}
                                </Badge>
                                {pendingDeleteAssetIdSet.has(asset.id) && (
                                  <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300">
                                    Pending delete
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Link to={`/assets/${asset.id}`} className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80" onClick={() => setActiveGroupKey(null)}>
                                View <ExternalLink size={12} />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
