import type { Tables } from "@/integrations/supabase/types";

export type ConsumableType = Tables<"consumable_types">;
export type ConsumableStock = Tables<"consumable_stock">;
export type AssetConsumableLink = Tables<"asset_consumables_active">;
export type ConsumableAggregate = Tables<"consumable_type_totals">;

export function groupConsumablesByAsset(links: AssetConsumableLink[]) {
  return links.reduce<Record<string, AssetConsumableLink[]>>((acc, link) => {
    if (!acc[link.asset_id]) acc[link.asset_id] = [];
    acc[link.asset_id].push(link);
    return acc;
  }, {});
}

export function getConsumableModeLabel(link: Pick<AssetConsumableLink, "follows_parent">) {
  return link.follows_parent ? "Follows parent" : "Reference only";
}

export function getConsumableModeClass(link: Pick<AssetConsumableLink, "follows_parent">) {
  return link.follows_parent
    ? "border-primary/35 bg-primary/12 text-primary"
    : "border-sky-500/35 bg-sky-500/12 text-sky-200";
}

export function getConsumableSummary(links: AssetConsumableLink[]) {
  if (links.length === 0) return "No linked consumables";
  return links
    .map((link) => `${link.quantity} x ${link.consumable_name}`)
    .join(" | ");
}
