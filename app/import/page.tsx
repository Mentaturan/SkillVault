"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MarkdownInput } from "@/components/import/markdown-input";
import { ImportPreview } from "@/components/import/import-preview";
import { ConflictResolver } from "@/components/import/conflict-resolver";
import { FolderImport } from "@/components/import/folder-import";
import { GitHubRepoImport } from "@/components/import/github-repo-import";
import { CuratedExamples } from "@/components/import/curated-examples";
import {
  importGitHubAction,
  importMarkdownAction,
  parseMarkdownAction,
  previewGitHubImportAction,
} from "@/app/import/actions";
import type { MarkdownFrontmatter } from "@/lib/markdown";
import type { ImportConflictStrategy } from "@/lib/constants";
import type { ValidationResult } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface PreviewData {
  frontmatter: MarkdownFrontmatter;
  content: string;
  hasConflict: boolean;
  conflictAssetId: string | null;
  conflictAssetTitle: string | null;
  hasContentDuplicate: boolean;
  contentDuplicateAssetTitle: string | null;
  validation: ValidationResult;
}

type ImportTab = "single" | "github" | "github_repo" | "curated" | "batch";
type ImportSourceKind = "markdown" | "github";

interface GitHubPreviewSource {
  htmlUrl: string;
  rawUrl: string;
  ref: string;
  path: string;
  checksum: string;
}

export default function ImportPage() {
  const router = useRouter();
  const [tab, setTab] = useState<ImportTab>("single");
  const [sourceKind, setSourceKind] = useState<ImportSourceKind>("markdown");
  const [markdown, setMarkdown] = useState("");
  const [githubUrl, setGitHubUrl] = useState("");
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [githubSource, setGitHubSource] = useState<GitHubPreviewSource | null>(null);
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
    setGitHubSource(null);
    setImportResult(null);
    setSourceKind("markdown");

    const result = await parseMarkdownAction(markdown);

    if (!result.success) {
      setParseError(result.error ?? "解析失败");
    } else if (result.data) {
      setPreviewData(result.data);
    }

    setIsParsing(false);
  }

  async function handleGitHubPreview() {
    if (!githubUrl.trim()) return;

    setIsParsing(true);
    setParseError(null);
    setPreviewData(null);
    setGitHubSource(null);
    setImportResult(null);
    setSourceKind("github");

    const result = await previewGitHubImportAction(githubUrl);

    if (!result.success) {
      setParseError(result.error ?? "GitHub 文件预览失败");
    } else if (result.data && "preview" in result.data && "source" in result.data) {
      setPreviewData(result.data.preview);
      setGitHubSource(result.data.source);
    }

    setIsParsing(false);
  }

  async function handleImport(strategy: ImportConflictStrategy) {
    if (sourceKind === "markdown" && !markdown.trim()) return;
    if (sourceKind === "github" && (!githubUrl.trim() || !githubSource)) return;

    setIsImporting(true);
    setImportResult(null);

    const result =
      sourceKind === "github" && githubSource
        ? await importGitHubAction(githubUrl, githubSource.checksum, strategy)
        : await importMarkdownAction(markdown, strategy);

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
    setGitHubUrl("");
    setPreviewData(null);
    setGitHubSource(null);
    setParseError(null);
    setImportResult(null);
    setSourceKind("markdown");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">导入 Markdown</h1>
        <p className="text-sm text-muted-foreground">
          从 Markdown 文件导入资产，支持 YAML frontmatter
        </p>
      </div>

      <div className="inline-flex rounded-md border">
        <button
          type="button"
          onClick={() => setTab("single")}
          className={`px-4 py-1.5 text-sm transition-colors ${
            tab === "single"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-foreground hover:bg-muted"
          } rounded-l-md`}
        >
          单文件导入
        </button>
        <button
          type="button"
          onClick={() => setTab("github")}
          className={`px-4 py-1.5 text-sm transition-colors ${
            tab === "github"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-foreground hover:bg-muted"
          }`}
        >
          GitHub 文件导入
        </button>
        <button
          type="button"
          onClick={() => setTab("github_repo")}
          className={`px-4 py-1.5 text-sm transition-colors ${
            tab === "github_repo"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-foreground hover:bg-muted"
          }`}
        >
          GitHub 仓库导入
        </button>
        <button
          type="button"
          onClick={() => setTab("curated")}
          className={`px-4 py-1.5 text-sm transition-colors ${
            tab === "curated"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-foreground hover:bg-muted"
          }`}
        >
          精选示例
        </button>
        <button
          type="button"
          onClick={() => setTab("batch")}
          className={`px-4 py-1.5 text-sm transition-colors ${
            tab === "batch"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-foreground hover:bg-muted"
          } rounded-r-md`}
        >
          批量导入
        </button>
      </div>

      {tab === "single" ? (
        <>
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
                hasContentDuplicate={previewData.hasContentDuplicate}
                contentDuplicateAssetTitle={previewData.contentDuplicateAssetTitle}
                validation={previewData.validation}
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
        </>
      ) : tab === "github" ? (
        <>
          <div className="space-y-3">
            <Label htmlFor="github-url">GitHub 文件 URL</Label>
            <Input
              id="github-url"
              value={githubUrl}
              onChange={(event) => setGitHubUrl(event.target.value)}
              placeholder="https://github.com/owner/repo/blob/main/path/to/file.md"
            />
            <p className="text-sm text-muted-foreground">
              只支持公开 GitHub Markdown 文件。会先抓取远端内容做预览和校验，导入时会再次核对 checksum。
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleGitHubPreview}
              disabled={!githubUrl.trim() || isParsing}
            >
              {isParsing ? "抓取中..." : "抓取预览"}
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
                hasContentDuplicate={previewData.hasContentDuplicate}
                contentDuplicateAssetTitle={previewData.contentDuplicateAssetTitle}
                validation={previewData.validation}
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
        </>
      ) : tab === "github_repo" ? (
        <GitHubRepoImport />
      ) : tab === "curated" ? (
        <CuratedExamples onImportComplete={() => router.refresh()} />
      ) : (
        <FolderImport onImportComplete={() => router.refresh()} />
      )}
    </div>
  );
}
