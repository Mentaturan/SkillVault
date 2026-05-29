import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AssetCard } from "@/components/assets/asset-card";
import { getAssets } from "@/server/services/asset-service";
import { Plus } from "lucide-react";

export default async function AssetsPage() {
  const assets = await getAssets();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
