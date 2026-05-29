"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Plus, Trash2, Briefcase } from "lucide-react";
import { ASSET_TYPE_LABELS, ASSET_STATUS_LABELS } from "@/lib/constants";
import { removeAssetFromProjectAction, deleteProjectAction } from "@/app/projects/actions";
import { AddAssetDialog } from "@/components/projects/add-asset-dialog";

interface AssetItem {
  id: string;
  title: string;
  type: string;
  status: string;
}

interface ProjectDetailClientProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    path: string | null;
    icon: string | null;
    color: string | null;
    createdAt: number;
    updatedAt: number;
  };
  projectAssets: Array<{
    assetId: string;
    orderIndex: number;
    asset: AssetItem;
  }>;
  availableAssets: Array<{ id: string; title: string; type: string }>;
}

export function ProjectDetailClient({ project, projectAssets, availableAssets }: ProjectDetailClientProps) {
  const router = useRouter();
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  async function handleRemoveAsset(assetId: string) {
    const fd = new FormData();
    fd.set("projectId", project.id);
    fd.set("assetId", assetId);
    await removeAssetFromProjectAction(fd);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("确定要删除此项目吗？关联的资产不会被删除。")) return;
    const fd = new FormData();
    fd.set("id", project.id);
    await deleteProjectAction(fd);
    router.push("/projects");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-2">
        <Link href="/projects">
          <ArrowLeft className="h-4 w-4" />
          返回项目列表
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold">{project.name}</h1>
          </div>
          {project.path && (
            <p className="mt-1 text-sm font-mono text-muted-foreground">{project.path}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/projects/${project.id}/deploy`}>
              部署资产
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/projects/${project.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              编辑
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </Button>
        </div>
      </div>

      {project.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">描述</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{project.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">项目资产 ({projectAssets.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              添加资产
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {projectAssets.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无关联资产</p>
          ) : (
            <div className="space-y-2">
              {projectAssets.map((pa) => (
                <div key={pa.assetId} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/assets/${pa.assetId}`} className="text-sm font-medium hover:underline">
                      {pa.asset.title}
                    </Link>
                    <Badge variant="outline">{ASSET_TYPE_LABELS[pa.asset.type as keyof typeof ASSET_TYPE_LABELS]}</Badge>
                    <Badge variant="secondary">{ASSET_STATUS_LABELS[pa.asset.status as keyof typeof ASSET_STATUS_LABELS]}</Badge>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleRemoveAsset(pa.assetId)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
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
              <dt className="text-muted-foreground">创建时间</dt>
              <dd>{new Date(project.createdAt).toLocaleString("zh-CN")}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">更新时间</dt>
              <dd>{new Date(project.updatedAt).toLocaleString("zh-CN")}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <AddAssetDialog
        projectId={project.id}
        assets={availableAssets}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
    </div>
  );
}
