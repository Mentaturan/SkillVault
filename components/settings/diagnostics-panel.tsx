"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDiagnosticsAction } from "@/app/settings/actions";

export function DiagnosticsPanel() {
  const [counts, setCounts] = useState<{ assets: number; tags: number; versions: number } | null>(null);

  useEffect(() => {
    getDiagnosticsAction().then(setCounts);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>诊断信息</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {counts ? (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">资产总数</span>
              <span>{counts.assets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">标签总数</span>
              <span>{counts.tags}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">版本总数</span>
              <span>{counts.versions}</span>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">加载中...</p>
        )}
      </CardContent>
    </Card>
  );
}
