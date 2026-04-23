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

function firstTagCharacter(value?: string | null) {
  const cleaned = (value ?? "").replace(/[^A-Za-z0-9]/g, "");
  return cleaned ? cleaned[0].toUpperCase() : "X";
}
