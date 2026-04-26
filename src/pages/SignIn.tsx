import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AlertCircle, Camera, Check, CheckSquare, MapPin, Search, Square, Trash2, Wrench, XCircle } from "lucide-react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getAssetStatusLabel, getStatusBadgeClass, LOCATION_NAMES } from "@/lib/assets";
import { cn } from "@/lib/utils";

interface AssetReturn {
  id: string;
  code: string;
  name: string;
  serial_number: string | null;
  department_id: string;
  division_id: string | null;
  division_name: string;
  current_location_id: string | null;
  location_name: string;
  holder_id: string | null;
  holder_name: string;
  signout_item_id: string | null;
  signout_id: string | null;
  package_name: string | null;
  notes: string | null;
  created_at: string | null;
}

interface BulkDecision {
  items: AssetReturn[];
  nextStatus: "available" | "out_for_repairs" | "damaged";
}

interface LocationRow {
  id: string;
  name: string;
}

interface DivisionRow {
  id: string;
  name: string;
}

interface ProfileRow {
  id: string;
  display_name: string;
}

const SCAN_IN_READER_ID = "scan-in-camera-reader";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function formatAssetReturnRow(
  asset: any,
  maps: {
    profileMap: Record<string, string>;
    divisionMap: Record<string, string>;
    locationMap: Record<string, string>;
  },
): AssetReturn {
  const activeItem = asset.signout_items?.find((item: any) => !item.returned);
  const signout = activeItem?.signout;
  const holderId = asset.current_holder || signout?.signed_out_to || null;

  return {
    id: asset.id,
    code: asset.code,
    name: asset.name,
    serial_number: asset.serial_number ?? null,
    department_id: asset.department_id,
    division_id: asset.division_id ?? null,
    division_name: maps.divisionMap[asset.division_id ?? ""] || "—",
    current_location_id: asset.current_location_id ?? null,
    location_name: maps.locationMap[asset.current_location_id ?? ""] || "—",
    holder_id: holderId,
    holder_name: maps.profileMap[holderId ?? ""] || "Unknown user",
    signout_item_id: activeItem?.id ?? null,
    signout_id: signout?.id ?? null,
    package_name: signout?.package_name ?? null,
    notes: signout?.notes ?? null,
    created_at: signout?.created_at ?? null,
  };
}

