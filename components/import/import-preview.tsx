"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MarkdownFrontmatter } from "@/lib/markdown";
import type { ValidationResult } from "@/lib/validation";
import {
  ASSET_TYPE_LABELS,
  TARGET_TOOL_LABELS,
  EXPORT_PRESET_LABELS,
  ASSET_STATUS_LABELS,
  VISIBILITY_LABELS,
  ASSET_SOURCE_LABELS,
} from "@/lib/constants";
import { ValidationPanel } from "@/components/validation/validation-panel";

interface ImportPreviewProps {
  frontmatter: MarkdownFrontmatter;
  content: string;
  hasConflict: boolean;
  conflictAssetTitle: string | null;
  hasContentDuplicate: boolean;
  contentDuplicateAssetTitle: string | null;
  validation: ValidationResult;
}

export function ImportPreview({
  frontmatter,
  content,
  hasConflict,
  conflictAssetTitle,
  hasContentDuplicate,
  contentDuplicateAssetTitle,
  validation,
}: ImportPreviewProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">解析结果</CardTitle>
            {hasConflict ? (
              <Badge variant="destructive">syncId 冲突</Badge>
            ) : (
              <Badge variant="secondary">新建</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">标题</dt>
              <dd className="font-medium">{frontmatter.title}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">类型</dt>
              <dd>{ASSET_TYPE_LABELS[frontmatter.type]}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">目标工具</dt>
              <dd>{TARGET_TOOL_LABELS[frontmatter.targetTool]}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">导出预设</dt>
              <dd>{EXPORT_PRESET_LABELS[frontmatter.exportPreset]}</dd>
            </div>
            {frontmatter.status && (
              <div>
                <dt className="text-muted-foreground">状态</dt>
                <dd>{ASSET_STATUS_LABELS[frontmatter.status]}</dd>
              </div>
            )}
            {frontmatter.visibility && (
              <div>
                <dt className="text-muted-foreground">可见性</dt>
                <dd>{VISIBILITY_LABELS[frontmatter.visibility]}</dd>
              </div>
            )}
            {frontmatter.source && (
              <div>
                <dt className="text-muted-foreground">来源</dt>
                <dd>{ASSET_SOURCE_LABELS[frontmatter.source]}</dd>
              </div>
            )}
            {frontmatter.sourceUrl && (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">来源链接</dt>
                <dd className="truncate">{frontmatter.sourceUrl}</dd>
              </div>
            )}
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">syncId</dt>
              <dd className="font-mono text-xs">{frontmatter.syncId}</dd>
            </div>
          </dl>

          {frontmatter.description && (
            <div>
              <dt className="text-sm text-muted-foreground">描述</dt>
              <dd className="text-sm">{frontmatter.description}</dd>
            </div>
          )}

          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <div>
              <dt className="text-sm text-muted-foreground">标签</dt>
              <dd className="mt-1 flex flex-wrap gap-1">
                {frontmatter.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </dd>
            </div>
          )}

          {hasConflict && conflictAssetTitle && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm font-medium text-destructive">
                已存在相同 syncId 的资产
              </p>
              <p className="text-sm text-muted-foreground">
                冲突资产：{conflictAssetTitle}
              </p>
            </div>
          )}

          {hasContentDuplicate && contentDuplicateAssetTitle && (
            <div className="rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3">
              <p className="text-sm font-medium text-yellow-600">
                已存在内容相同的资产
              </p>
              <p className="text-sm text-muted-foreground">
                重复资产：{contentDuplicateAssetTitle}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">内容预览</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
            {content.slice(0, 1000)}
            {content.length > 1000 ? "\n..." : ""}
          </pre>
        </CardContent>
      </Card>

      <ValidationPanel result={validation} />
    </div>
  );
}
