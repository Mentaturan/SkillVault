"use client";

import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BATCH_ACTION_TYPE_LABELS } from "@/lib/constants";
import type { BatchAuditLog } from "@/db/schema";
import { getBatchAuditLogsAction } from "@/app/assets/maintenance/actions";

function parseAssetIds(assetIds: string): string[] {
  try {
    return JSON.parse(assetIds);
  } catch {
    return [];
  }
}

function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function BatchAuditLog() {
  const [logs, setLogs] = useState<BatchAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    getBatchAuditLogsAction().then((result) => {
      if (result.success) setLogs(result.data);
      setLoading(false);
    });
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          正在加载批量操作历史…
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          暂无批量操作记录。
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => {
        const ids = parseAssetIds(log.assetIds);
        const label =
          BATCH_ACTION_TYPE_LABELS[log.actionType as keyof typeof BATCH_ACTION_TYPE_LABELS] ??
          log.actionType;
        const expanded = expandedId === log.id;

        return (
          <Card key={log.id}>
            <CardHeader className="gap-2 py-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{label}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {ids.length} 个资产
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(log.performedAt)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              {log.snapshotSummary && (
                <p className="mb-2 text-sm text-muted-foreground">
                  {log.snapshotSummary}
                </p>
              )}
              <button
                type="button"
                className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                onClick={() => toggleExpand(log.id)}
              >
                {expanded ? "收起资产 ID" : "展开资产 ID"}
              </button>
              {expanded && (
                <div className="mt-2 rounded-md bg-muted p-2">
                  <p className="break-all font-mono text-xs text-muted-foreground">
                    {ids.join(", ")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
