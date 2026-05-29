"use client";

import { useState, type ChangeEvent } from "react";
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";

import { previewRestoreAction, restoreBackupAction } from "@/app/restore/actions";
import { RestorePreviewPanel } from "@/components/restore/restore-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RestorePreview } from "@/lib/backup";
import {
  RESTORE_CONFLICT_STRATEGIES,
  RESTORE_CONFLICT_STRATEGY_LABELS,
  type RestoreConflictStrategy,
} from "@/lib/constants";

export default function RestorePage() {
  const [bundleText, setBundleText] = useState("");
  const [strategy, setStrategy] = useState<RestoreConflictStrategy>("skip");
  const [preview, setPreview] = useState<RestorePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [result, setResult] = useState<{
    restoredAssets: number;
    skippedAssets: number;
    restoredCollections: number;
    restoredProjects: number;
  } | null>(null);

  async function handlePreview() {
    if (!bundleText.trim()) return;

    setIsPreviewing(true);
    setError(null);
    setPreview(null);
    setResult(null);

    const response = await previewRestoreAction(bundleText, strategy);
    if (!response.success) {
      setError(response.error ?? "恢复预览失败");
    } else if (response.preview) {
      setPreview(response.preview);
    }

    setIsPreviewing(false);
  }

  async function handleRestore() {
    if (!bundleText.trim()) return;

    setIsRestoring(true);
    setError(null);
    setResult(null);

    const response = await restoreBackupAction(bundleText, strategy);
    if (!response.success) {
      setError(response.error ?? "恢复失败");
    } else if (response.result) {
      setPreview(response.preview ?? null);
      setResult(response.result);
    }

    setIsRestoring(false);
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setBundleText(await file.text());
    setPreview(null);
    setResult(null);
    setError(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">恢复备份</h1>
        <p className="text-sm text-muted-foreground">
          先预览再执行恢复。checksum 异常或结构错误会阻止写入。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>输入备份 bundle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <Upload className="h-4 w-4" />
            选择 JSON 备份文件
            <input type="file" accept="application/json,.json" className="hidden" onChange={handleFileChange} />
          </label>

          <textarea
            value={bundleText}
            onChange={(event) => {
              setBundleText(event.target.value);
              setPreview(null);
              setResult(null);
              setError(null);
            }}
            placeholder="粘贴 skillvault-backup JSON bundle"
            className="min-h-[260px] w-full rounded-md border bg-background px-3 py-2 text-sm"
          />

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">冲突策略</p>
            <div className="flex flex-wrap gap-2">
              {RESTORE_CONFLICT_STRATEGIES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setStrategy(option);
                    setPreview(null);
                    setResult(null);
                  }}
                  className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                    strategy === option
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background hover:bg-muted"
                  }`}
                >
                  {RESTORE_CONFLICT_STRATEGY_LABELS[option]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handlePreview} disabled={!bundleText.trim() || isPreviewing}>
              {isPreviewing ? "预览中..." : "生成预览"}
            </Button>
            {preview ? (
              <Button
                variant="destructive"
                onClick={handleRestore}
                disabled={!preview.checksumValid || preview.errors.length > 0 || isRestoring}
              >
                {isRestoring ? "恢复中..." : "确认恢复"}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      {result ? (
        <div className="flex items-start gap-2 rounded-md border border-green-500/50 bg-green-500/10 p-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <div className="text-sm text-green-700">
            <p className="font-medium">恢复完成</p>
            <p>
              资产 {result.restoredAssets} 项，跳过 {result.skippedAssets} 项，集合 {result.restoredCollections} 个，项目 {result.restoredProjects} 个。
            </p>
          </div>
        </div>
      ) : null}

      {preview ? <RestorePreviewPanel preview={preview} /> : null}
    </div>
  );
}
