"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ASSET_SOURCE_FILTER_LABELS,
  ASSET_SOURCE_FILTERS,
  ASSET_STATE_FILTER_LABELS,
  ASSET_STATE_FILTERS,
  ASSET_STATUS_LABELS,
  ASSET_STATUSES,
  ASSET_TYPE_LABELS,
  ASSET_TYPES,
  LIFECYCLE_FILTER_LABELS,
  LIFECYCLE_FILTERS,
  MAINTENANCE_PRESET_FILTERS,
  SORT_OPTION_LABELS,
  SORT_OPTIONS,
  TARGET_TOOL_LABELS,
  TARGET_TOOLS,
  type AssetSource,
  type AssetStatus,
  type AssetStateFilter,
  type AssetType,
  type LifecycleFilter,
  type SortOption,
  type TargetTool,
} from "@/lib/constants";
import type { Tag, SearchPreset } from "@/db/schema";
import { saveSearchPresetAction, deleteSearchPresetAction } from "@/app/assets/search-preset-actions";
import { parsePresetFilters } from "@/lib/search-preset";

export interface AssetFilterValues {
  search?: string;
  stateFilter?: AssetStateFilter;
  lifecycleFilters?: LifecycleFilter[];
  type?: AssetType;
  targetTool?: TargetTool;
  source?: AssetSource;
  status?: AssetStatus;
  tag?: string;
  includeArchived?: boolean;
  includeDeleted?: boolean;
  sortBy?: SortOption;
}

interface AssetFiltersProps {
  filters: AssetFilterValues;
  tags: Tag[];
  presets: SearchPreset[];
}

const ALL_VALUE = "_all";

