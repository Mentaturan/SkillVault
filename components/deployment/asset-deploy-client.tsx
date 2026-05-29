"use client";

import { useMemo, useState } from "react";

import {
  deployAssetToTargetAction,
  previewAssetDeploymentAction,
} from "@/app/assets/[id]/deploy/actions";
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
import {
  DEPLOYMENT_STATUS_LABELS,
  type DeploymentStatus,
} from "@/lib/constants";
import type {
  AssetDeploymentExecutionView,
  AssetDeploymentPreviewView,
  AssetDeploymentStatusView,
  DeploymentTargetView,
} from "@/lib/deployment/types";

interface AssetDeployClientProps {
  asset: {
    id: string;
    title: string;
    exportPreset: string;
    targetTool: string;
  };
  targets: DeploymentTargetView[];
  initialStatuses: AssetDeploymentStatusView[];
}

function statusVariant(status: DeploymentStatus) {
  switch (status) {
    case "installed":
      return "secondary";
    case "stale":
      return "outline";
    case "missing":
    case "broken":
      return "destructive";
    default:
      return "outline";
  }
}

export function AssetDeployClient({
  asset,
  targets,
  initialStatuses,
}: AssetDeployClientProps) {
  const [selectedTargetId, setSelectedTargetId] = useState(targets[0]?.id ?? "");
  const [statuses, setStatuses] = useState(initialStatuses);
  const [preview, setPreview] = useState<AssetDeploymentPreviewView | null>(null);
  const [deployResult, setDeployResult] = useState<AssetDeploymentExecutionView | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  const selectedStatus = useMemo(
    () => statuses.find((status) => status.targetId === selectedTargetId) ?? null,
    [selectedTargetId, statuses],
  );

  async function handlePreview() {
    setError(null);
    setDeployResult(null);
    setIsPreviewing(true);

    const result = await previewAssetDeploymentAction({
      assetId: asset.id,
      targetId: selectedTargetId,
    });

    if (!result.success) {
      setError(result.error ?? "部署预览失败");
      setPreview(null);
    } else if (result.preview) {
      setPreview(result.preview);
    }

    setIsPreviewing(false);
  }

  async function handleDeploy() {
    setError(null);
    setDeployResult(null);
    setIsDeploying(true);

    const result = await deployAssetToTargetAction({
      assetId: asset.id,
      targetId: selectedTargetId,
    });

    if (!result.success) {
      setError(result.error ?? "部署失败");
    } else {
      setDeployResult(result.result ?? null);
      if (result.statuses) {
        setStatuses(result.statuses);
      }
    }

    setIsDeploying(false);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">当前状态</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {statuses.map((status) => (
            <div
              key={status.targetId}
              className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-start sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{status.targetLabel}</p>
                  <Badge variant={statusVariant(status.status)}>
                    {DEPLOYMENT_STATUS_LABELS[status.status]}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {status.statusReason}
                </p>
                {status.targetFilePath ? (
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {status.targetFilePath}
                  </p>
                ) : null}
              </div>
              {status.lastDeployedAt ? (
                <p className="text-xs text-muted-foreground">
                  上次部署：{new Date(status.lastDeployedAt).toLocaleString("zh-CN")}
                </p>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">部署预览</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">选择部署目标</p>
            <Select
              value={selectedTargetId}
              onValueChange={(value) => {
                setSelectedTargetId(value);
                setPreview(null);
                setDeployResult(null);
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

          <div className="flex flex-wrap gap-2">
            <Button onClick={handlePreview} disabled={!selectedTargetId || isPreviewing}>
              {isPreviewing ? "生成中..." : "生成部署预览"}
            </Button>
            {preview ? (
              <Button
                variant="outline"
                onClick={handleDeploy}
                disabled={!preview.canDeploy || isDeploying}
              >
                {isDeploying ? "部署中..." : "确认部署"}
              </Button>
            ) : null}
          </div>

          {selectedStatus ? (
            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              <p className="font-medium">当前选中目标状态</p>
              <p className="mt-1 text-muted-foreground">{selectedStatus.statusReason}</p>
            </div>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {deployResult ? (
            <div className="rounded-md border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-700">
              <p className="font-medium">部署完成</p>
              <p className="mt-1 font-mono text-xs">{deployResult.targetFilePath}</p>
              {deployResult.createdBackup && deployResult.backupPath ? (
                <p className="mt-1 text-xs">
                  已保留冲突副本：{deployResult.backupPath}
                </p>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {preview ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">预览结果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <dl className="grid gap-2 sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">目标目录</dt>
                  <dd className="font-mono text-xs">{preview.targetDirectoryPath}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">目标文件名</dt>
                  <dd className="font-mono text-xs">{preview.targetFilename}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">写入路径</dt>
                  <dd className="font-mono text-xs">{preview.targetFilePath}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">现有文件状态</dt>
                  <dd>{preview.existingFile.status}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">计划动作</dt>
                  <dd>{preview.plannedAction}</dd>
                </div>
                {preview.backupPath ? (
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground">冲突副本路径</dt>
                    <dd className="font-mono text-xs">{preview.backupPath}</dd>
                  </div>
                ) : null}
              </dl>

              {preview.warnings.length > 0 ? (
                <div className="rounded-md border border-yellow-500/40 bg-yellow-500/10 p-3 text-xs text-yellow-700">
                  {preview.warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">目标文件内容</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
                {preview.renderedContent}
              </pre>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
