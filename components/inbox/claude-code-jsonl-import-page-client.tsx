"use client";

import Link from "next/link";
import { useState } from "react";

import { ClaudeCodeJsonlImportPreview } from "@/components/inbox/claude-code-jsonl-import-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  importClaudeCodeJsonlAction,
  previewClaudeCodeJsonlImportAction,
} from "@/app/inbox/import/claude-code/actions";
import type { ClaudeCodeJsonlImportResult } from "@/server/services/claude-code-jsonl-import-service";

type FieldErrors = Record<string, string[] | undefined>;
type PreviewData = ClaudeCodeJsonlImportResult["preview"];

export function ClaudeCodeJsonlImportPageClient({
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
      const result = await previewClaudeCodeJsonlImportAction(sourcePath.trim());
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
      const result = await importClaudeCodeJsonlAction(preview.sourcePath);
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
          <h1 className="text-2xl font-semibold">导入 Claude Code 对话</h1>
          <p className="text-sm text-muted-foreground">
            从本地 `.jsonl` 对话文件提取用户消息和较长的助手输出，再导入到 capture inbox。
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
          <Label htmlFor="sourcePath">对话文件路径</Label>
          <Input
            id="sourcePath"
            value={sourcePath}
            onChange={(event) => setSourcePath(event.target.value)}
            placeholder="~/.claude/projects/xxx/conversations/yyy.jsonl"
            aria-invalid={!!fieldError("sourcePath")}
          />
          {fieldError("sourcePath") ? (
            <p className="text-sm text-destructive">{fieldError("sourcePath")}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              当前只支持单个本地 Claude Code `.jsonl` 对话文件。
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
            <Link href="/inbox/scan/claude-code">改为扫描目录</Link>
          </Button>
        </div>
      </div>

      {preview ? <ClaudeCodeJsonlImportPreview {...preview} /> : null}
    </div>
  );
}
