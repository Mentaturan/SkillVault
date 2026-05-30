import type { AssetFilterValues } from "@/components/assets/asset-filters";

export function parsePresetFilters(filtersJson: string): AssetFilterValues {
  try {
    return JSON.parse(filtersJson) as AssetFilterValues;
  } catch {
    return {};
  }
}
