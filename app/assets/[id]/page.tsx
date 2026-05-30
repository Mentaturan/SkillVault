import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyContentButton } from "@/components/assets/copy-content-button";
import { VariableCopyPanel } from "@/components/assets/variable-copy-panel";
import { getAssetById } from "@/server/services/asset-service";
import { getVersionsByAssetId } from "@/server/services/version-service";
import { extractVariables } from "@/lib/variables";
import { ValidationPanel } from "@/components/validation/validation-panel";
import {
  ArchiveButton,
  DeleteButton,
  RestoreButton,
} from "@/components/assets/asset-actions";
import { ExportPresetMenu } from "@/components/assets/export-preset-menu";
import { ExportExchangeButton } from "@/components/assets/export-exchange-button";
import {
  ASSET_SOURCE_LABELS,
  ASSET_STATUS_LABELS,
  ASSET_TYPE_LABELS,
  EXPORT_PRESET_LABELS,
  TARGET_TOOL_LABELS,
  VISIBILITY_LABELS,
} from "@/lib/constants";
import { ArrowLeft, Edit, History, Pin } from "lucide-react";
import { findCollectionsByAssetId } from "@/server/queries/collection-queries";
import { findProjectsByAssetId } from "@/server/queries/project-queries";
import { validateExistingAsset } from "@/server/services/validation-service";
import { SourceUpdateCheck } from "@/components/assets/source-update-check";

interface AssetDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const { id } = await params;
  const asset = await getAssetById(id);

  if (!asset) {
    notFound();
  }

  const versions = await getVersionsByAssetId(asset.id);
  const assetTags = asset.assetTags as Array<{ tag: { id: string; name: string } }> | undefined;
  const tags = assetTags?.map((at) => at.tag) ?? [];
  const variables = extractVariables(asset.content);
  const linkedCollections = await findCollectionsByAssetId(asset.id);
  const linkedProjects = await findProjectsByAssetId(asset.id);
  const validation = await validateExistingAsset(asset.id);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-2">
        <Link href="/assets">
          <ArrowLeft className="h-4 w-4" />
          返回资产库
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{asset.title}</h1>
            {asset.pinned && <Pin className="h-5 w-5 text-primary" />}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>{ASSET_TYPE_LABELS[asset.type]}</Badge>
            <Badge variant="outline">{ASSET_STATUS_LABELS[asset.status]}</Badge>
            <Badge variant="secondary">
              {TARGET_TOOL_LABELS[asset.targetTool]}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/assets/${asset.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              编辑
            </Link>
          </Button>
          <ExportPresetMenu assetId={asset.id} currentPreset={asset.exportPreset} />
          <ExportExchangeButton assetId={asset.id} />
          <Button asChild variant="outline">
            <Link href={`/assets/${asset.id}/deploy`}>
              部署
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/assets/${asset.id}/test-cases`}>
              测试用例
            </Link>
          </Button>
          {asset.status !== "archived" && (
            <ArchiveButton id={asset.id} />
          )}
          {!asset.deletedAt && (
            <DeleteButton id={asset.id} />
          )}
          {asset.deletedAt && (
            <RestoreButton id={asset.id} />
          )}
        </div>
      </div>

      {asset.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">描述</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{asset.description}</p>
          </CardContent>
        </Card>
      )}

      {asset.scenario && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">使用场景</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{asset.scenario}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">内容</CardTitle>
            <CopyContentButton assetId={asset.id} content={asset.content} />
          </div>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
            {asset.content}
          </pre>
        </CardContent>
      </Card>

      <VariableCopyPanel
        assetId={asset.id}
        content={asset.content}
        variables={variables}
      />

      <ValidationPanel result={validation} />

      {tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">标签</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">反向链接</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {linkedCollections.length === 0 && linkedProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无关联</p>
          ) : (
            <>
              {linkedCollections.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">集合</p>
                  {linkedCollections.map((c) => (
                    <Link
                      key={c.id}
                      href={`/collections/${c.id}`}
                      className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted"
                    >
                      <span>{c.icon ?? "📁"}</span>
                      <span>{c.name}</span>
                    </Link>
                  ))}
                </div>
              )}
              {linkedProjects.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">项目</p>
                  {linkedProjects.map((p) => (
                    <Link
                      key={p.id}
                      href={`/projects/${p.id}`}
                      className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted"
                    >
                      <span>{p.icon ?? "💼"}</span>
                      <span>{p.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">版本</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/assets/${asset.id}/versions`}>
                <History className="mr-2 h-4 w-4" />
                查看历史
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            共 {versions.length} 个版本
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">来源信息</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">来源</dt>
              <dd><Badge>{ASSET_SOURCE_LABELS[asset.source]}</Badge></dd>
            </div>
            {asset.sourceUrl && (
              <div>
                <dt className="text-muted-foreground">来源链接</dt>
                <dd>
                  <a
                    href={asset.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    {asset.sourceUrl}
                  </a>
                </dd>
              </div>
            )}
            {asset.sourceRef && (
              <div>
                <dt className="text-muted-foreground">来源 Ref</dt>
                <dd>{asset.sourceRef}</dd>
              </div>
            )}
            {asset.sourcePath && (
              <div>
                <dt className="text-muted-foreground">来源路径</dt>
                <dd className="break-all">{asset.sourcePath}</dd>
              </div>
            )}
            {asset.sourceImportedAt && (
              <div>
                <dt className="text-muted-foreground">导入时间</dt>
                <dd>{new Date(asset.sourceImportedAt).toLocaleString("zh-CN")}</dd>
              </div>
            )}
            {asset.sourceChecksum && (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">来源 Checksum</dt>
                <dd className="break-all font-mono text-xs">{asset.sourceChecksum}</dd>
              </div>
            )}
          </dl>
          {asset.sourceUrl && asset.sourceChecksum && (
            <div className="mt-3">
              <SourceUpdateCheck
                assetId={asset.id}
                sourceUrl={asset.sourceUrl}
                sourceChecksum={asset.sourceChecksum}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">元数据</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">导出预设</dt>
              <dd>{EXPORT_PRESET_LABELS[asset.exportPreset]}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">可见性</dt>
              <dd>{VISIBILITY_LABELS[asset.visibility]}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">创建时间</dt>
              <dd>{new Date(asset.createdAt).toLocaleString("zh-CN")}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">更新时间</dt>
              <dd>{new Date(asset.updatedAt).toLocaleString("zh-CN")}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">最近使用</dt>
              <dd>
                {asset.lastUsedAt
                  ? new Date(asset.lastUsedAt).toLocaleString("zh-CN")
                  : "暂无记录"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">复查截止日</dt>
              <dd>
                {asset.reviewDueAt
                  ? new Date(asset.reviewDueAt).toLocaleDateString("zh-CN")
                  : "未设置"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
