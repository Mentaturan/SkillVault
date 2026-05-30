import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CaptureImportFileSnapshot } from "@/server/services/capture-import-source-service";

interface CodexRolloutScanPreviewProps {
  directoryPath: string;
  summary: {
    total: number;
    changed: number;
    new: number;
    unchanged: number;
  };
  files: CaptureImportFileSnapshot[];
}

function formatTimestamp(timestamp: number | null) {
  if (!timestamp) {
    return "未导入";
  }

  return new Date(timestamp).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadge(status: CaptureImportFileSnapshot["status"]) {
  switch (status) {
    case "changed":
      return <Badge variant="destructive">已变更</Badge>;
    case "new":
      return <Badge variant="secondary">新文件</Badge>;
    default:
      return <Badge variant="outline">未变化</Badge>;
  }
}

export function CodexRolloutScanPreview({
  directoryPath,
  summary,
  files,
}: CodexRolloutScanPreviewProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">扫描结果</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{summary.total} 个文件</Badge>
              {summary.changed > 0 ? (
                <Badge variant="destructive">{summary.changed} 个已变更</Badge>
              ) : null}
              {summary.new > 0 ? (
                <Badge variant="secondary">{summary.new} 个新文件</Badge>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <p className="text-muted-foreground">目录路径</p>
            <p className="break-all font-mono text-xs">{directoryPath}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            changed-file detection 依据上一次成功导入时记录的文件修改时间和大小。
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {files.map((file) => (
          <Card key={file.filePath}>
            <CardHeader className="gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-sm">{file.filePath.split("/").pop()}</CardTitle>
                {statusBadge(file.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="break-all font-mono">{file.filePath}</p>
                <p>文件修改时间：{formatTimestamp(file.fileModifiedAt)}</p>
                <p>上次导入：{formatTimestamp(file.lastImportedAt)}</p>
                <p>文件大小：{file.fileSize} bytes</p>
              </div>

              <Link
                href={`/inbox/import/codex?path=${encodeURIComponent(file.filePath)}`}
                className="text-sm text-primary hover:underline"
              >
                进入导入预览
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
