import { nanoid } from "nanoid";
import { findAllSearchPresets, createSearchPreset, deleteSearchPreset } from "@/server/queries/search-preset-queries";
import type { AssetFilterValues } from "@/components/assets/asset-filters";
import { parsePresetFilters } from "@/lib/search-preset";

export { parsePresetFilters };

export async function getSearchPresets() {
  return findAllSearchPresets();
}

export async function saveSearchPreset(name: string, filters: AssetFilterValues) {
  const id = nanoid();
  const filtersJson = JSON.stringify(filters);
  return createSearchPreset({
    id,
    name,
    filters: filtersJson,
    createdAt: Date.now(),
  });
}

export async function removeSearchPreset(id: string) {
  return deleteSearchPreset(id);
}
