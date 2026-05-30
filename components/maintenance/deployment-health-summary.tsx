"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DeploymentHealthSummary } from "@/server/services/deployment-service";
import { getDeploymentHealthAction } from "@/app/assets/maintenance/actions";

const STATUS_GROUPS: Array<{
  status: "installed" | "stale" | "missing" | "broken";
  label: string;
  variant: "default" | "secondary" | "outline" | "destructive";
  color: string;
}> = [
  { status: "installed", label: "已部署", variant: "default", color: "" },
  { status: "stale", label: "已过期", variant: "secondary", color: "border-yellow-500/40 bg-yellow-500/10" },
  { status: "missing", label: "目标缺失", variant: "outline", color: "border-orange-500/40 bg-orange-500/10" },
  { status: "broken", label: "目标文件漂移", variant: "destructive", color: "border-destructive/40 bg-destructive/10" },
];

function formatTimestamp(timestamp: number | null) {
  if (!timestamp) return "—";
  return new Date(timestamp).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DeploymentHealthSummary() {
  const [data, setData] = useState<DeploymentHealthSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDeploymentHealthAction()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          加载部署状态中…
        </CardContent>
      </Card>
    );
  }

  if (!data || data.totalDeployed === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          暂无部署记录。
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {STATUS_GROUPS.map((group) => {
        const count = data.byStatus[group.status];
        if (count === 0) return null;

        const groupItems = data.items.filter(
          (item) => item.status === group.status,
        );

        return (
          <Card key={group.status} className={group.color || undefined}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">{group.label}</CardTitle>
                <Badge variant={group.variant}>{count}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {groupItems.map((item) => (
                  <div
                    key={`${item.assetId}-${item.targetKey}`}
                    className="flex flex-col gap-1 rounded-md border bg-background/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/assets/${item.assetId}/deployment`}
                        className="text-sm font-medium hover:underline"
                      >
                        {item.assetTitle}
                      </Link>
                      <Badge variant="outline" className="text-xs">
                        {item.targetLabel}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{item.statusReason}</span>
                      {item.targetFilePath && (
                        <span className="max-w-[200px] truncate" title={item.targetFilePath}>
                          {item.targetFilePath}
                        </span>
                      )}
                      <span>部署于 {formatTimestamp(item.lastDeployedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
