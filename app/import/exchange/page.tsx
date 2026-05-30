"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  previewExchangeImportAction,
  executeExchangeImportAction,
} from "@/app/import/exchange/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { ExchangeImportPreview } from "@/server/services/exchange-service";

type FieldErrors = Record<string, string[] | undefined>;

export default function ExchangeImportPage() {
  const router = useRouter();
  const [bundleDir, setBundleDir] = useState("");
  const [preview, setPreview] = useState<ExchangeImportPreview | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [strategy, setStrategy] = useState<"overwrite" | "copy" | "skip">("overwrite");
  const [importResult, setImportResult] = useState<{
    success: boolean;
    assetId?: string;
    action?: string;
    error?: string;
  } | null>(null);

  function fieldError(name: string) {
    return fieldErrors[name]?.[0];
  }

  async function handlePreview() {
    if (!bundleDir.trim()) return;

    setIsPreviewing(true);
    setFieldErrors({});
    setError(null);
    setPreview(null);
    setImportResult(null);

    try {
      const response = await previewExchangeImportAction(bundleDir.trim());
      if (response.success && response.result) {
        setPreview(response.result);
        return;
      }

      if (response.error && typeof response.error === "object") {
        setFieldErrors(response.error as FieldErrors);
        setError("请检查目录路径");
        return;
      }

      setError(typeof response.error === "string" ? response.error : "预览失败");
    } finally {
      setIsPreviewing(false);
    }
  }

  async function handleImport() {
    if (!bundleDir.trim() || !preview) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const response = await executeExchangeImportAction(
        bundleDir.trim(),
        strategy,
      );

      if (response.success && response.result) {
        setImportResult({
          success: true,
          assetId: response.result.assetId,
          action: response.result.action,
        });
        return;
      }

      setImportResult({
        success: false,
        error:
          typeof response.error === "string"
            ? response.error
            : "导入失败",
      });
    } finally {
      setIsImporting(false);
    }
  }

  function handleReset() {
    setBundleDir("");
    setPreview(null);
    setFieldErrors({});
    setError(null);
    setImportResult(null);
    setStrategy("overwrite");
  }

  const conflictLabel: Record<string, string> = {
    new: "新建",
    update: "更新",
    conflict: "冲突",
  };

  const conflictVariant: Record<string, "default" | "secondary" | "destructive"> = {
    new: "secondary",
    update: "default",
    conflict: "destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">导入交换包</h1>
          <p className="text-sm text-muted-foreground">
            从本地文件夹导入 Exchange Bundle（manifest.json + asset.md）
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/import">返回导入</Link>
        </Button>
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-6 shadow">
        {error ? (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="bundleDir">交换包目录路径</Label>
          <Input
            id="bundleDir"
            value={bundleDir}
            onChange={(event) => setBundleDir(event.target.value)}
            placeholder="/absolute/path/to/exchange-bundle"
            aria-invalid={!!fieldError("bundleDir")}
          />
          {fieldError("bundleDir") ? (
            <p className="text-sm text-destructive">{fieldError("bundleDir")}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              目录需包含 manifest.json 和 asset.md 文件
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handlePreview}
            disabled={!bundleDir.trim() || isPreviewing}
          >
            {isPreviewing ? "预览中..." : "预览"}
          </Button>
          {preview && (
            <Button variant="outline" onClick={handleReset}>
              重置
            </Button>
          )}
        </div>
      </div>

      {preview && !importResult ? (
        <div className="space-y-4">
          {!preview.valid ? (
            <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div className="text-sm text-destructive">
                <p className="font-medium">交换包无效</p>
                {preview.errors?.map((err, i) => (
                  <p key={i}>{err}</p>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-xl border bg-card p-6 shadow space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">Manifest 信息</h2>
                  <Badge variant={conflictVariant[preview.conflictStatus]}>
                    {conflictLabel[preview.conflictStatus]}
                  </Badge>
                </div>

                {preview.manifest && (
                  <dl className="grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">标题</dt>
                      <dd className="font-medium">{preview.manifest.asset.title}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">类型</dt>
                      <dd>{preview.manifest.asset.type}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">syncId</dt>
                      <dd className="font-mono text-xs break-all">{preview.manifest.asset.syncId}</dd>
                    </div>
                    {preview.manifest.asset.tags && preview.manifest.asset.tags.length > 0 && (
                      <div>
                        <dt className="text-muted-foreground">标签</dt>
                        <dd className="flex flex-wrap gap-1 mt-1">
                          {preview.manifest.asset.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                          ))}
                        </dd>
                      </div>
                    )}
                  </dl>
                )}

                {preview.existingAsset && (
                  <div className="rounded-md border bg-muted p-3 text-sm">
                    <p className="font-medium">已有资产</p>
                    <p>{preview.existingAsset.title}</p>
                    <p className="text-muted-foreground text-xs">
                      更新时间: {new Date(preview.existingAsset.updatedAt).toLocaleString("zh-CN")}
                    </p>
                  </div>
                )}
              </div>

              {preview.content && (
                <div className="rounded-xl border bg-card p-6 shadow space-y-2">
                  <h2 className="text-lg font-semibold">内容预览</h2>
                  <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm max-h-64 overflow-auto">
                    {preview.content.length > 500
                      ? preview.content.slice(0, 500) + "..."
                      : preview.content}
                  </pre>
                </div>
              )}

              {preview.supportFiles.length > 0 && (
                <div className="rounded-xl border bg-card p-6 shadow space-y-2">
                  <h2 className="text-lg font-semibold">支持文件</h2>
                  <ul className="space-y-1 text-sm">
                    {preview.supportFiles.map((sf) => (
                      <li key={sf.name} className="flex items-center justify-between">
                        <span>{sf.name}</span>
                        <span className="text-muted-foreground">
                          {sf.size > 1024
                            ? `${(sf.size / 1024).toFixed(1)} KB`
                            : `${sf.size} B`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {preview.conflictStatus === "conflict" && (
                <div className="rounded-xl border bg-card p-6 shadow space-y-3">
                  <h2 className="text-lg font-semibold">冲突解决策略</h2>
                  <div className="flex gap-2">
                    {(["overwrite", "copy", "skip"] as const).map((s) => (
                      <Button
                        key={s}
                        variant={strategy === s ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStrategy(s)}
                      >
                        {s === "overwrite" ? "覆盖" : s === "copy" ? "创建副本" : "跳过"}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleImport}
                disabled={isImporting}
              >
                {isImporting ? "导入中..." : "确认导入"}
              </Button>
            </>
          )}
        </div>
      ) : null}

      {importResult && (
        <div className="space-y-3">
          {importResult.success && importResult.assetId && (
            <div className="flex items-start gap-2 rounded-md border border-green-500/50 bg-green-500/10 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              <div className="text-sm">
                <p className="font-medium text-green-600">
                  导入成功（{importResult.action === "created" ? "新建" : importResult.action === "updated" ? "更新" : importResult.action === "skipped" ? "跳过" : importResult.action}）
                </p>
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm"
                  onClick={() => router.push(`/assets/${importResult.assetId}`)}
                >
                  查看资产
                </Button>
              </div>
            </div>
          )}
          {importResult.error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{importResult.error}</p>
            </div>
          )}
          <Button variant="outline" onClick={handleReset}>
            继续导入
          </Button>
        </div>
      )}
    </div>
  );
}
