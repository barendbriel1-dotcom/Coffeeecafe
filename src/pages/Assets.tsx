import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Download, ExternalLink, FileSpreadsheet, Plus, Search, Upload } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  buildSearchBlob,
  generateAssetTag,
  generateNameCode,
  generateSingleCharacterCode,
  getAssetStatusLabel,
  getStatusBadgeClass,
  getTagPrefix,
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

interface DepartmentRow {
  id: string;
  code: string;
  name: string;
}

export default function Assets() {
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const initialStatus = normalizeAssetStatus(searchParams.get("status") || "available") || "all";
  const [assets, setAssets] = useState<Asset[]>([]);
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [divisions, setDivisions] = useState<DivisionRow[]>([]);
  const [departments, setDepartments] = useState<DepartmentRow[]>([]);
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
  const [departmentId, setDepartmentId] = useState("");
  const [newDivisionName, setNewDivisionName] = useState("");
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [addingDivision, setAddingDivision] = useState(false);
  const [addingDepartment, setAddingDepartment] = useState(false);

  const load = async () => {
    const [{ data: assetRows }, { data: locationRows }, { data: divisionRows }, { data: departmentRows }] = await Promise.all([
      supabase.from("assets").select("*").order("name"),
      supabase.from("locations").select("*"),
      supabase.from("divisions").select("*").order("name"),
      supabase.from("item_types").select("*").order("name"),
    ]);

    const orderedLocations = (locationRows ?? []).sort((a: LocationRow, b: LocationRow) => {
      const aIndex = LOCATION_NAMES.indexOf(a.name as (typeof LOCATION_NAMES)[number]);
      const bIndex = LOCATION_NAMES.indexOf(b.name as (typeof LOCATION_NAMES)[number]);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    setAssets(assetRows ?? []);
    setLocations(orderedLocations);
    setDivisions(divisionRows ?? []);
    setDepartments((departmentRows ?? []) as DepartmentRow[]);
  };

  useEffect(() => {
    load();
  }, []);

  const divisionMap = useMemo(() => Object.fromEntries(divisions.map((division) => [division.id, division.name])), [divisions]);
  const departmentMap = useMemo(() => Object.fromEntries(departments.map((department) => [department.id, department.name])), [departments]);
  const locationMap = useMemo(() => Object.fromEntries(locations.map((location) => [location.id, location.name])), [locations]);

  useEffect(() => {
    if (searchParams.get("status")) {
      setStatusFilter(initialStatus);
    }
  }, [initialStatus, searchParams]);

  const filtered = assets.filter((asset) => {
    const normalizedStatus = normalizeAssetStatus(asset.status);
    const currentLocationId = asset.current_location_id ?? asset.department_id;
    const currentLocationName = locationMap[currentLocationId] ?? "";
    const divisionName = asset.division_id ? divisionMap[asset.division_id] ?? "" : "";
    const departmentName = departmentMap[asset.item_type_id] ?? "";
    const searchBlob = buildSearchBlob([
      asset.name,
      asset.code,
      currentLocationName,
      departmentName,
      divisionName,
      getAssetStatusLabel(normalizedStatus),
      asset.description,
      asset.serial_number,
    ]);

    const matchesQuery = !q.trim() || searchBlob.includes(q.trim().toLowerCase());
    const matchesStatus = statusFilter === "all" || normalizedStatus === statusFilter;
    const matchesLocation = locationFilter === "all" || currentLocationId === locationFilter;
    return matchesQuery && matchesStatus && matchesLocation;
  });

  const create = async () => {
    if (!name || !locationId || !departmentId || !divisionId) {
      toast.error("Name, location, department, and division are required.");
      return;
    }

    try {
      const usedCodes = new Set(assets.map((asset) => asset.code));
      const nextCode = generateAssetTag(divisionMap[divisionId], name, usedCodes);

      const { error } = await supabase.from("assets").insert({
        name: name.trim(),
        description: description.trim() || null,
        serial_number: serial.trim() || null,
        department_id: locationId,
        item_type_id: departmentId,
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
      setDepartmentId("");
      load();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to register asset.");
    }
  };

  const addDepartment = async () => {
    const trimmedName = newDepartmentName.trim();
    if (!trimmedName) {
      toast.error("Department name is required.");
      return;
    }

    try {
      setAddingDepartment(true);
      const code = generateSingleCharacterCode(trimmedName, departments.map((department) => department.code));
      const { data, error } = await supabase
        .from("item_types")
        .insert({ name: trimmedName, code })
        .select("id, code, name")
        .single();

      if (error) throw error;

      setDepartments((current) => [...current, data].sort((a, b) => a.name.localeCompare(b.name)));
      setDepartmentId(data.id);
      setNewDepartmentName("");
      toast.success("Department added.");
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to add department.");
    } finally {
      setAddingDepartment(false);
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

  const csvHeader = "Name,Division,Serial Number,Location,Department,Description";
  const csvSample = `${csvHeader}\nPortable Speaker,Assets,SN12345,Centurion,Audio,Sunday service speaker`;

  const downloadTemplate = () => {
    const blob = new Blob([csvSample], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "assets-template.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const onCsvFile = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large (max 2MB).");
      return;
    }

    setCsvText(await file.text());
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

    const header = rows[0].map((value) => value.trim().toLowerCase().replace(/ /g, "_"));
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
    const departmentByName = new Map(departments.map((department) => [department.name.toLowerCase(), department]));
    const usedCodes = new Set(assets.map((asset) => asset.code));
    const errors: string[] = [];
    const validRows: any[] = [];

    previewRows.forEach((row, index) => {
      const lineNo = index + 2;
      const assetName = row.name || row.item_name || row.description || "Unknown Asset";
      const location = locationByName.get((row.location ?? "").toLowerCase());
      const division = divisionByName.get((row.division ?? "").toLowerCase());
      const departmentName = row.department ?? row.category ?? "";
      const department = departmentByName.get(departmentName.toLowerCase());

      if (!location || !division || !department) {
        errors.push(`Line ${lineNo}: location, division, or department could not be matched.`);
        return;
      }

      validRows.push({
        name: assetName.slice(0, 120),
        description: (row.description ?? "").slice(0, 500) || null,
        serial_number: (row.serial_number ?? "").slice(0, 80) || null,
        department_id: location.id,
        division_id: division.id,
        item_type_id: department.id,
        current_location_id: location.id,
        code: row.tag || row.asset_code || generateAssetTag(division.name, assetName, usedCodes),
        status: "available",
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
          <div className="app-kicker">Asset registry</div>
          <h1 className="mt-2 font-display text-3xl text-foreground glow-soft sm:text-4xl">See every asset in one searchable list.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Each row shows item name, tag, location, status, department, division, and serial number.
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-1" /> New Asset
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle className="font-display text-foreground">Register asset</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
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
                    <Label>Department</Label>
                    <Select value={departmentId} onValueChange={setDepartmentId}>
                      <SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Input
                        value={newDepartmentName}
                        onChange={(event) => setNewDepartmentName(event.target.value)}
                        placeholder="Add a new department"
                        maxLength={80}
                      />
                      <Button type="button" variant="outline" onClick={addDepartment} disabled={addingDepartment}>
                        {addingDepartment ? "Adding..." : "Add"}
                      </Button>
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
                  <Upload size={16} className="mr-1" /> CSV Import
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
                      Name, Division, Serial Number, Location, Department, Description
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={downloadTemplate}>
                      <Download size={14} className="mr-1" /> Download template
                    </Button>

                    <label className="inline-flex">
                      <input
                        type="file"
                        accept=".csv,text/csv"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) onCsvFile(file);
                          event.target.value = "";
                        }}
                      />
                      <span className="inline-flex cursor-pointer items-center rounded-full border border-primary/14 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-primary/8">
                        <Upload size={14} className="mr-1" /> Choose file
                      </span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">CSV content</Label>
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
                              <th className="px-2 py-2 text-left">Location</th>
                              <th className="px-2 py-2 text-left">Department</th>
                              <th className="px-2 py-2 text-left">Division</th>
                              <th className="px-2 py-2 text-left">Serial</th>
                            </tr>
                          </thead>
                          <tbody>
                            {previewRows.slice(0, 50).map((row, index) => (
                              <tr key={`${row.name}-${index}`} className="border-t border-primary/10">
                                <td className="px-2 py-2 text-foreground/80">{row.name || row.description}</td>
                                <td className="px-2 py-2 text-foreground/80">{row.location}</td>
                                <td className="px-2 py-2 text-foreground/80">{row.department || row.category}</td>
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
              placeholder="Search by name, tag, location, status, department, division, serial..."
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

      <div className="app-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary/12 text-left font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <th className="px-4 py-3 font-normal">Item Name</th>
                <th className="px-4 py-3 font-normal">Tag</th>
                <th className="px-4 py-3 font-normal">Location</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Department</th>
                <th className="px-4 py-3 font-normal">Division</th>
                <th className="px-4 py-3 font-normal">Serial Number</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-primary/10">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground/70">
                    No assets matched your search or filters.
                  </td>
                </tr>
              )}

              {filtered.map((asset) => {
                const departmentName = departmentMap[asset.item_type_id] ?? "-";
                const divisionName = asset.division_id ? divisionMap[asset.division_id] ?? "-" : "-";
                const locationName = locationMap[asset.current_location_id ?? asset.department_id] ?? "-";
                const normalizedStatus = normalizeAssetStatus(asset.status);

                return (
                  <tr key={asset.id} className="group transition-colors hover:bg-primary/5">
                    <td className="max-w-[260px] truncate px-4 py-3 text-foreground">
                      <Link to={`/assets/${asset.id}`} className="flex items-center gap-2 hover:text-primary">
                        {asset.name}
                        <ExternalLink size={12} className="opacity-0 transition-opacity group-hover:opacity-50" />
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-foreground/80">{asset.code}</td>
                    <td className="px-4 py-3 text-muted-foreground">{locationName}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn("uppercase tracking-[0.16em]", getStatusBadgeClass(normalizedStatus))}>
                        {getAssetStatusLabel(normalizedStatus)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{departmentName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{divisionName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{asset.serial_number || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
