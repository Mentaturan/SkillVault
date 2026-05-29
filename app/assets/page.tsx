import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AssetCard } from "@/components/assets/asset-card";
import { AssetFilters, type AssetFilterValues } from "@/components/assets/asset-filters";
import { getAssets } from "@/server/services/asset-service";
import { getAllTags } from "@/server/services/tag-service";
import {
  ASSET_STATUSES,
  ASSET_TYPES,
  SORT_OPTIONS,
  TARGET_TOOLS,
} from "@/lib/constants";
import { Plus } from "lucide-react";

interface AssetsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getSingleParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function parseFilters(
  params: Record<string, string | string[] | undefined>,
): AssetFilterValues {
  const search = getSingleParam(params, "q")?.trim() || undefined;
  const type = getSingleParam(params, "type");
  const targetTool = getSingleParam(params, "targetTool");
  const status = getSingleParam(params, "status");
  const tag = getSingleParam(params, "tag");
  const sortBy = getSingleParam(params, "sortBy");

  return {
    search,
    type: ASSET_TYPES.find((item) => item === type),
    targetTool: TARGET_TOOLS.find((item) => item === targetTool),
    status: ASSET_STATUSES.find((item) => item === status),
    tag: tag && tag !== "_all" ? tag : undefined,
    includeArchived: getSingleParam(params, "includeArchived") === "true",
    includeDeleted: getSingleParam(params, "includeDeleted") === "true",
    sortBy: SORT_OPTIONS.find((item) => item === sortBy),
  };
}

export default async function AssetsPage({ searchParams }: AssetsPageProps) {
  const filters = parseFilters(await searchParams);
  const [assets, tags] = await Promise.all([
    getAssets({
      status: filters.status,
      type: filters.type,
      targetTool: filters.targetTool,
      search: filters.search,
      tag: filters.tag,
      includeArchived: filters.includeArchived,
      includeDeleted: filters.includeDeleted,
      sortBy: filters.sortBy,
    }),
    getAllTags(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">资产库</h1>
          <p className="text-sm text-muted-foreground">
            管理可复用的 AI 工作流资产
          </p>
        </div>
        <Button asChild>
          <Link href="/assets/new">
            <Plus className="mr-2 h-4 w-4" />
            新建资产
          </Link>
        </Button>
      </div>

      <AssetFilters filters={filters} tags={tags} />

      {assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">还没有资产</p>
          <Button asChild variant="link" className="mt-2">
            <Link href="/assets/new">创建第一个资产</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
}
