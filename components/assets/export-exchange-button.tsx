"use client";

import { useState } from "react";
import { Package } from "lucide-react";

import { exportExchangeBundleAction } from "@/app/assets/[id]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ExportExchangeButtonProps {
  assetId: string;
}

export function ExportExchangeButton({ assetId }: ExportExchangeButtonProps) {
  const [open, setOpen] = useState(false);
  const [outputDir, setOutputDir] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    filePaths?: string[];
    error?: string;
  } | null>(null);

  async function handleExport() {
    if (!outputDir.trim()) return;

    setIsExporting(true);
    setResult(null);

    const response = await exportExchangeBundleAction(assetId, outputDir.trim());

    if (response.success && response.result) {
      setResult({ success: true, filePaths: response.result.filePaths });
    } else {
      setResult({
        success: false,
        error:
          typeof response.error === "string"
            ? response.error
            : "导出失败",
      });
    }

    setIsExporting(false);
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Package className="h-4 w-4 mr-1" />
        导出交换包
      </Button>
    );
  }

  return (
    <div className="space-y-2 rounded-md border bg-muted p-3">
      <Label htmlFor="exchange-output-dir" className="text-sm">
        输出目录路径
      </Label>
      <Input
        id="exchange-output-dir"
        value={outputDir}
        onChange={(e) => setOutputDir(e.target.value)}
        placeholder="/absolute/path/to/output"
        className="h-8 text-sm"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleExport}
          disabled={!outputDir.trim() || isExporting}
        >
          {isExporting ? "导出中..." : "确认导出"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setOpen(false);
            setOutputDir("");
            setResult(null);
          }}
        >
          取消
        </Button>
      </div>
      {result?.success && result.filePaths && (
        <div className="rounded-md border border-green-500/50 bg-green-500/10 p-2 text-xs text-green-600">
          <p className="font-medium">导出成功</p>
          {result.filePaths.map((fp) => (
            <p key={fp} className="break-all">{fp}</p>
          ))}
        </div>
      )}
      {result?.error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">
          {typeof result.error === "string" ? result.error : "导出失败"}
        </div>
      )}
    </div>
  );
}
