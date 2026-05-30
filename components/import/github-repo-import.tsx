"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  previewGitHubRepoImportAction,
  importGitHubRepoAssetsAction,
} from "@/app/import/actions";
import type { ImportConflictStrategy } from "@/lib/constants";
import type { ValidationResult } from "@/lib/validation";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  AlertTriangle,
} from "lucide-react";

interface RepoFilePreview {
  filePath: string;
  fileName: string;
  content: string;
  contentHash: string;
  frontmatter: { title?: string } | null;
  validation: ValidationResult;
  sizeBytes: number;
}

interface RepoPreviewData {
  source: {
    owner: string;
    repo: string;
    ref: string;
    htmlUrl: string;
  };
  files: RepoFilePreview[];
  totalFiles: number;
  filteredOut: number;
  truncated: boolean;
}

interface ImportResult {
  imported: { filePath: string; assetId: string }[];
  errors: { filePath: string; error: string }[];
}

function validationBadge(validation: ValidationResult) {
  if (validation.summary.errorCount > 0) {
    return (
      <Badge variant="destructive" className="text-xs">
        {validation.summary.errorCount} 错误
      </Badge>
    );
  }
  if (validation.summary.warningCount > 0) {
    return (
      <Badge variant="outline" className="text-xs">
        {validation.summary.warningCount} 警告
      </Badge>
    );
  }
  return (
    <Badge className="bg-green-600 text-xs">通过</Badge>
  );
}

export function GitHubRepoImport() {
  const [url, setUrl] = useState("");
  const [ref, setRef] = useState("main");
  const [pathFilter, setPathFilter] = useState("");
  const [preview, setPreview] = useState<RepoPreviewData | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  async function handlePreview() {
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);
    setPreview(null);
    setSelectedFiles(new Set());
    setImportResult(null);

    const result = await previewGitHubRepoImportAction(url, ref, pathFilter);

    if (!result.success) {
      setError(result.error ?? "预览失败");
      setIsLoading(false);
      return;
    }

    const data = result.data as RepoPreviewData;
    setPreview(data);
    setSelectedFiles(new Set(data.files.map((f) => f.filePath)));
    setIsLoading(false);
  }

  function toggleFile(filePath: string) {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }
      return next;
    });
  }

  function selectAll() {
    if (!preview) return;
    setSelectedFiles(new Set(preview.files.map((f) => f.filePath)));
  }

  function deselectAll() {
    setSelectedFiles(new Set());
  }

  async function handleImport() {
    if (!preview || selectedFiles.size === 0) return;

    setIsImporting(true);
    setError(null);

    const strategy: ImportConflictStrategy = "copy";
    const result = await importGitHubRepoAssetsAction(
      url,
      ref,
      Array.from(selectedFiles),
      strategy,
    );

    if (!result.success) {
      setError(result.error ?? "导入失败");
      setIsImporting(false);
      return;
    }

    setImportResult(result.data as ImportResult);
    setIsImporting(false);
  }

  function handleReset() {
    setUrl("");
    setRef("main");
    setPathFilter("");
    setPreview(null);
    setSelectedFiles(new Set());
    setError(null);
    setImportResult(null);
  }

  if (importResult) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-green-500/50 bg-green-500/10 p-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            <div className="text-sm">
              <p className="font-medium text-green-600">
                导入完成：{importResult.imported.length} 成功
                {importResult.errors.length > 0 &&
                  `，${importResult.errors.length} 失败`}
              </p>
            </div>
          </div>
        </div>

        {importResult.errors.length > 0 && (
          <div className="max-h-[200px] overflow-y-auto rounded-md border">
            {importResult.errors.map((e, i) => (
              <div
                key={`${e.filePath}-${i}`}
                className="flex items-center gap-2 border-b px-3 py-2 last:border-b-0"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                <span className="truncate text-sm">{e.filePath}</span>
                <span className="ml-auto text-xs text-destructive">{e.error}</span>
              </div>
            ))}
          </div>
        )}

        <Button variant="outline" onClick={handleReset}>
          继续导入
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <Label htmlFor="repo-url">GitHub 仓库 URL</Label>
          <Input
            id="repo-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="repo-ref">分支 / Tag</Label>
            <Input
              id="repo-ref"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="main"
            />
          </div>
          <div>
            <Label htmlFor="repo-path-filter">路径过滤</Label>
            <Input
              id="repo-path-filter"
              value={pathFilter}
              onChange={(e) => setPathFilter(e.target.value)}
              placeholder="skills/**/*.md"
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          从公开 GitHub 仓库的 zip 压缩包中扫描 .md 文件，支持路径 glob 过滤。最多预览 50 个文件，单文件上限 1MB，压缩包上限 10MB。
        </p>
      </div>

      <div className="flex gap-2">
        <Button onClick={handlePreview} disabled={!url.trim() || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              抓取中...
            </>
          ) : (
            "抓取预览"
          )}
        </Button>
        {preview && (
          <Button variant="outline" onClick={handleReset}>
            重置
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {preview && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium">{preview.source.owner}/{preview.source.repo}</span>
              <span className="text-muted-foreground"> @ {preview.source.ref}</span>
              <span className="ml-2 text-muted-foreground">
                （共 {preview.totalFiles} 个 .md 文件
                {preview.filteredOut > 0 && `，${preview.filteredOut} 个被过滤`}
                {preview.truncated && "，已截断至 50 个"}
                {"）"}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                全选
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                全不选
              </Button>
            </div>
          </div>

          {preview.truncated && (
            <div className="flex items-center gap-2 rounded-md border border-yellow-500/50 bg-yellow-500/10 p-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-600" />
              <p className="text-sm text-yellow-700">
                文件数超过 50 个上限，仅显示前 50 个。可使用路径过滤缩小范围。
              </p>
            </div>
          )}

          <div className="max-h-[400px] overflow-y-auto rounded-md border">
            {preview.files.map((file) => (
              <Card key={file.filePath} className="rounded-none border-0 border-b last:border-b-0">
                <CardContent className="flex items-center gap-3 px-3 py-2">
                  <Checkbox
                    checked={selectedFiles.has(file.filePath)}
                    onCheckedChange={() => toggleFile(file.filePath)}
                  />
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{file.filePath}</div>
                    {file.frontmatter?.title && (
                      <div className="truncate text-xs text-muted-foreground">
                        {file.frontmatter.title}
                      </div>
                    )}
                  </div>
                  {validationBadge(file.validation)}
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            onClick={handleImport}
            disabled={selectedFiles.size === 0 || isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                导入中...
              </>
            ) : (
              `确认导入（${selectedFiles.size} 个文件）`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
