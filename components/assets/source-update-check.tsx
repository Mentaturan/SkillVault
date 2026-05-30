"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { checkSourceUpdateAction } from "@/app/assets/[id]/actions";

interface SourceUpdateCheckProps {
  assetId: string;
  sourceUrl: string;
  sourceChecksum: string;
}

export function SourceUpdateCheck({
  assetId,
  sourceUrl,
}: SourceUpdateCheckProps) {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{
    hasUpdate: boolean;
    remoteChecksum: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheck() {
    setChecking(true);
    setError(null);
    setResult(null);

    const res = await checkSourceUpdateAction(assetId);

    if (!res.success) {
      setError(res.error ?? "检查失败");
    } else if (res.data) {
      setResult(res.data);
    }

    setChecking(false);
  }

  const isGitHubSource =
    sourceUrl?.includes("github.com") && sourceUrl?.includes("/blob/");

  if (!isGitHubSource) {
    return (
      <p className="text-xs text-muted-foreground mt-1">
        仅支持 GitHub 来源的更新检查
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCheck}
        disabled={checking}
      >
        <RefreshCw
          className={`mr-2 h-3.5 w-3.5 ${checking ? "animate-spin" : ""}`}
        />
        {checking ? "检查中..." : "检查来源更新"}
      </Button>

      {result && !result.hasUpdate && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <span>来源无变化</span>
        </div>
      )}

      {result && result.hasUpdate && (
        <div className="flex items-start gap-2 rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
          <div className="text-sm">
            <p className="font-medium text-yellow-600">来源已更新</p>
            <p className="text-muted-foreground">
              远端内容已变化，可重新导入覆盖当前版本
            </p>
            <a
              href={`/import?github=${encodeURIComponent(sourceUrl)}`}
              className="text-primary underline text-sm"
            >
              前往重新导入
            </a>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
