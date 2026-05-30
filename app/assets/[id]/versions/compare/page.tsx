import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { VersionDiffView } from "@/components/assets/version-diff-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { diffTextSnapshots } from "@/lib/version-diff";
import { getAssetById } from "@/server/services/asset-service";
import { getVersionById } from "@/server/services/version-service";

interface AssetVersionComparePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getSingleParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function AssetVersionComparePage({
  params,
  searchParams,
}: AssetVersionComparePageProps) {
  const { id } = await params;
  const query = await searchParams;
  const fromId = getSingleParam(query, "from");
  const toId = getSingleParam(query, "to");
  const asset = await getAssetById(id);

  if (!asset || !fromId || !toId) {
    notFound();
  }

  const [fromVersion, toVersion] = await Promise.all([
    getVersionById(fromId),
    getVersionById(toId),
  ]);

  if (
    !fromVersion ||
    !toVersion ||
    fromVersion.assetId !== asset.id ||
    toVersion.assetId !== asset.id
  ) {
    notFound();
  }

  const diffLines = diffTextSnapshots(
    fromVersion.contentSnapshot,
    toVersion.contentSnapshot,
  );
  const titleChanged = fromVersion.titleSnapshot !== toVersion.titleSnapshot;

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-2">
          <Link href={`/assets/${asset.id}/versions`}>
            <ArrowLeft className="h-4 w-4" />
            返回版本历史
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">版本对比</h1>
        <p className="text-sm text-muted-foreground">{asset.title}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">
              版本 {fromVersion.version} {"->"} 版本 {toVersion.version}
            </CardTitle>
            <Badge variant="outline">
              {diffLines.filter((line) => line.type === "added").length} 行新增
            </Badge>
            <Badge variant="outline">
              {diffLines.filter((line) => line.type === "removed").length} 行删除
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">旧版本</p>
              <p>版本 {fromVersion.version}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(fromVersion.createdAt).toLocaleString("zh-CN")}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">新版本</p>
              <p>版本 {toVersion.version}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(toVersion.createdAt).toLocaleString("zh-CN")}
              </p>
            </div>
          </div>

          {titleChanged ? (
            <div className="rounded-md border p-3 text-sm">
              <p className="text-muted-foreground">标题变化</p>
              <p>
                <span className="text-destructive">{fromVersion.titleSnapshot}</span>
                {" -> "}
                <span className="text-emerald-700">{toVersion.titleSnapshot}</span>
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <VersionDiffView lines={diffLines} />
    </div>
  );
}
