"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ImportConflictStrategy } from "@/lib/constants";
import { Copy, X, RefreshCw } from "lucide-react";

interface ConflictResolverProps {
  conflictAssetTitle: string | null;
  onResolve: (strategy: ImportConflictStrategy) => void;
  isLoading: boolean;
}

export function ConflictResolver({
  conflictAssetTitle,
  onResolve,
  isLoading,
}: ConflictResolverProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">冲突处理</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          导入文件的 syncId 与已有资产
          {conflictAssetTitle && (
            <span className="font-medium text-foreground">
              「{conflictAssetTitle}」
            </span>
          )}
          冲突，请选择处理方式：
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onResolve("overwrite")}
            disabled={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            覆盖已有
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onResolve("copy")}
            disabled={isLoading}
          >
            <Copy className="mr-2 h-4 w-4" />
            创建副本
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onResolve("cancel")}
            disabled={isLoading}
          >
            <X className="mr-2 h-4 w-4" />
            取消导入
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
