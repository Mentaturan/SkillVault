import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClaudeCodeJsonlPreviewCandidate } from "@/server/services/claude-code-jsonl-import-service";

interface ClaudeCodeJsonlImportPreviewProps {
  sessionId: string;
  sessionStartedAt: number | null;
  cwd: string | null;
  sourcePath: string;
  candidates: ClaudeCodeJsonlPreviewCandidate[];
}

function formatTimestamp(timestamp: number | null) {
  if (!timestamp) {
    return "未知";
  }

  return new Date(timestamp).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ClaudeCodeJsonlImportPreview({
  sessionId,
  sessionStartedAt,
  cwd,
  sourcePath,
  candidates,
}: ClaudeCodeJsonlImportPreviewProps) {
  const duplicateCount = candidates.filter((candidate) => candidate.isDuplicate).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">导入预览</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{candidates.length} 条候选</Badge>
              {duplicateCount > 0 ? (
                <Badge variant="outline">{duplicateCount} 条重复</Badge>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Session ID</p>
            <p className="font-mono text-xs">{sessionId}</p>
          </div>
          <div>
            <p className="text-muted-foreground">开始时间</p>
            <p>{formatTimestamp(sessionStartedAt)}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-muted-foreground">文件路径</p>
            <p className="break-all font-mono text-xs">{sourcePath}</p>
          </div>
          {cwd ? (
            <div className="sm:col-span-2">
              <p className="text-muted-foreground">Workspace</p>
              <p className="break-all font-mono text-xs">{cwd}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {candidates.map((candidate) => (
          <Card key={candidate.candidateKey}>
            <CardHeader className="gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-sm">{candidate.title}</CardTitle>
                <Badge variant="secondary">{candidate.role}</Badge>
                {candidate.isDuplicate ? (
                  <Badge variant="outline">已存在</Badge>
                ) : (
                  <Badge variant="secondary">新候选</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                来源时间：{formatTimestamp(candidate.sourceTimestamp)}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
                {candidate.rawContent}
              </pre>
              <p className="text-xs text-muted-foreground">
                {candidate.extractionNote}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
