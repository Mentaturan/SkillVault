"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDiagnosticsAction } from "@/app/settings/actions";

type DiagnosticsResult = Awaited<ReturnType<typeof getDiagnosticsAction>>;
type Diagnostics = Extract<DiagnosticsResult, { success: true }>["data"];

function formatTimestamp(timestamp: number | null | undefined) {
  if (!timestamp) {
    return "未记录";
  }

  return new Date(timestamp).toLocaleString("zh-CN", {
    hour12: false,
  });
}

export function DiagnosticsPanel() {
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);

  useEffect(() => {
    getDiagnosticsAction().then((result) => {
      if (result.success) setDiagnostics(result.data);
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>诊断信息</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {diagnostics ? (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">数据库路径</span>
              <span className="max-w-[60%] break-all text-right font-mono text-xs">
                {diagnostics.databasePath}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">迁移标记</span>
              <span>{diagnostics.migrationState.latestTag}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">迁移数量</span>
              <span>{diagnostics.migrationState.totalMigrations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">完整性检查</span>
              <span>{diagnostics.integrity.ok ? "正常" : "异常"}</span>
            </div>
            {!diagnostics.integrity.ok ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                {diagnostics.integrity.messages.join("；")}
              </div>
            ) : null}
            <div className="flex justify-between">
              <span className="text-muted-foreground">上次备份</span>
              <span>{formatTimestamp(diagnostics.lastBackup?.lastBackupAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">资产总数</span>
              <span>{diagnostics.counts.assets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">未删除资产</span>
              <span>{diagnostics.counts.liveAssets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">已软删除资产</span>
              <span>{diagnostics.counts.deletedAssets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">标签总数</span>
              <span>{diagnostics.counts.tags}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">版本总数</span>
              <span>{diagnostics.counts.versions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">集合总数</span>
              <span>{diagnostics.counts.collections}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">项目总数</span>
              <span>{diagnostics.counts.projects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">测试记录总数</span>
              <span>{diagnostics.counts.testCases}</span>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">加载中...</p>
        )}
      </CardContent>
    </Card>
  );
}
