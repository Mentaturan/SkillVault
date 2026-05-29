"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MarkdownInput } from "@/components/import/markdown-input";
import { ImportPreview } from "@/components/import/import-preview";
import { ConflictResolver } from "@/components/import/conflict-resolver";
import { parseMarkdownAction, importMarkdownAction } from "@/app/import/actions";
import type { MarkdownFrontmatter } from "@/lib/markdown";
import type { ImportConflictStrategy } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface PreviewData {
  frontmatter: MarkdownFrontmatter;
  content: string;
  hasConflict: boolean;
  conflictAssetId: string | null;
  conflictAssetTitle: string | null;
}

export default function ImportPage() {
  const router = useRouter();
  const [markdown, setMarkdown] = useState("");
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    assetId?: string;
    cancelled?: boolean;
    error?: string;
  } | null>(null);

  async function handleParse() {
    if (!markdown.trim()) return;

    setIsParsing(true);
    setParseError(null);
    setPreviewData(null);
    setImportResult(null);

    const result = await parseMarkdownAction(markdown);

    if (!result.success) {
      setParseError(result.error ?? "解析失败");
    } else if (result.data) {
      setPreviewData(result.data);
    }

    setIsParsing(false);
  }

  async function handleImport(strategy: ImportConflictStrategy) {
    if (!markdown.trim()) return;

    setIsImporting(true);
    setImportResult(null);

    const result = await importMarkdownAction(markdown, strategy);

    setImportResult({
      success: result.success,
      assetId: "assetId" in result ? result.assetId : undefined,
      cancelled: "cancelled" in result ? result.cancelled : undefined,
      error: !result.success && "error" in result ? result.error : undefined,
    });

    setIsImporting(false);
  }

  function handleReset() {
    setMarkdown("");
    setPreviewData(null);
    setParseError(null);
    setImportResult(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">导入 Markdown</h1>
        <p className="text-sm text-muted-foreground">
          从 Markdown 文件导入资产，支持 YAML frontmatter
        </p>
      </div>

      <MarkdownInput onMarkdownChange={setMarkdown} />

      <div className="flex gap-2">
        <Button onClick={handleParse} disabled={!markdown.trim() || isParsing}>
          {isParsing ? "解析中..." : "解析预览"}
        </Button>
        {previewData && (
          <Button variant="outline" onClick={handleReset}>
            重置
          </Button>
        )}
      </div>

      {parseError && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{parseError}</p>
        </div>
      )}

      {previewData && !importResult && (
        <>
          <ImportPreview
            frontmatter={previewData.frontmatter}
            content={previewData.content}
            hasConflict={previewData.hasConflict}
            conflictAssetTitle={previewData.conflictAssetTitle}
          />

          {previewData.hasConflict ? (
            <ConflictResolver
              conflictAssetTitle={previewData.conflictAssetTitle}
              onResolve={handleImport}
              isLoading={isImporting}
            />
          ) : (
            <Button
              onClick={() => handleImport("overwrite")}
              disabled={isImporting}
            >
              {isImporting ? "导入中..." : "确认导入"}
            </Button>
          )}
        </>
      )}

      {importResult && (
        <div className="space-y-3">
          {importResult.success && importResult.cancelled && (
            <div className="flex items-start gap-2 rounded-md border bg-muted p-3">
              <p className="text-sm">已取消导入</p>
            </div>
          )}
          {importResult.success && !importResult.cancelled && importResult.assetId && (
            <div className="flex items-start gap-2 rounded-md border border-green-500/50 bg-green-500/10 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              <div className="text-sm">
                <p className="font-medium text-green-600">导入成功</p>
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
