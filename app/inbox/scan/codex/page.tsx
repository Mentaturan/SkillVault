"use client";

import Link from "next/link";
import { useState } from "react";

import { scanCodexRolloutDirectoryAction } from "@/app/inbox/scan/codex/actions";
import { CodexRolloutScanPreview } from "@/components/inbox/codex-rollout-scan-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CaptureImportFileSnapshot } from "@/server/services/capture-import-source-service";

type FieldErrors = Record<string, string[] | undefined>;

interface ScanResult {
  directoryPath: string;
  files: CaptureImportFileSnapshot[];
  summary: {
    total: number;
    changed: number;
    new: number;
    unchanged: number;
  };
}

export default function CodexRolloutScanPage() {
  const [directoryPath, setDirectoryPath] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  function fieldError(name: string) {
    return fieldErrors[name]?.[0];
  }

  async function handleScan() {
    if (!directoryPath.trim()) {
      return;
    }

    setIsScanning(true);
    setFieldErrors({});
    setError(null);
    setResult(null);

    try {
      const response = await scanCodexRolloutDirectoryAction(directoryPath.trim());
      if (response.success && response.result) {
        setResult(response.result);
        return;
      }

      if (response.error && typeof response.error === "object") {
        setFieldErrors(response.error as FieldErrors);
        setError("请检查目录路径");
        return;
      }

      setError(typeof response.error === "string" ? response.error : "扫描失败");
    } finally {
      setIsScanning(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">扫描 Codex Rollout 目录</h1>
          <p className="text-sm text-muted-foreground">
            递归扫描本地 rollout `.jsonl` 文件，并标出哪些文件是新文件、哪些已经变更。
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

        <div className="space-y-2">
          <Label htmlFor="directoryPath">目录路径</Label>
          <Input
            id="directoryPath"
            value={directoryPath}
            onChange={(event) => setDirectoryPath(event.target.value)}
            placeholder="/absolute/path/to/codex/sessions"
            aria-invalid={!!fieldError("directoryPath")}
          />
          {fieldError("directoryPath") ? (
            <p className="text-sm text-destructive">{fieldError("directoryPath")}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              扫描只做 preview，不会自动把任何文件导入 inbox。
            </p>
          )}
        </div>

        <Button
          type="button"
          onClick={handleScan}
          disabled={!directoryPath.trim() || isScanning}
        >
          {isScanning ? "扫描中..." : "扫描目录"}
        </Button>
      </div>

      {result ? <CodexRolloutScanPreview {...result} /> : null}
    </div>
  );
}
