import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ValidationResult } from "@/lib/validation";

interface ValidationPanelProps {
  result: ValidationResult;
  title?: string;
}

export function ValidationPanel({
  result,
  title = "校验结果",
}: ValidationPanelProps) {
  const hasIssues =
    result.summary.errorCount > 0 || result.summary.warningCount > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {result.summary.errorCount > 0 ? (
              <Badge variant="destructive">
                {result.summary.errorCount} 个错误
              </Badge>
            ) : null}
            {result.summary.warningCount > 0 ? (
              <Badge variant="outline">
                {result.summary.warningCount} 个警告
              </Badge>
            ) : null}
            {!hasIssues ? <Badge variant="secondary">通过</Badge> : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {!hasIssues ? (
          <p className="text-sm text-muted-foreground">未发现确定性校验问题。</p>
        ) : (
          result.issues.map((issue) => (
            <div
              key={`${issue.severity}-${issue.code}-${issue.message}`}
              className={`rounded-md border p-3 text-sm ${
                issue.severity === "error"
                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                  : "border-yellow-500/40 bg-yellow-500/10 text-yellow-700"
              }`}
            >
              {issue.message}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
