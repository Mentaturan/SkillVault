import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AssetDeployClient } from "@/components/deployment/asset-deploy-client";
import { Button } from "@/components/ui/button";
import { getDeploymentPageData } from "@/server/services/deployment-service";

interface AssetDeployPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssetDeployPage({ params }: AssetDeployPageProps) {
  const { id } = await params;
  const data = await getDeploymentPageData(id).catch(() => null);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-2">
        <Link href={`/assets/${id}`}>
          <ArrowLeft className="h-4 w-4" />
          返回资产详情
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-semibold">部署资产</h1>
        <p className="text-sm text-muted-foreground">
          {data.asset.title} · 导出预设 {data.asset.exportPreset}
        </p>
      </div>

      <AssetDeployClient
        asset={data.asset}
        targets={data.targets}
        initialStatuses={data.statuses}
      />
    </div>
  );
}
