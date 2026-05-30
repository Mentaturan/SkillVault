import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RollbackButton } from "@/components/assets/asset-actions";
import { getAssetById } from "@/server/services/asset-service";
import { getVersionsByAssetId } from "@/server/services/version-service";

interface AssetVersionsPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssetVersionsPage({
  params,
}: AssetVersionsPageProps) {
  const { id } = await params;
  const asset = await getAssetById(id);

  if (!asset) {
    notFound();
  }

  const versions = await getVersionsByAssetId(asset.id);
  const currentHash = asset.contentHash;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3 mb-2">
            <Link href={`/assets/${asset.id}`}>
              <ArrowLeft className="h-4 w-4" />
              返回资产
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">版本历史</h1>
          <p className="text-sm text-muted-foreground">{asset.title}</p>
        </div>
      </div>

      <div className="space-y-3">
        {versions.map((version, index) => {
          const isCurrent = version.contentHash === currentHash;

          return (
            <Card key={version.id}>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">
                        版本 {version.version}
                      </CardTitle>
                      {isCurrent && <Badge>当前内容</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(version.createdAt).toLocaleString("zh-CN")}
                    </p>
                    {version.changeNote && (
                      <p className="text-sm">{version.changeNote}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {versions[index + 1] ? (
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/assets/${asset.id}/versions/compare?from=${versions[index + 1].id}&to=${version.id}`}
                        >
                          与版本 {versions[index + 1].version} 对比
                        </Link>
                      </Button>
                    ) : null}
                    <RollbackButton
                      id={asset.id}
                      versionId={version.id}
                      version={version.version}
                      disabled={isCurrent}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">标题快照</p>
                  <p className="text-sm">{version.titleSnapshot}</p>
                </div>
                <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
                  {version.contentSnapshot}
                </pre>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
