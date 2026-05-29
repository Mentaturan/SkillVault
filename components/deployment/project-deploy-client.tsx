"use client";

import { useState } from "react";

import {
  deployProjectToTargetAction,
  previewProjectDeploymentAction,
} from "@/app/projects/[id]/deploy/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  DeploymentTargetView,
  ProjectDeploymentExecutionView,
  ProjectDeploymentPreviewView,
} from "@/lib/deployment/types";

interface ProjectDeployClientProps {
  project: {
    id: string;
    name: string;
    assetCount: number;
  };
  targets: DeploymentTargetView[];
}

export function ProjectDeployClient({
  project,
  targets,
}: ProjectDeployClientProps) {
  const [selectedTargetId, setSelectedTargetId] = useState(targets[0]?.id ?? "");
  const [preview, setPreview] = useState<ProjectDeploymentPreviewView | null>(null);
  const [result, setResult] = useState<ProjectDeploymentExecutionView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  async function handlePreview() {
    setIsPreviewing(true);
    setError(null);
    setResult(null);

    const response = await previewProjectDeploymentAction(
      project.id,
      selectedTargetId,
    );

    if (!response.success) {
      setError(response.error ?? "项目部署预览失败");
      setPreview(null);
    } else if (response.preview) {
      setPreview(response.preview);
    }

    setIsPreviewing(false);
  }

  async function handleDeploy() {
    setIsDeploying(true);
    setError(null);
    setResult(null);

    const response = await deployProjectToTargetAction(
      project.id,
      selectedTargetId,
    );

    if (!response.success) {
      setError(response.error ?? "项目部署失败");
    } else if (response.result) {
      setResult(response.result);
    }

    setIsDeploying(false);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">部署目标</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              当前项目关联资产 {project.assetCount} 项
            </p>
            <Select
              value={selectedTargetId}
              onValueChange={(value) => {
                setSelectedTargetId(value);
                setPreview(null);
                setResult(null);
                setError(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择部署目标" />
              </SelectTrigger>
              <SelectContent>
                {targets.map((target) => (
                  <SelectItem key={target.id} value={target.id}>
                    {target.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handlePreview} disabled={!selectedTargetId || isPreviewing}>
              {isPreviewing ? "生成中..." : "生成项目部署预览"}
            </Button>
            {preview ? (
              <Button
                variant="outline"
                onClick={handleDeploy}
                disabled={!preview.canDeploy || isDeploying}
              >
                {isDeploying ? "部署中..." : "确认部署项目资产"}
              </Button>
            ) : null}
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {result ? (
            <div className="rounded-md border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-700">
              <p className="font-medium">
                已部署 {result.deployedCount} 项资产
              </p>
              <p className="mt-1 text-xs">
                保留冲突副本 {result.backupCount} 份
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {preview ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">摘要</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-4">
              <div className="rounded-md border p-3">新建：{preview.summary.create}</div>
              <div className="rounded-md border p-3">覆盖：{preview.summary.overwrite}</div>
              <div className="rounded-md border p-3">同步记录：{preview.summary.syncRecord}</div>
              <div className="rounded-md border p-3">阻塞：{preview.summary.blocked}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">资产部署计划</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {preview.assets.map((assetPreview) => (
                <div key={assetPreview.assetId} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{assetPreview.assetTitle}</p>
                    <Badge variant="outline">{assetPreview.plannedAction}</Badge>
                  </div>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {assetPreview.targetFilePath || "未配置目标路径"}
                  </p>
                  {assetPreview.warnings.length > 0 ? (
                    <div className="mt-2 space-y-1 text-xs text-yellow-700">
                      {assetPreview.warnings.map((warning) => (
                        <p key={warning}>{warning}</p>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
