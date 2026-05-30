"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { batchImportAction } from "@/app/import/actions";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, FolderOpen } from "lucide-react";

type FileStatus = "pending" | "parsed" | "importing" | "success" | "error";

interface FileEntry {
  name: string;
  content: string;
  title: string | null;
  status: FileStatus;
  error: string | null;
  assetId: string | null;
}

interface FolderImportProps {
  onImportComplete?: () => void;
}

export function FolderImport({ onImportComplete }: FolderImportProps) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusIcon = (status: FileStatus) => {
    switch (status) {
      case "importing":
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const statusBadge = (status: FileStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">待导入</Badge>;
      case "parsed":
        return <Badge variant="secondary">已解析</Badge>;
      case "importing":
        return <Badge variant="outline">导入中</Badge>;
      case "success":
        return <Badge className="bg-green-600">成功</Badge>;
      case "error":
        return <Badge variant="destructive">失败</Badge>;
    }
  };

  const extractTitle = (content: string): string | null => {
    const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!match) return null;
    const titleMatch = match[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
    return titleMatch ? titleMatch[1].trim() : null;
  };

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setIsReading(true);
    setImportDone(false);

    const mdFiles = Array.from(fileList).filter(
      (f) => f.name.endsWith(".md") || f.name.endsWith(".markdown")
    );

    if (mdFiles.length === 0) {
      setIsReading(false);
      return;
    }

    const entries = await Promise.all(
      mdFiles.map(
        (file) =>
          new Promise<FileEntry>((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              const content = event.target?.result as string;
              resolve({
                name: file.name,
                content,
                title: extractTitle(content),
                status: "parsed",
                error: null,
                assetId: null,
              });
            };
            reader.onerror = () => {
              resolve({
                name: file.name,
                content: "",
                title: null,
                status: "error",
                error: "读取文件失败",
                assetId: null,
              });
            };
            reader.readAsText(file);
          })
      )
    );

    setFiles(entries);
    setIsReading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleImport = async () => {
    const parsedFiles = files.filter((f) => f.status === "parsed");
    if (parsedFiles.length === 0) return;

    setIsImporting(true);

    setFiles((prev) =>
      prev.map((f) => (f.status === "parsed" ? { ...f, status: "importing" as FileStatus } : f))
    );

    const items = parsedFiles.map((f) => ({
      filename: f.name,
      markdown: f.content,
    }));

    const result = await batchImportAction(items);

    if ("success" in result && !result.success) {
      setFiles((prev) =>
        prev.map((f) =>
          f.status === "importing"
            ? { ...f, status: "error" as FileStatus, error: result.error }
            : f
        )
      );
    } else {
      const results = result as { filename: string; success: boolean; assetId?: string; error?: string }[];
      setFiles((prev) =>
        prev.map((f) => {
          if (f.status !== "importing") return f;
          const r = results.find((rr) => rr.filename === f.name);
          if (!r) return f;
          if (r.success) {
            return { ...f, status: "success" as FileStatus, assetId: r.assetId ?? null };
          }
          return { ...f, status: "error" as FileStatus, error: r.error ?? "导入失败" };
        })
      );
    }

    setIsImporting(false);
    setImportDone(true);
    onImportComplete?.();
  };

  const handleReset = () => {
    setFiles([]);
    setImportDone(false);
  };

  const parsedCount = files.filter((f) => f.status === "parsed").length;
  const successCount = files.filter((f) => f.status === "success").length;
  const errorCount = files.filter((f) => f.status === "error").length;
  const skippedCount = files.filter((f) => f.status === "error" && f.error === "读取文件失败").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          选择包含 .md 文件的文件夹，或选择多个 .md 文件
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isReading || isImporting}
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            选择文件
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown"
            multiple
            {...{ webkitdirectory: "true", directory: "true" }}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {isReading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          正在读取文件...
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">
            已选择 {files.length} 个文件
            {parsedCount > 0 && `（${parsedCount} 个待导入）`}
          </div>
          <div className="max-h-[400px] overflow-y-auto rounded-md border">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 border-b px-3 py-2 last:border-b-0"
              >
                {statusIcon(file.status)}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{file.name}</div>
                  {file.title && (
                    <div className="truncate text-xs text-muted-foreground">
                      {file.title}
                    </div>
                  )}
                  {file.error && file.status === "error" && (
                    <div className="text-xs text-destructive">{file.error}</div>
                  )}
                </div>
                {statusBadge(file.status)}
              </div>
            ))}
          </div>
        </div>
      )}

      {parsedCount > 0 && !importDone && (
        <Button onClick={handleImport} disabled={isImporting}>
          {isImporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              导入中...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              批量导入（{parsedCount} 个文件）
            </>
          )}
        </Button>
      )}

      {importDone && (
        <div className="space-y-3">
          <div className="rounded-md border border-green-500/50 bg-green-500/10 p-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              <div className="text-sm">
                <p className="font-medium text-green-600">
                  导入完成：{successCount} 成功
                  {errorCount > 0 && `，${errorCount} 失败`}
                  {skippedCount > 0 && `，${skippedCount} 跳过`}
                </p>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={handleReset}>
            继续导入
          </Button>
        </div>
      )}
    </div>
  );
}
