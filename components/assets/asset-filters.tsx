import Link from "next/link";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  ASSET_STATUS_LABELS,
  ASSET_STATUSES,
  ASSET_TYPE_LABELS,
  ASSET_TYPES,
  SORT_OPTION_LABELS,
  SORT_OPTIONS,
  TARGET_TOOL_LABELS,
  TARGET_TOOLS,
  type AssetStatus,
  type AssetType,
  type SortOption,
  type TargetTool,
} from "@/lib/constants";
import type { Tag } from "@/db/schema";

export interface AssetFilterValues {
  search?: string;
  type?: AssetType;
  targetTool?: TargetTool;
  status?: AssetStatus;
  tag?: string;
  includeArchived?: boolean;
  includeDeleted?: boolean;
  sortBy?: SortOption;
}

interface AssetFiltersProps {
  filters: AssetFilterValues;
  tags: Tag[];
}

const ALL_VALUE = "_all";

export function AssetFilters({ filters, tags }: AssetFiltersProps) {
  return (
    <form
      action="/assets"
      className="space-y-3 rounded-md border bg-background p-3"
    >
      <div className="grid gap-3 md:grid-cols-[minmax(180px,1.4fr)_repeat(4,minmax(130px,1fr))_auto]">
        <div className="space-y-1.5">
          <Label htmlFor="q">搜索</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="q"
              name="q"
              defaultValue={filters.search ?? ""}
              placeholder="标题、内容、标签"
              className="pl-8"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>类型</Label>
          <Select name="type" defaultValue={filters.type ?? ALL_VALUE}>
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
            name="targetTool"
            defaultValue={filters.targetTool ?? ALL_VALUE}
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
          <Select name="status" defaultValue={filters.status ?? ALL_VALUE}>
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
          <Label>标签</Label>
          <Select name="tag" defaultValue={filters.tag ?? ALL_VALUE}>
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
          <Select name="sortBy" defaultValue={filters.sortBy ?? "updatedAt_desc"}>
            <SelectTrigger className="md:w-[130px]">
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="includeArchived"
              value="true"
              defaultChecked={filters.includeArchived}
              className="h-4 w-4 rounded border-gray-300"
            />
            显示归档
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="includeDeleted"
              value="true"
              defaultChecked={filters.includeDeleted}
              className="h-4 w-4 rounded border-gray-300"
            />
            显示删除
          </label>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/assets">清空</Link>
          </Button>
          <Button type="submit">应用</Button>
        </div>
      </div>
    </form>
  );
}