export function AssetFilters({ filters, tags, presets }: AssetFiltersProps) {
  const router = useRouter();
  const [pendingSearch, setPendingSearch] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displaySearch = pendingSearch ?? filters.search ?? "";

  function buildQuery(updates: Partial<AssetFilterValues>) {
    const params = new URLSearchParams();

    const merged = { ...filters, ...updates };

    if (merged.search) params.set("q", merged.search);
    if (merged.stateFilter) params.set("stateFilter", merged.stateFilter);
    if (merged.lifecycleFilters && merged.lifecycleFilters.length > 0) {
      for (const lf of merged.lifecycleFilters) {
        params.append("lifecycle", lf);
      }
    }
    if (merged.type) params.set("type", merged.type);
    if (merged.targetTool) params.set("targetTool", merged.targetTool);
    if (merged.source) params.set("source", merged.source);
    if (merged.status) params.set("status", merged.status);
    if (merged.tag) params.set("tag", merged.tag);
    if (merged.includeArchived) params.set("includeArchived", "true");
    if (merged.includeDeleted) params.set("includeDeleted", "true");
    if (merged.sortBy) params.set("sortBy", merged.sortBy);

    return params.toString();
  }

  function applyFilters(updates: Partial<AssetFilterValues> = {}) {
    const qs = buildQuery(updates);
    router.push(qs ? `/assets?${qs}` : "/assets");
  }

  function clearFilters() {
    setPendingSearch(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    router.push("/assets");
  }

  function toggleLifecycleFilter(filter: LifecycleFilter) {
    const current = filters.lifecycleFilters ?? [];
    const next = current.includes(filter)
      ? current.filter((f) => f !== filter)
      : [...current, filter];
    applyFilters({ lifecycleFilters: next.length > 0 ? next : undefined });
  }

  function applyMaintenancePreset() {
    const current = filters.lifecycleFilters ?? [];
    const isPresetActive =
      MAINTENANCE_PRESET_FILTERS.every((f) => current.includes(f)) &&
      current.length === MAINTENANCE_PRESET_FILTERS.length;
    if (isPresetActive) {
      applyFilters({ lifecycleFilters: undefined });
    } else {
      applyFilters({ lifecycleFilters: [...MAINTENANCE_PRESET_FILTERS] });
    }
  }

  const isMaintenancePresetActive = (() => {
    const current = filters.lifecycleFilters ?? [];
    return (
      MAINTENANCE_PRESET_FILTERS.every((f) => current.includes(f)) &&
      current.length === MAINTENANCE_PRESET_FILTERS.length
    );
  })();

  function applyPreset(preset: SearchPreset) {
    const presetFilters = parsePresetFilters(preset.filters);
    const qs = buildQuery(presetFilters);
    router.push(qs ? `/assets?${qs}` : "/assets");
  }

  async function handleSavePreset() {
    if (!presetName.trim()) return;
    setIsSaving(true);
    const currentFilters = { ...filters, search: pendingSearch ?? filters.search };
    await saveSearchPresetAction(presetName.trim(), JSON.stringify(currentFilters));
    setPresetName("");
    setShowSaveDialog(false);
    setIsSaving(false);
  }

  async function handleDeletePreset(id: string) {
    await deleteSearchPresetAction(id);
  }

  return (
    <div className="space-y-3 rounded-md border bg-background p-3">
      {presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">预设</span>
          {presets.map((preset) => (
            <div key={preset.id} className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
              >
                {preset.name}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground"
                onClick={() => handleDeletePreset(preset.id)}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(180px,1.4fr)_repeat(5,minmax(130px,1fr))_auto]">
        <div className="space-y-1.5">
          <Label htmlFor="q">搜索</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="q"
              name="q"
              value={displaySearch}
              placeholder="标题、内容、标签"
              className="pl-8"
              onChange={(e) => {
                const value = e.target.value;
                setPendingSearch(value);
                if (debounceRef.current) clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(() => {
                  setPendingSearch(null);
                  applyFilters({ search: value || undefined });
                }, 300);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (debounceRef.current) clearTimeout(debounceRef.current);
                  setPendingSearch(null);
                  applyFilters({ search: (e.target as HTMLInputElement).value || undefined });
                }
                if (e.key === "Escape") {
                  setPendingSearch(null);
                  applyFilters({ search: undefined });
                }
              }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>专项筛选</Label>
          <Select
            defaultValue={filters.stateFilter ?? ALL_VALUE}
            onValueChange={(v) =>
              applyFilters({
                stateFilter: v === ALL_VALUE ? undefined : (v as AssetStateFilter),
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>全部资产</SelectItem>
              {ASSET_STATE_FILTERS.map((stateFilter) => (
                <SelectItem key={stateFilter} value={stateFilter}>
                  {ASSET_STATE_FILTER_LABELS[stateFilter]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>类型</Label>
          <Select
            defaultValue={filters.type ?? ALL_VALUE}
            onValueChange={(v) =>
              applyFilters({ type: v === ALL_VALUE ? undefined : (v as AssetType) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>全部类型</SelectItem>
              {ASSET_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {ASSET_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>工具</Label>
          <Select
            defaultValue={filters.targetTool ?? ALL_VALUE}
            onValueChange={(v) =>
              applyFilters({ targetTool: v === ALL_VALUE ? undefined : (v as TargetTool) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>全部工具</SelectItem>
              {TARGET_TOOLS.map((tool) => (
                <SelectItem key={tool} value={tool}>
                  {TARGET_TOOL_LABELS[tool]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>状态</Label>
          <Select
            defaultValue={filters.status ?? ALL_VALUE}
            onValueChange={(v) =>
              applyFilters({ status: v === ALL_VALUE ? undefined : (v as AssetStatus) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>全部状态</SelectItem>
              {ASSET_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {ASSET_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>来源</Label>
          <Select
            defaultValue={filters.source ?? ALL_VALUE}
            onValueChange={(v) =>
              applyFilters({ source: v === ALL_VALUE ? undefined : (v as AssetSource) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>全部来源</SelectItem>
              {ASSET_SOURCE_FILTERS.map((source) => (
                <SelectItem key={source} value={source}>
                  {ASSET_SOURCE_FILTER_LABELS[source]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>标签</Label>
          <Select
            defaultValue={filters.tag ?? ALL_VALUE}
            onValueChange={(v) =>
              applyFilters({ tag: v === ALL_VALUE ? undefined : v })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>全部标签</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.name}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>排序</Label>
          <Select
            defaultValue={filters.sortBy ?? "updatedAt_desc"}
            onValueChange={(v) =>
              applyFilters({ sortBy: v as SortOption })
            }
          >
            <SelectTrigger className="w-full lg:w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((sort) => (
                <SelectItem key={sort} value={sort}>
                  {SORT_OPTION_LABELS[sort]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">生命周期筛选</span>
          <Button
            variant={isMaintenancePresetActive ? "default" : "outline"}
            size="sm"
            onClick={applyMaintenancePreset}
          >
            维护队列
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {LIFECYCLE_FILTERS.map((filter) => {
            const isActive = (filters.lifecycleFilters ?? []).includes(filter);
            return (
              <Button
                key={filter}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => toggleLifecycleFilter(filter)}
              >
                {LIFECYCLE_FILTER_LABELS[filter]}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeArchived"
              checked={filters.includeArchived ?? false}
              onCheckedChange={(checked) =>
                applyFilters({ includeArchived: checked === true || undefined })
              }
            />
            <label htmlFor="includeArchived" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              显示归档
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeDeleted"
              checked={filters.includeDeleted ?? false}
              onCheckedChange={(checked) =>
                applyFilters({ includeDeleted: checked === true || undefined })
              }
            />
            <label htmlFor="includeDeleted" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              显示删除
            </label>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={clearFilters}>
            清空
          </Button>
          <Button
            onClick={() => {
              if (debounceRef.current) clearTimeout(debounceRef.current);
              setPendingSearch(null);
              applyFilters({ search: displaySearch || undefined });
            }}
          >
            应用
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSaveDialog(true)}
          >
            保存为预设
          </Button>
        </div>
      </div>

      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg border bg-background p-4 shadow-lg">
            <h3 className="text-sm font-medium mb-2">保存搜索预设</h3>
            <Input
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="预设名称"
              className="mb-3"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSavePreset();
                if (e.key === "Escape") setShowSaveDialog(false);
              }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(false)}>
                取消
              </Button>
              <Button size="sm" onClick={handleSavePreset} disabled={isSaving || !presetName.trim()}>
                保存
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
