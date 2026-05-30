import Link from "next/link";

import { BatchAuditLog } from "@/components/maintenance/batch-audit-log";
import { DeploymentHealthSummary } from "@/components/maintenance/deployment-health-summary";
import { DuplicateCandidates } from "@/components/maintenance/duplicate-candidates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ASSET_STATUS_LABELS, ASSET_TYPE_LABELS } from "@/lib/constants";
import { getAssetMaintenanceQueue } from "@/server/services/maintenance-service";

export const dynamic = "force-dynamic";

function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AssetMaintenancePage() {
  const queue = await getAssetMaintenanceQueue();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">维护队列</h1>
          <p className="text-sm text-muted-foreground">
            集中查看存在错误、警告或风险提示的资产。
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/assets">返回资产库</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">已扫描资产</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{queue.summary.scannedAssetCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">待维护资产</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{queue.summary.flaggedAssetCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">优先处理</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>{queue.summary.errorAssetCount} 个含错误</p>
            <p>{queue.summary.warningOnlyAssetCount} 个仅警告</p>
          </CardContent>
        </Card>
      </div>

      {queue.items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            当前没有需要处理的资产。
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {queue.items.map((item) => (
            <Card key={item.asset.id}>
              <CardHeader className="gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">
                        <Link href={`/assets/${item.asset.id}`} className="hover:underline">
                          {item.asset.title}
                        </Link>
                      </CardTitle>
                      <Badge variant="secondary">
                        {ASSET_TYPE_LABELS[item.asset.type]}
                      </Badge>
                      <Badge variant="outline">
                        {ASSET_STATUS_LABELS[item.asset.status]}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>最近更新：{formatTimestamp(item.asset.updatedAt)}</span>
                      <span>Preset：{item.asset.exportPreset}</span>
                      <span>目标工具：{item.asset.targetTool}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.validation.summary.errorCount > 0 ? (
                      <Badge variant="destructive">
                        {item.validation.summary.errorCount} 个错误
                      </Badge>
                    ) : null}
                    {item.validation.summary.warningCount > 0 ? (
                      <Badge variant="outline">
                        {item.validation.summary.warningCount} 个警告
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {item.validation.issues.slice(0, 4).map((issue) => (
                  <div
                    key={`${item.asset.id}-${issue.code}-${issue.message}`}
                    className={`rounded-md border p-3 text-sm ${
                      issue.severity === "error"
                        ? "border-destructive/40 bg-destructive/10 text-destructive"
                        : "border-yellow-500/40 bg-yellow-500/10 text-yellow-700"
                    }`}
                  >
                    {issue.message}
                  </div>
                ))}
                {item.validation.issues.length > 4 ? (
                  <p className="text-xs text-muted-foreground">
                    还有 {item.validation.issues.length - 4} 条问题，进入详情页可查看完整结果。
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">重复候选</h2>
          <p className="text-sm text-muted-foreground">
            基于内容哈希和标题相似度检测到的可能重复资产对。
          </p>
        </div>
        <DuplicateCandidates />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">部署健康状态</h2>
          <p className="text-sm text-muted-foreground">
            查看所有部署目标的实时状态，包括已过期、目标缺失和文件漂移的情况。
          </p>
        </div>
        <DeploymentHealthSummary />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">批量操作历史</h2>
          <p className="text-sm text-muted-foreground">
            查看近期的批量操作记录，包括归档、重标、评分等操作。
          </p>
        </div>
        <BatchAuditLog />
      </div>
    </div>
  );
}
