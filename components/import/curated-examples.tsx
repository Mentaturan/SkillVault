"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { importCuratedExamplesAction, getCuratedExamplesAction } from "@/app/import/actions";
import type { CuratedExamplePreview } from "@/lib/curated/types";
import type { ImportConflictStrategy } from "@/lib/constants";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  ASSET_TYPE_LABELS,
  TARGET_TOOL_LABELS,
} from "@/lib/constants";

interface CuratedExamplesProps {
  onImportComplete?: () => void;
}

export function CuratedExamples({ onImportComplete }: CuratedExamplesProps) {
  const [examples, setExamples] = useState<CuratedExamplePreview[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState<
    { filename: string; success: boolean; assetId?: string; error?: string }[]
  >([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await getCuratedExamplesAction();
        if (res.success && res.data) {
          setExamples(res.data);
        }
      } catch {
        setExamples([]);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const toggleAll = () => {
    if (selected.size === examples.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(examples.map((e) => e.filename)));
    }
  };

  const toggleOne = (filename: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(filename)) {
        next.delete(filename);
      } else {
        next.add(filename);
      }
      return next;
    });
  };

  const handleImport = async () => {
    if (selected.size === 0) return;

    setIsImporting(true);
    setResults([]);

    const strategy: ImportConflictStrategy = "copy";
    const res = await importCuratedExamplesAction(
      Array.from(selected),
      strategy,
    );

    setResults(res);
    setIsImporting(false);
    onImportComplete?.();
  };

  const successCount = results.filter((r) => r.success).length;
  const errorCount = results.filter((r) => !r.success).length;
  const importDone = results.length > 0;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        加载精选示例...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          从内置示例中选择资产导入，快速开始使用 SkillVault
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAll}
          disabled={isImporting || importDone}
        >
          {selected.size === examples.length ? (
            <>
              <Square className="mr-2 h-4 w-4" />
              全部取消
            </>
          ) : (
            <>
              <CheckSquare className="mr-2 h-4 w-4" />
              全选
            </>
          )}
        </Button>
      </div>

      <div className="space-y-2">
        {examples.map((example) => (
          <Card
            key={example.filename}
            className={`transition-colors ${
              selected.has(example.filename) ? "border-primary/50 bg-primary/5" : ""
            }`}
          >
            <CardContent className="flex items-start gap-3 py-3">
              <Checkbox
                checked={selected.has(example.filename)}
                onCheckedChange={() => toggleOne(example.filename)}
                disabled={isImporting || importDone}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{example.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {ASSET_TYPE_LABELS[example.type as keyof typeof ASSET_TYPE_LABELS] ?? example.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {TARGET_TOOL_LABELS[example.targetTool as keyof typeof TARGET_TOOL_LABELS] ?? example.targetTool}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {example.description}
                </p>
                {example.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {example.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selected.size > 0 && !importDone && (
        <Button onClick={handleImport} disabled={isImporting}>
          {isImporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              导入中...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              导入选中（{selected.size} 个）
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
                </p>
              </div>
            </div>
          </div>
          {results.some((r) => !r.success) && (
            <div className="space-y-1">
              {results
                .filter((r) => !r.success)
                .map((r) => (
                  <div
                    key={r.filename}
                    className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-2"
                  >
                    <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-destructive" />
                    <p className="text-xs text-destructive">
                      {r.filename}：{r.error}
                    </p>
                  </div>
                ))}
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => {
              setSelected(new Set());
              setResults([]);
            }}
          >
            继续导入
          </Button>
        </div>
      )}
    </div>
  );
}
