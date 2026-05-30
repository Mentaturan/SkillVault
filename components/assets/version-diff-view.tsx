import type { DiffLine } from "@/lib/version-diff";

function rowClassName(type: DiffLine["type"]) {
  switch (type) {
    case "added":
      return "bg-emerald-500/10";
    case "removed":
      return "bg-destructive/10";
    default:
      return "";
  }
}

export function VersionDiffView({ lines }: { lines: DiffLine[] }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="grid grid-cols-[72px_72px_minmax(0,1fr)] border-b bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
        <span>旧行号</span>
        <span>新行号</span>
        <span>内容</span>
      </div>
      <div className="max-h-[70vh] overflow-auto">
        {lines.map((line, index) => (
          <div
            key={`${index}-${line.type}-${line.oldLineNumber ?? "n"}-${line.newLineNumber ?? "n"}`}
            className={`grid grid-cols-[72px_72px_minmax(0,1fr)] px-4 py-1.5 font-mono text-sm ${rowClassName(line.type)}`}
          >
            <span className="pr-3 text-xs text-muted-foreground">
              {line.oldLineNumber ?? ""}
            </span>
            <span className="pr-3 text-xs text-muted-foreground">
              {line.newLineNumber ?? ""}
            </span>
            <pre className="overflow-x-auto whitespace-pre-wrap break-words">
              <span className="mr-2 select-none text-muted-foreground">
                {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
              </span>
              {line.text}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
