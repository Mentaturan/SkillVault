"use client";

import type { RestorePreview } from "@/lib/backup";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RestorePreviewProps {
  preview: RestorePreview;
}

function actionLabel(action: RestorePreview["assets"][number]["action"]) {
  switch (action) {
    case "create":
      return "新建";
    case "overwrite":
      return "覆盖";
    case "copy":
      return "复制";
    case "skip":
      return "跳过";
  }
}

function groupActionLabel(action: RestorePreview["collections"][number]["action"]) {
  return action === "create" ? "新建" : "更新";
}

export function RestorePreviewPanel({ preview }: RestorePreviewProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">恢复预览</CardTitle>
            <Badge variant={preview.checksumValid ? "secondary" : "destructive"}>
              {preview.checksumValid ? "Checksum 通过" : "Checksum 异常"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">导出时间</dt>
              <dd>{preview.manifest.exportTimestampIso}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">迁移标记</dt>
              <dd>{preview.manifest.migrationMarker}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">资产</dt>
              <dd>{preview.manifest.counts.assets}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">版本</dt>
              <dd>{preview.manifest.counts.versions}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">集合</dt>
              <dd>{preview.manifest.counts.collections}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">项目</dt>
              <dd>{preview.manifest.counts.projects}</dd>
            </div>
          </dl>

          {preview.checksumWarning ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-destructive">
              {preview.checksumWarning}
            </div>
          ) : null}

          {preview.errors.length > 0 ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {preview.errors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">摘要</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md border p-3">新建资产：{preview.summary.createAssets}</div>
          <div className="rounded-md border p-3">覆盖资产：{preview.summary.overwriteAssets}</div>
          <div className="rounded-md border p-3">复制资产：{preview.summary.copyAssets}</div>
          <div className="rounded-md border p-3">跳过资产：{preview.summary.skipAssets}</div>
          <div className="rounded-md border p-3">新建集合：{preview.summary.createCollections}</div>
          <div className="rounded-md border p-3">更新集合：{preview.summary.updateCollections}</div>
          <div className="rounded-md border p-3">新建项目：{preview.summary.createProjects}</div>
          <div className="rounded-md border p-3">更新项目：{preview.summary.updateProjects}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">资产计划</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {preview.assets.map((asset) => (
            <div key={asset.syncId} className="rounded-md border p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{asset.title}</p>
                  <p className="font-mono text-xs text-muted-foreground">{asset.syncId}</p>
                </div>
                <Badge variant={asset.action === "skip" ? "outline" : "secondary"}>
                  {actionLabel(asset.action)}
                </Badge>
              </div>
              {asset.targetAssetTitle ? (
                <p className="mt-2 text-muted-foreground">目标资产：{asset.targetAssetTitle}</p>
              ) : null}
              {asset.warnings.length > 0 ? (
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {asset.warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">集合计划</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {preview.collections.map((collection) => (
              <div key={collection.name} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{collection.name}</p>
                  <Badge variant="secondary">{groupActionLabel(collection.action)}</Badge>
                </div>
                {collection.warnings.map((warning) => (
                  <p key={warning} className="mt-2 text-xs text-muted-foreground">
                    {warning}
                  </p>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">项目计划</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {preview.projects.map((project) => (
              <div key={project.name} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{project.name}</p>
                  <Badge variant="secondary">{groupActionLabel(project.action)}</Badge>
                </div>
                {project.warnings.map((warning) => (
                  <p key={warning} className="mt-2 text-xs text-muted-foreground">
                    {warning}
                  </p>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
