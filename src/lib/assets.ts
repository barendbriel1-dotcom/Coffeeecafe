export const ASSET_STATUSES = [
  "available",
  "signed_out",
  "out_for_repairs",
  "damaged",
] as const;

export type AssetStatus = (typeof ASSET_STATUSES)[number];

export const LOCATION_NAMES = [
  "Centurion",
  "Krugersdorp",
  "Office",
  "Prophet",
  "Traveling",
] as const;

export const DEFAULT_ASSET_TYPE_NAME = "General";

export const STATUS_LABELS: Record<string, string> = {
  available: "Available",
  signed_out: "Signed Out",
  out_for_repairs: "Out for Repairs",
  damaged: "Damaged",
  in_handover: "Signed Out",
  maintenance: "Out for Repairs",
  retired: "Damaged",
  lost: "Damaged",
};

export const STATUS_BADGE_CLASSES: Record<string, string> = {
  available: "border-primary/35 bg-primary/12 text-primary",
  signed_out: "border-amber-500/35 bg-amber-500/12 text-amber-300",
  out_for_repairs: "border-cyan-500/35 bg-cyan-500/12 text-cyan-300",
  damaged: "border-rose-500/35 bg-rose-500/12 text-rose-300",
  in_handover: "border-amber-500/35 bg-amber-500/12 text-amber-300",
  maintenance: "border-cyan-500/35 bg-cyan-500/12 text-cyan-300",
  retired: "border-rose-500/35 bg-rose-500/12 text-rose-300",
  lost: "border-rose-500/35 bg-rose-500/12 text-rose-300",
};

export function getAssetStatusLabel(status: string) {
  return STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}

export function normalizeAssetStatus(status: string): AssetStatus {
  if (status === "maintenance") return "out_for_repairs";
  if (status === "retired" || status === "lost") return "damaged";
  if (status === "in_handover") return "signed_out";
  return (ASSET_STATUSES.includes(status as AssetStatus) ? status : "available") as AssetStatus;
}

export function getStatusBadgeClass(status: string) {
  return STATUS_BADGE_CLASSES[normalizeAssetStatus(status)];
}

export function buildSearchBlob(parts: Array<string | null | undefined>) {
  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function getTagPrefix(divisionName?: string | null, assetName?: string | null) {
  const divisionChar = firstTagCharacter(divisionName);
  const assetChar = firstTagCharacter(assetName);
  return `${divisionChar}${assetChar}`;
}

export function generateAssetTag(divisionName: string | null | undefined, assetName: string | null | undefined, usedCodes: Set<string>) {
  const prefix = getTagPrefix(divisionName, assetName);

  for (let attempt = 0; attempt < 2000; attempt += 1) {
    const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    const candidate = `${prefix}${suffix}`;
    if (!usedCodes.has(candidate)) {
      usedCodes.add(candidate);
      return candidate;
    }
  }

  for (let suffix = 0; suffix < 1000; suffix += 1) {
    const candidate = `${prefix}${suffix.toString().padStart(3, "0")}`;
    if (!usedCodes.has(candidate)) {
      usedCodes.add(candidate);
      return candidate;
    }
  }

  throw new Error(`No more tag codes available for prefix ${prefix}`);
}

export function generateSingleCharacterCode(name: string, usedCodes: Iterable<string>) {
  const taken = new Set(Array.from(usedCodes, (code) => (code ?? "").toUpperCase()));
  const cleaned = (name ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");

  for (const char of cleaned) {
    if (!taken.has(char)) return char;
  }

  const fallback = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (const char of fallback) {
    if (!taken.has(char)) return char;
  }

  throw new Error("No single-character codes are available.");
}

export function generateNameCode(name: string, usedCodes: Iterable<string>, maxLength = 4) {
  const taken = new Set(Array.from(usedCodes, (code) => (code ?? "").toUpperCase()));
  const words = (name ?? "")
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter(Boolean);

  const candidates = new Set<string>();
  if (words.length > 1) {
    candidates.add(words.map((word) => word[0]).join("").slice(0, maxLength));
  }

  if (words.length > 0) {
    candidates.add(words[0].slice(0, maxLength));
  }

  const compact = words.join("");
  if (compact) {
    candidates.add(compact.slice(0, maxLength));
  }

  for (const candidate of candidates) {
    if (candidate && !taken.has(candidate)) return candidate;
  }

  const base = compact.slice(0, Math.max(1, maxLength - 1)) || "X";
  for (let index = 1; index <= 99; index += 1) {
    const suffix = index.toString();
    const candidate = `${base}${suffix}`.slice(0, maxLength);
    if (!taken.has(candidate)) return candidate;
  }

  throw new Error("No code could be generated for this name.");
}

function firstTagCharacter(value?: string | null) {
  const cleaned = (value ?? "").replace(/[^A-Za-z0-9]/g, "");
  return cleaned ? cleaned[0].toUpperCase() : "X";
}
