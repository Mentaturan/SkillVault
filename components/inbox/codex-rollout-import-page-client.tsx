"use client";

import Link from "next/link";
import { useState } from "react";

import { CodexRolloutImportPreview } from "@/components/inbox/codex-rollout-import-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  importCodexRolloutAction,
  previewCodexRolloutImportAction,
} from "@/app/inbox/import/codex/actions";
import type { CodexRolloutImportResult } from "@/server/services/capture-import-service";

type FieldErrors = Record<string, string[] | undefined>;
type PreviewData = CodexRolloutImportResult["preview"];

export function CodexRolloutImportPageClient({
  initialSourcePath = "",
}: {
  initialSourcePath?: string;
}) {
  const [sourcePath, setSourcePath] = useState(initialSourcePath);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  function fieldError(name: string) {
    return fieldErrors[name]?.[0];
  }

  async function handlePreview() {
    if (!sourcePath.trim()) {
      return;
    }

    setIsParsing(true);
    setFieldErrors({});
    setError(null);
    setPreview(null);
    setResultMessage(null);

    try {
      const result = await previewCodexRolloutImportAction(sourcePath.trim());
      if (result.success && result.preview) {
        setPreview(result.preview);
        return;
      }

      if (result.error && typeof result.error === "object") {
        setFieldErrors(result.error as FieldErrors);
        setError("请检查路径输入");
        return;
      }

      setError(typeof result.error === "string" ? result.error : "预览失败");
    } finally {
      setIsParsing(false);
    }
  }

  async function handleImport() {
    if (!preview) {
      return;
    }

    setIsImporting(true);
    setFieldErrors({});
    setError(null);
    setResultMessage(null);

    try {
      const result = await importCodexRolloutAction(preview.sourcePath);
      if (result.success && result.result) {
        setResultMessage(
          `已导入 ${result.result.importedCount} 条候选，跳过 ${result.result.skippedDuplicateCount} 条重复项。`,
        );
        setPreview(result.result.preview);
        return;
      }

      if (result.error && typeof result.error === "object") {
        setFieldErrors(result.error as FieldErrors);
        setError("请检查路径输入");
        return;
      }

      setError(typeof result.error === "string" ? result.error : "导入失败");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">导入 Codex Rollout</h1>
          <p className="text-sm text-muted-foreground">
            从本地 `.jsonl` rollout 文件提取用户消息和较长的助手输出，再导入到 capture inbox。
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/inbox">返回 Inbox</Link>
        </Button>
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-6 shadow">
        {error ? (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        {resultMessage ? (
          <div className="rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-700">
            {resultMessage}
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="sourcePath">Rollout 文件路径</Label>
          <Input
            id="sourcePath"
            value={sourcePath}
            onChange={(event) => setSourcePath(event.target.value)}
            placeholder="/absolute/path/to/rollout-xxxx.jsonl"
            aria-invalid={!!fieldError("sourcePath")}
          />
          {fieldError("sourcePath") ? (
            <p className="text-sm text-destructive">{fieldError("sourcePath")}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              当前只支持单个本地 Codex rollout `.jsonl` 文件。
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handlePreview}
            disabled={!sourcePath.trim() || isParsing}
          >
            {isParsing ? "预览中..." : "提取预览"}
          </Button>
          {preview ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleImport}
              disabled={isImporting}
            >
              {isImporting ? "导入中..." : "确认导入到 Inbox"}
            </Button>
          ) : null}
          <Button asChild variant="ghost">
            <Link href="/inbox/scan/codex">改为扫描目录</Link>
          </Button>
        </div>
      </div>

      {preview ? <CodexRolloutImportPreview {...preview} /> : null}
    </div>
  );
}