export default function SignIn() {
  const { user, isAdmin, isAssetManager, assetManagerLocationId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [rows, setRows] = useState<AssetReturn[]>([]);
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [profileMap, setProfileMap] = useState<Record<string, string>>({});
  const [divisionMap, setDivisionMap] = useState<Record<string, string>>({});
  const [locationNameMap, setLocationNameMap] = useState<Record<string, string>>({});

  const [searchQ, setSearchQ] = useState("");
  const [holderFilter, setHolderFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [packageFilter, setPackageFilter] = useState("all");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [bulkDecision, setBulkDecision] = useState<BulkDecision | null>(null);
  const [returnLocationId, setReturnLocationId] = useState("");
  const [decisionNotes, setDecisionNotes] = useState("");

  const [scanOpen, setScanOpen] = useState(false);
  const [scanItems, setScanItems] = useState<AssetReturn[]>([]);
  const [scanReturnLocationId, setScanReturnLocationId] = useState("");
  const [scanNextStatus, setScanNextStatus] = useState<"available" | "out_for_repairs" | "damaged">("available");
  const [scanNotes, setScanNotes] = useState("");
  const [scannerStarting, setScannerStarting] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scanBusy, setScanBusy] = useState(false);
  const scanItemsRef = useRef<AssetReturn[]>([]);
  const recentScanRef = useRef<{ value: string; at: number }>({ value: "", at: 0 });
  const bulkDecisionDescriptionId = useId();
  const scanInDescriptionId = useId();

  useEffect(() => {
    scanItemsRef.current = scanItems;
  }, [scanItems]);

  const load = async () => {
    setLoading(true);
    try {
      const [
        { data: assets, error: assetError },
        { data: profiles },
        { data: locationRows },
        { data: divisionRows },
      ] = await Promise.all([
        supabase
          .from("assets")
          .select(`
            id, code, name, status, current_holder, serial_number, department_id,
            division_id, current_location_id,
            signout_items(
              id, returned, signout_id,
              signout:signouts(
                id, created_at, package_name, notes, signed_out_to
              )
            )
          `)
          .eq("status", "signed_out"),
        supabase.from("profiles").select("id, display_name"),
        supabase.from("locations").select("id, name"),
        supabase.from("divisions").select("id, name"),
      ]);

      if (assetError) throw assetError;

      const orderedLocations = (locationRows ?? []).sort((a: LocationRow, b: LocationRow) => {
        const aIndex = LOCATION_NAMES.indexOf(a.name as (typeof LOCATION_NAMES)[number]);
        const bIndex = LOCATION_NAMES.indexOf(b.name as (typeof LOCATION_NAMES)[number]);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      });

      const nextProfileMap = Object.fromEntries((profiles ?? []).map((profile: ProfileRow) => [profile.id, profile.display_name]));
      const nextDivisionMap = Object.fromEntries((divisionRows ?? []).map((division: DivisionRow) => [division.id, division.name]));
      const nextLocationMap = Object.fromEntries((locationRows ?? []).map((location: LocationRow) => [location.id, location.name]));
      const formattedRows = (assets ?? [])
        .map((asset: any) =>
          formatAssetReturnRow(asset, {
            profileMap: nextProfileMap,
            divisionMap: nextDivisionMap,
            locationMap: nextLocationMap,
          }),
        )
        .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));

      setRows(formattedRows);
      setLocations(orderedLocations);
      setProfileMap(nextProfileMap);
      setDivisionMap(nextDivisionMap);
      setLocationNameMap(nextLocationMap);
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to load signed-out assets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const locationOptions = useMemo(() => locations.filter((location) => location.name !== "Traveling"), [locations]);
  const scopedRows = useMemo(
    () =>
      isAssetManager && assetManagerLocationId
        ? rows.filter((item) => item.department_id === assetManagerLocationId)
        : rows,
    [assetManagerLocationId, isAssetManager, rows],
  );

  const scopedHolderOptions = useMemo(() => [...new Set(scopedRows.map((row) => row.holder_name))].sort(), [scopedRows]);
  const scopedDivisionOptions = useMemo(() => [...new Set(scopedRows.map((row) => row.division_name).filter((name) => name !== "—"))].sort(), [scopedRows]);
  const scopedLocationFilterOptions = useMemo(() => [...new Set(scopedRows.map((row) => row.location_name).filter((name) => name !== "—"))].sort(), [scopedRows]);
  const scopedPackageOptions = useMemo(() => [...new Set(scopedRows.map((row) => row.package_name).filter(Boolean) as string[])].sort(), [scopedRows]);

  const isFilterActive =
    searchQ.trim().length > 0 ||
    holderFilter !== "all" ||
    divisionFilter !== "all" ||
    locationFilter !== "all" ||
    packageFilter !== "all";

  const filteredRows = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    return scopedRows.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        (item.serial_number ?? "").toLowerCase().includes(q) ||
        item.holder_name.toLowerCase().includes(q) ||
        (item.package_name ?? "").toLowerCase().includes(q);
      const matchesHolder = holderFilter === "all" || item.holder_name === holderFilter;
      const matchesDivision = divisionFilter === "all" || item.division_name === divisionFilter;
      const matchesLocation = locationFilter === "all" || item.location_name === locationFilter;
      const matchesPackage = packageFilter === "all" || item.package_name === packageFilter;
      return matchesSearch && matchesHolder && matchesDivision && matchesLocation && matchesPackage;
    });
  }, [divisionFilter, holderFilter, locationFilter, packageFilter, scopedRows, searchQ]);

  const allFilteredSelected = filteredRows.length > 0 && filteredRows.every((row) => selectedIds.has(row.id));
  const selectedCount = selectedIds.size;

  const toggleItem = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllFiltered = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allFilteredSelected) {
        filteredRows.forEach((row) => next.delete(row.id));
      } else {
        filteredRows.forEach((row) => next.add(row.id));
      }
      return next;
    });
  };

  const resetFilters = () => {
    setSearchQ("");
    setHolderFilter("all");
    setDivisionFilter("all");
    setLocationFilter("all");
    setPackageFilter("all");
  };

  const completeSignIn = async ({
    items,
    nextStatus,
    targetLocationId,
    notes,
    notePrefix,
  }: {
    items: AssetReturn[];
    nextStatus: "available" | "out_for_repairs" | "damaged";
    targetLocationId: string;
    notes: string;
    notePrefix: string;
  }) => {
    if (!targetLocationId) {
      toast.error("Select a return location before confirming.");
      return false;
    }

    setProcessing(true);
    try {
      await Promise.all(
        items.map((item) =>
          supabase
            .from("assets")
            .update({ status: nextStatus, current_holder: null, current_location_id: targetLocationId } as any)
            .eq("id", item.id),
        ),
      );

      const signoutItemIds = items.map((item) => item.signout_item_id).filter(Boolean) as string[];
      if (signoutItemIds.length > 0) {
        await supabase.from("signout_items").update({ returned: true }).in("id", signoutItemIds);
      }

      const signoutIds = [...new Set(items.map((item) => item.signout_id).filter(Boolean) as string[])];
      await Promise.all(
        signoutIds.map(async (signoutId) => {
          const { data: remaining } = await supabase
            .from("signout_items")
            .select("id")
            .eq("signout_id", signoutId)
            .eq("returned", false);

          if (!remaining || remaining.length === 0) {
            await supabase
              .from("signouts")
              .update({ status: "returned", signed_in_at: new Date().toISOString(), signed_in_by: user?.id })
              .eq("id", signoutId);
          }
        }),
      );

      const returnLocationName = locations.find((location) => location.id === targetLocationId)?.name ?? "Unknown location";
      const action =
        nextStatus === "available"
          ? "signed_in"
          : nextStatus === "out_for_repairs"
            ? "sent_for_repairs"
            : "marked_damaged";

      const noteText = notes.trim() || notePrefix;
      await supabase.from("asset_history").insert(
        items.map((item) => ({
          asset_id: item.id,
          action,
          performed_by: user?.id,
          from_user: item.holder_id,
          notes: `${noteText} Returned to ${returnLocationName}.`,
        })),
      );

      toast.success(`${items.length} item${items.length === 1 ? "" : "s"} signed in as ${getAssetStatusLabel(nextStatus)}.`);
      await load();
      return true;
    } catch (error: any) {
      const message = error?.message ?? "Failed to complete sign-in.";
      if (message.toLowerCase().includes("row-level security")) {
        toast.error("Supabase still needs the Asset Manager signin policy SQL applied before this role can complete returns.");
      } else {
        toast.error(message);
      }
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const openBulkDecision = (items: AssetReturn[], nextStatus: "available" | "out_for_repairs" | "damaged") => {
    setBulkDecision({ items, nextStatus });
    setReturnLocationId(isAssetManager && assetManagerLocationId ? assetManagerLocationId : "");
    setDecisionNotes("");
  };

  const openSelectedDecision = (nextStatus: "available" | "out_for_repairs" | "damaged") => {
    const items = rows.filter((row) => selectedIds.has(row.id));
    if (items.length === 0) return;
    openBulkDecision(items, nextStatus);
  };

  const confirmBulkDecision = async () => {
    if (!bulkDecision) return;
    const success = await completeSignIn({
      items: bulkDecision.items,
      nextStatus: bulkDecision.nextStatus,
      targetLocationId: returnLocationId,
      notes: decisionNotes,
      notePrefix: "Manual sign-in completed.",
    });

    if (success) {
      setBulkDecision(null);
      setSelectedIds(new Set());
    }
  };

  const fetchReturnRowById = async (assetId: string) => {
    const { data, error } = await supabase
      .from("assets")
      .select(`
        id, code, name, status, current_holder, serial_number, department_id,
        division_id, current_location_id,
        signout_items(
          id, returned, signout_id,
          signout:signouts(
            id, created_at, package_name, notes, signed_out_to
          )
        )
      `)
      .eq("id", assetId)
      .maybeSingle();

    if (error) throw error;
    return data;
  };

  const resolveScannedItem = async (rawValue: string) => {
    const assetId = rawValue.trim();
    if (!UUID_PATTERN.test(assetId)) {
      toast.error("QR code does not contain a valid asset UUID.");
      return null;
    }

    const existingBatchItem = scanItemsRef.current.find((item) => item.id === assetId);
    if (existingBatchItem) {
      toast.error(`${existingBatchItem.name} is already in the scan batch.`);
      return null;
    }

    const existingRow = rows.find((row) => row.id === assetId);
    if (existingRow) {
      if (isAssetManager && assetManagerLocationId && existingRow.department_id !== assetManagerLocationId) {
        toast.error("This QR code belongs to an item outside your locked location.");
        return null;
      }
      return existingRow;
    }

    const asset = await fetchReturnRowById(assetId);
    if (!asset) {
      toast.error("No asset was found for that QR code.");
      return null;
    }

    if (asset.status !== "signed_out") {
      toast.error("This asset is not currently signed out.");
      return null;
    }

    if (isAssetManager && assetManagerLocationId && asset.department_id !== assetManagerLocationId) {
      toast.error("This QR code belongs to an item outside your locked location.");
      return null;
    }

    const formatted = formatAssetReturnRow(asset, {
      profileMap,
      divisionMap,
      locationMap: locationNameMap,
    });

    if (!formatted.signout_item_id) {
      toast.error("This signed-out asset is missing an active sign-out record.");
      return null;
    }

    return formatted;
  };

  useEffect(() => {
    if (!scanOpen) {
      setScanItems([]);
      setScanNotes("");
      setScanNextStatus("available");
      setScanReturnLocationId(isAssetManager && assetManagerLocationId ? assetManagerLocationId : "");
      setScannerError(null);
      return;
    }

    setScanReturnLocationId(isAssetManager && assetManagerLocationId ? assetManagerLocationId : "");
    setScannerError(null);
    setScannerStarting(true);

    const scanner = new Html5Qrcode(SCAN_IN_READER_ID, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });
    let cancelled = false;

    const waitForReaderElement = async () => {
      for (let attempt = 0; attempt < 20; attempt += 1) {
        if (cancelled) return false;
        if (document.getElementById(SCAN_IN_READER_ID)) return true;
        await new Promise((resolve) => window.setTimeout(resolve, 50));
      }
      return false;
    };

    const startScanner = async () => {
      const hasReaderElement = await waitForReaderElement();
      if (!hasReaderElement || cancelled) {
        setScannerStarting(false);
        setScannerError("Camera area did not load correctly. Close the dialog and try Scan In again.");
        return;
      }

      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 230, height: 230 },
            aspectRatio: 1,
          },
          async (decodedText) => {
            const now = Date.now();
            if (recentScanRef.current.value === decodedText && now - recentScanRef.current.at < 1500) {
              return;
            }
            recentScanRef.current = { value: decodedText, at: now };

            try {
              const resolved = await resolveScannedItem(decodedText);
              if (!resolved) return;

              setScanItems((current) => {
                if (current.some((item) => item.id === resolved.id)) {
                  return current;
                }
                return [resolved, ...current];
              });
              toast.success(`Added ${resolved.name} to the scan batch.`);
            } catch (error: any) {
              toast.error(error?.message ?? "Failed to read the scanned QR code.");
            }
          },
          () => undefined,
        );
        setScannerStarting(false);
      } catch {
        try {
          await scanner.start(
            { facingMode: "user" },
            {
              fps: 10,
              qrbox: { width: 230, height: 230 },
              aspectRatio: 1,
            },
            async (decodedText) => {
              const now = Date.now();
              if (recentScanRef.current.value === decodedText && now - recentScanRef.current.at < 1500) {
                return;
              }
              recentScanRef.current = { value: decodedText, at: now };

              try {
                const resolved = await resolveScannedItem(decodedText);
                if (!resolved) return;

                setScanItems((current) => {
                  if (current.some((item) => item.id === resolved.id)) {
                    return current;
                  }
                  return [resolved, ...current];
                });
                toast.success(`Added ${resolved.name} to the scan batch.`);
              } catch (error: any) {
                toast.error(error?.message ?? "Failed to read the scanned QR code.");
              }
            },
            () => undefined,
          );
          setScannerStarting(false);
        } catch (error: any) {
          setScannerStarting(false);
          setScannerError(error?.message ?? "Camera access failed. Check browser camera permission and try again.");
        }
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      scanner
        .stop()
        .catch(() => undefined)
        .then(() => scanner.clear().catch(() => undefined));
    };
  }, [assetManagerLocationId, divisionMap, isAssetManager, locationNameMap, profileMap, rows, scanOpen]);

  const confirmScanBatch = async () => {
    if (scanItems.length === 0) {
      toast.error("Scan at least one asset before confirming.");
      return;
    }

    if (!scanReturnLocationId) {
      toast.error("Select a return location before confirming the scan batch.");
      return;
    }

    setScanBusy(true);
    try {
      const verifiedItems: AssetReturn[] = [];

      for (const item of scanItems) {
        const refreshed = await fetchReturnRowById(item.id);
        if (!refreshed) {
          toast.error(`${item.name} no longer exists in the system.`);
          return;
        }

        if (refreshed.status !== "signed_out") {
          toast.error(`${item.name} is no longer signed out and cannot be scanned in.`);
          return;
        }

        if (isAssetManager && assetManagerLocationId && refreshed.department_id !== assetManagerLocationId) {
          toast.error(`${item.name} is outside your locked location and cannot be scanned in.`);
          return;
        }

        const formatted = formatAssetReturnRow(refreshed, {
          profileMap,
          divisionMap,
          locationMap: locationNameMap,
        });

        if (!formatted.signout_item_id) {
          toast.error(`${item.name} is missing an active sign-out record.`);
          return;
        }

        verifiedItems.push(formatted);
      }

      const success = await completeSignIn({
        items: verifiedItems,
        nextStatus: scanNextStatus,
        targetLocationId: scanReturnLocationId,
        notes: scanNotes,
        notePrefix: "QR scan-in batch completed.",
      });

      if (success) {
        setScanOpen(false);
        setScanItems([]);
        setSelectedIds(new Set());
      }
    } finally {
      setScanBusy(false);
    }
  };

  if (!isAdmin && !isAssetManager) return null;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-foreground glow-soft">Sign in</h1>
        <Button type="button" onClick={() => setScanOpen(true)}>
          <Camera size={15} className="mr-2" />
          Scan In
        </Button>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by name, tag, serial number, holder or group…"
          value={searchQ}
          onChange={(event) => setSearchQ(event.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Select value={divisionFilter} onValueChange={setDivisionFilter}>
          <SelectTrigger className="h-8 w-40 text-xs">
            <SelectValue placeholder="Division" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All divisions</SelectItem>
            {scopedDivisionOptions.map((division) => (
              <SelectItem key={division} value={division}>
                {division}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="h-8 w-40 text-xs">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {scopedLocationFilterOptions.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={holderFilter} onValueChange={setHolderFilter}>
          <SelectTrigger className="h-8 w-40 text-xs">
            <SelectValue placeholder="User" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All users</SelectItem>
            {scopedHolderOptions.map((holder) => (
              <SelectItem key={holder} value={holder}>
                {holder}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={packageFilter} onValueChange={setPackageFilter}>
          <SelectTrigger className="h-8 w-44 text-xs">
            <SelectValue placeholder="Group signout" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All groups</SelectItem>
            {scopedPackageOptions.map((pkg) => (
              <SelectItem key={pkg} value={pkg}>
                {pkg}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFilterActive && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
          >
            Clear filters
          </button>
        )}

        {filteredRows.length > 0 && (
          <Button type="button" variant="outline" size="sm" className="ml-auto gap-2 h-8 text-xs" onClick={toggleAllFiltered}>
            {allFilteredSelected ? <CheckSquare size={13} /> : <Square size={13} />}
            {allFilteredSelected ? "Deselect all" : `Select all (${filteredRows.length})`}
          </Button>
        )}
      </div>

      {selectedCount > 0 && (
        <div className="sticky top-4 z-30 flex flex-wrap items-center gap-2 rounded-[1.3rem] border border-primary/30 bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
          <span className="mr-auto font-mono text-sm text-primary">
            {selectedCount} item{selectedCount === 1 ? "" : "s"} selected
          </span>
          <Button size="sm" className="gap-1.5" onClick={() => openSelectedDecision("available")}>
            <Check size={13} /> Sign in as Available
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
            onClick={() => openSelectedDecision("out_for_repairs")}
          >
            <Wrench size={13} /> Out for Repairs
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
            onClick={() => openSelectedDecision("damaged")}
          >
            <XCircle size={13} /> Damaged
          </Button>
          <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setSelectedIds(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {loading ? (
        <div className="rounded-[1.5rem] border border-primary/12 bg-card/70 px-6 py-12 text-center font-mono text-sm text-primary/70">
          Loading signed-out assets…
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="rounded-[1.5rem] border border-primary/12 bg-card/70 px-6 py-12 text-center font-mono text-sm text-muted-foreground/70">
          No signed-out assets match your search or filters.
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {filteredRows.map((item) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(item.id)}
                className={cn(
                  "group flex w-full flex-col gap-1 rounded-[1.3rem] border px-4 py-3 text-left transition-all sm:min-w-[240px] sm:w-auto",
                  isSelected
                    ? "border-primary/60 bg-primary/10 shadow-[0_0_12px_rgba(0,200,100,0.12)]"
                    : "border-primary/15 bg-card/50 hover:border-primary/35 hover:bg-primary/5",
                )}
              >
                <div className="flex items-center gap-2">
                  {isSelected ? (
                    <CheckSquare size={14} className="shrink-0 text-primary" />
                  ) : (
                    <Square size={14} className="shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground" />
                  )}
                  <span className="font-mono text-xs text-primary/70">{item.code}</span>
                  <Badge variant="outline" className={cn("ml-auto text-[10px] uppercase tracking-wider", getStatusBadgeClass("signed_out"))}>
                    Signed Out
                  </Badge>
                </div>

                <div className="pl-5 space-y-0.5">
                  <p className="text-sm font-medium text-foreground leading-tight">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.holder_name}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[10px] text-muted-foreground/60">
                    {item.division_name !== "—" && <span>{item.division_name}</span>}
                    {item.location_name !== "—" && <span>{item.location_name}</span>}
                    {item.serial_number && <span>{item.serial_number}</span>}
                    {item.package_name && <span className="text-primary/60">Group {item.package_name}</span>}
                  </div>
                </div>

                <div
                  className={cn(
                    "pl-5 mt-1 flex flex-wrap gap-1.5 overflow-hidden transition-all",
                    isSelected ? "max-h-20 opacity-100" : "max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100",
                  )}
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openBulkDecision([item], "available");
                    }}
                    className="flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Check size={10} /> Available
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openBulkDecision([item], "out_for_repairs");
                    }}
                    className="flex items-center gap-1 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                  >
                    <Wrench size={10} /> Repairs
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openBulkDecision([item], "damaged");
                    }}
                    className="flex items-center gap-1 rounded-full border border-rose-500/25 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-300 hover:bg-rose-500/20 transition-colors"
                  >
                    <XCircle size={10} /> Damaged
                  </button>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Dialog open={!!bulkDecision} onOpenChange={(open) => !open && setBulkDecision(null)}>
        <DialogContent className="bg-card/95" aria-describedby={bulkDecisionDescriptionId}>
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              {bulkDecision
                ? `Sign in ${bulkDecision.items.length} item${bulkDecision.items.length === 1 ? "" : "s"} — ${getAssetStatusLabel(bulkDecision.nextStatus)}`
                : "Complete sign-in"}
            </DialogTitle>
            <DialogDescription id={bulkDecisionDescriptionId} className="text-muted-foreground">
              Confirm the location, condition, and notes for the selected sign-in items.
            </DialogDescription>
          </DialogHeader>

          {bulkDecision && (
            <div className="space-y-4">
              <div className="max-h-44 space-y-1.5 overflow-y-auto rounded-[1.2rem] border border-primary/12 bg-secondary/60 px-3 py-2">
                {bulkDecision.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <span className="shrink-0 font-mono text-xs text-primary/70">{item.code}</span>
                    <span className="truncate text-foreground">{item.name}</span>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">{item.holder_name}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Return location</Label>
                {isAssetManager && assetManagerLocationId ? (
                  <div className="rounded-md border border-primary/20 bg-primary/10 px-3 py-2 font-mono text-sm text-primary/90">
                    {locationOptions.find((location) => location.id === assetManagerLocationId)?.name ?? "Locked to assigned location"}
                  </div>
                ) : (
                  <Select value={returnLocationId} onValueChange={setReturnLocationId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the return location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationOptions.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Notes (optional)</Label>
                <Textarea
                  value={decisionNotes}
                  onChange={(event) => setDecisionNotes(event.target.value)}
                  placeholder={
                    bulkDecision.nextStatus === "damaged"
                      ? "Describe why the asset(s) are not usable."
                      : bulkDecision.nextStatus === "out_for_repairs"
                        ? "Describe the repair issue."
                        : "Optional sign-in notes."
                  }
                />
              </div>

              <div className="space-y-2 rounded-[1.25rem] border border-primary/12 bg-primary/6 p-3 text-sm">
                <div className="flex items-center gap-2 text-foreground">
                  <MapPin size={14} className="shrink-0 text-primary" />
                  All selected items will be moved to the chosen return location.
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <AlertCircle size={14} className="shrink-0 text-primary" />
                  History records both the admin completing this action and the last holder.
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setBulkDecision(null)}>
              Cancel
            </Button>
            <Button onClick={confirmBulkDecision} disabled={!bulkDecision || processing}>
              {processing ? "Processing…" : `Confirm (${bulkDecision?.items.length ?? 0})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={scanOpen} onOpenChange={setScanOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto border-primary/20 bg-card sm:max-w-3xl" aria-describedby={scanInDescriptionId}>
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">Scan In</DialogTitle>
            <DialogDescription id={scanInDescriptionId} className="text-muted-foreground">
              Use your camera to scan UUID QR codes, collect multiple signed-out items, and sign them back in together.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-3">
                <div className="rounded-[1.6rem] border border-primary/18 bg-background p-4">
                  <div className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-primary/72">
                    <Camera size={14} />
                    Camera scanner
                  </div>
                  <div id={SCAN_IN_READER_ID} className="min-h-[280px] overflow-hidden rounded-[1.2rem] border border-primary/12 bg-black/60" />
                  <div className="mt-3 text-xs text-muted-foreground">
                    Scan the asset QR code. Each valid UUID is added into the sign-in batch automatically.
                  </div>
                  {scannerStarting && (
                    <div className="mt-3 rounded-[1rem] border border-primary/15 bg-primary/8 px-3 py-2 text-xs text-primary/80">
                      Starting camera…
                    </div>
                  )}
                  {scannerError && (
                    <div className="mt-3 rounded-[1rem] border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                      {scannerError}
                    </div>
                  )}
                </div>

                <div className="rounded-[1.6rem] border border-primary/18 bg-secondary/75 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="font-mono text-xs uppercase tracking-[0.18em] text-primary/72">
                      Scanned items ({scanItems.length})
                    </div>
                    {scanItems.length > 0 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setScanItems([])}>
                        Clear all
                      </Button>
                    )}
                  </div>

                  {scanItems.length === 0 ? (
                    <div className="rounded-[1.2rem] border border-primary/10 bg-background px-4 py-8 text-center text-sm text-muted-foreground">
                      No items scanned yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {scanItems.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 rounded-[1.2rem] border border-primary/12 bg-background px-4 py-3">
                          <div className="min-w-0 flex-1">
                            <div className="font-mono text-xs uppercase tracking-[0.16em] text-primary/70">{item.code}</div>
                            <div className="truncate text-sm text-foreground">{item.name}</div>
                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                              {item.serial_number && <span>{item.serial_number}</span>}
                              {item.division_name !== "—" && <span>{item.division_name}</span>}
                              {item.location_name !== "—" && <span>{item.location_name}</span>}
                              <span>{item.holder_name}</span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setScanItems((current) => current.filter((entry) => entry.id !== item.id))}
                            className="shrink-0 text-muted-foreground hover:text-rose-300"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 rounded-[1.6rem] border border-primary/18 bg-card p-4">
                <div className="space-y-2">
                  <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Return status</Label>
                  <Select value={scanNextStatus} onValueChange={(value) => setScanNextStatus(value as "available" | "out_for_repairs" | "damaged")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="out_for_repairs">Out for Repairs</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Return location</Label>
                  {isAssetManager && assetManagerLocationId ? (
                    <div className="rounded-md border border-primary/20 bg-primary/10 px-3 py-2 font-mono text-sm text-primary/90">
                      {locationOptions.find((location) => location.id === assetManagerLocationId)?.name ?? "Locked to assigned location"}
                    </div>
                  ) : (
                    <Select value={scanReturnLocationId} onValueChange={setScanReturnLocationId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the return location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locationOptions.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="font-mono text-xs uppercase tracking-[0.14em] text-primary/72">Notes (optional)</Label>
                  <Textarea
                    value={scanNotes}
                    onChange={(event) => setScanNotes(event.target.value)}
                    placeholder="Optional notes for this scan-in capture."
                  />
                </div>

                <div className="space-y-2 rounded-[1.25rem] border border-primary/12 bg-primary/6 p-3 text-sm">
                  <div className="flex items-start gap-2 text-foreground">
                    <AlertCircle size={14} className="mt-0.5 shrink-0 text-primary" />
                    Every scanned item will be signed in together under one capture with the same return location, status, and notes.
                  </div>
                  <div className="flex items-start gap-2 text-foreground">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
                    Asset Managers are still limited to their locked location during QR scan-in.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setScanOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmScanBatch} disabled={scanItems.length === 0 || scanBusy || processing}>
              {scanBusy || processing ? "Processing…" : `Confirm Scan In (${scanItems.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
