import {
  copyFile,
  mkdir,
  readFile,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import type { NewDeploymentRecord } from "@/db/schema";
import {
  DEPLOYMENT_STATUS_LABELS,
  DEPLOYMENT_TARGET_DESCRIPTIONS,
  DEPLOYMENT_TARGET_KEYS,
  DEPLOYMENT_TARGET_LABELS,
  DEPLOYMENT_TARGET_PATH_PLACEHOLDERS,
  type DeploymentTargetKey,
  type TargetTool,
} from "@/lib/constants";
import type {
  AssetDeploymentExecutionView,
  AssetDeploymentPreviewView,
  AssetDeploymentStatusView,
  DeploymentTargetView,
  ProjectDeploymentExecutionView,
  ProjectDeploymentPreviewView,
} from "@/lib/deployment/types";
import { createContentHash } from "@/lib/hash";
import { createId } from "@/lib/id";
import {
  deploymentPreviewSchema,
  saveDeploymentTargetsSchema,
  type DeploymentPreviewInput,
  type SaveDeploymentTargetsInput,
} from "@/lib/validators/deployment";
import { findAssetById } from "@/server/queries/asset-queries";
import {
  createDeploymentRecord,
  createDeploymentTarget,
  findAllDeploymentTargets,
  findDeploymentRecordByAssetAndTarget,
  findDeploymentRecordsByAssetId,
  updateDeploymentRecord,
  updateDeploymentTarget,
} from "@/server/queries/deployment-queries";
import {
  getExportFilenameWithPreset,
  renderAssetWithPreset,
} from "@/lib/markdown";
import { nowTimestamp } from "@/lib/time";
import { getProjectById } from "@/server/services/project-service";

const TARGET_TOOL_HINTS: Partial<Record<DeploymentTargetKey, TargetTool>> = {
  codex: "codex",
  claude_code: "claude_code",
  cursor: "cursor",
  trae: "trae_solo",
};

function sortTargets<T extends { key: DeploymentTargetKey }>(targets: T[]) {
  const order = new Map(DEPLOYMENT_TARGET_KEYS.map((key, index) => [key, index]));
  return [...targets].sort((a, b) => (order.get(a.key) ?? 0) - (order.get(b.key) ?? 0));
}

function normalizePath(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function buildBackupPath(targetFilePath: string) {
  return `${targetFilePath}.skillvault-backup-${Date.now()}`;
}

async function readFileState(targetFilePath: string) {
  try {
    const [fileBuffer, fileStats] = await Promise.all([
      readFile(targetFilePath),
      stat(targetFilePath),
    ]);

    return {
      status: "ok" as const,
      contentHash: createContentHash(fileBuffer.toString("utf8")),
      size: fileStats.size,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {
        status: "missing" as const,
        contentHash: null,
        size: null,
      };
    }

    return {
      status: "unreadable" as const,
      contentHash: null,
      size: null,
    };
  }
}

function toTargetView(target: Awaited<ReturnType<typeof ensureDeploymentTargets>>[number]): DeploymentTargetView {
  return {
    id: target.id,
    key: target.key,
    label: DEPLOYMENT_TARGET_LABELS[target.key],
    description: DEPLOYMENT_TARGET_DESCRIPTIONS[target.key],
    placeholder: DEPLOYMENT_TARGET_PATH_PLACEHOLDERS[target.key],
    path: normalizePath(target.path),
    enabled: target.enabled,
  };
}

async function ensureDeploymentTargets() {
  const existing = await findAllDeploymentTargets();
  const byKey = new Map(existing.map((target) => [target.key, target]));

  for (const key of DEPLOYMENT_TARGET_KEYS) {
    if (byKey.has(key)) {
      continue;
    }

    const now = nowTimestamp();
    const created = await createDeploymentTarget({
      id: createId(),
      key,
      path: null,
      enabled: false,
      createdAt: now,
      updatedAt: now,
    });
    byKey.set(key, created);
  }

  return sortTargets(Array.from(byKey.values()));
}

async function buildLiveStatus(
  assetId: string,
  target: Awaited<ReturnType<typeof ensureDeploymentTargets>>[number],
): Promise<AssetDeploymentStatusView> {
  const asset = await findAssetById(assetId);
  if (!asset) {
    throw new Error("资产不存在");
  }

  const record = await findDeploymentRecordByAssetAndTarget(assetId, target.id);
  const configuredPath = normalizePath(target.path);
  const targetFilename = configuredPath
    ? getExportFilenameWithPreset(asset, asset.exportPreset)
    : null;
  const targetFilePath =
    configuredPath && targetFilename ? path.join(configuredPath, targetFilename) : null;
  const renderedContent = renderAssetWithPreset(asset, asset.exportPreset);
  const renderedHash = createContentHash(renderedContent);

  if (!target.enabled || !configuredPath) {
    return {
      targetId: target.id,
      targetKey: target.key,
      targetLabel: DEPLOYMENT_TARGET_LABELS[target.key],
      configuredPath,
      targetFilePath,
      targetFilename,
      enabled: target.enabled,
      status: "not_deployed",
      statusReason: "未配置启用的部署目录",
      lastDeployedAt: record?.lastDeployedAt ?? null,
      lastBackupPath: record?.lastBackupPath ?? null,
    };
  }

  if (!record) {
    return {
      targetId: target.id,
      targetKey: target.key,
      targetLabel: DEPLOYMENT_TARGET_LABELS[target.key],
      configuredPath,
      targetFilePath,
      targetFilename,
      enabled: target.enabled,
      status: "not_deployed",
      statusReason: DEPLOYMENT_STATUS_LABELS.not_deployed,
      lastDeployedAt: null,
      lastBackupPath: null,
    };
  }

  if (!targetFilePath || !targetFilename) {
    return {
      targetId: target.id,
      targetKey: target.key,
      targetLabel: DEPLOYMENT_TARGET_LABELS[target.key],
      configuredPath,
      targetFilePath,
      targetFilename,
      enabled: target.enabled,
      status: "broken",
      statusReason: "目标文件路径无效",
      lastDeployedAt: record.lastDeployedAt,
      lastBackupPath: record.lastBackupPath,
    };
  }

  const fileState = await readFileState(targetFilePath);
  if (fileState.status === "missing") {
    return {
      targetId: target.id,
      targetKey: target.key,
      targetLabel: DEPLOYMENT_TARGET_LABELS[target.key],
      configuredPath,
      targetFilePath,
      targetFilename,
      enabled: target.enabled,
      status: "missing",
      statusReason: DEPLOYMENT_STATUS_LABELS.missing,
      lastDeployedAt: record.lastDeployedAt,
      lastBackupPath: record.lastBackupPath,
    };
  }

  if (fileState.status === "unreadable") {
    return {
      targetId: target.id,
      targetKey: target.key,
      targetLabel: DEPLOYMENT_TARGET_LABELS[target.key],
      configuredPath,
      targetFilePath,
      targetFilename,
      enabled: target.enabled,
      status: "broken",
      statusReason: "目标文件不可读取",
      lastDeployedAt: record.lastDeployedAt,
      lastBackupPath: record.lastBackupPath,
    };
  }

  if (fileState.contentHash !== record.deployedContentHash) {
    return {
      targetId: target.id,
      targetKey: target.key,
      targetLabel: DEPLOYMENT_TARGET_LABELS[target.key],
      configuredPath,
      targetFilePath,
      targetFilename,
      enabled: target.enabled,
      status: "broken",
      statusReason: DEPLOYMENT_STATUS_LABELS.broken,
      lastDeployedAt: record.lastDeployedAt,
      lastBackupPath: record.lastBackupPath,
    };
  }

  if (renderedHash !== record.deployedContentHash) {
    return {
      targetId: target.id,
      targetKey: target.key,
      targetLabel: DEPLOYMENT_TARGET_LABELS[target.key],
      configuredPath,
      targetFilePath,
      targetFilename,
      enabled: target.enabled,
      status: "stale",
      statusReason: DEPLOYMENT_STATUS_LABELS.stale,
      lastDeployedAt: record.lastDeployedAt,
      lastBackupPath: record.lastBackupPath,
    };
  }

  return {
    targetId: target.id,
    targetKey: target.key,
    targetLabel: DEPLOYMENT_TARGET_LABELS[target.key],
    configuredPath,
    targetFilePath,
    targetFilename,
    enabled: target.enabled,
    status: "installed",
    statusReason: DEPLOYMENT_STATUS_LABELS.installed,
    lastDeployedAt: record.lastDeployedAt,
    lastBackupPath: record.lastBackupPath,
  };
}

export async function getDeploymentTargets() {
  const targets = await ensureDeploymentTargets();
  return targets.map(toTargetView);
}

export async function saveDeploymentTargets(input: SaveDeploymentTargetsInput) {
  const parsed = saveDeploymentTargetsSchema.parse(input);
  const targets = await ensureDeploymentTargets();
  const targetMap = new Map(targets.map((target) => [target.key, target]));

  for (const item of parsed) {
    const target = targetMap.get(item.key);
    if (!target) {
      continue;
    }

    await updateDeploymentTarget(target.id, {
      path: item.path.trim() || null,
      enabled: item.enabled,
    });
  }

  return getDeploymentTargets();
}

export async function getAssetDeploymentStatuses(assetId: string) {
  const targets = await ensureDeploymentTargets();
  return Promise.all(targets.map((target) => buildLiveStatus(assetId, target)));
}

export async function previewAssetDeployment(input: DeploymentPreviewInput) {
  const parsed = deploymentPreviewSchema.parse(input);
  const asset = await findAssetById(parsed.assetId);
  if (!asset) {
    throw new Error("资产不存在");
  }

  const targets = await ensureDeploymentTargets();
  const target = targets.find((item) => item.id === parsed.targetId);
  if (!target) {
    throw new Error("部署目标不存在");
  }

  const liveStatus = await buildLiveStatus(asset.id, target);
  const configuredPath = normalizePath(target.path);
  if (!target.enabled || !configuredPath) {
    return {
      assetId: asset.id,
      assetTitle: asset.title,
      targetId: target.id,
      targetKey: target.key,
      targetLabel: DEPLOYMENT_TARGET_LABELS[target.key],
      targetDirectoryPath: configuredPath,
      targetFilePath: "",
      targetFilename: "",
      renderedContent: "",
      renderedContentHash: "",
      existingFile: {
        status: "missing" as const,
        contentHash: null,
        size: null,
      },
      plannedAction: "sync_record" as const,
      backupPath: null,
      warnings: ["请先在设置中启用并配置部署目录。"],
      canDeploy: false,
      liveStatus,
    } satisfies AssetDeploymentPreviewView;
  }

  const targetFilename = getExportFilenameWithPreset(asset, asset.exportPreset);
  const targetFilePath = path.join(configuredPath, targetFilename);
  const renderedContent = renderAssetWithPreset(asset, asset.exportPreset);
  const renderedContentHash = createContentHash(renderedContent);
  const existingFileState = await readFileState(targetFilePath);
  const record = await findDeploymentRecordByAssetAndTarget(asset.id, target.id);
  const warnings: string[] = [];

  const toolHint = TARGET_TOOL_HINTS[target.key];
  if (toolHint && asset.targetTool !== toolHint) {
    warnings.push(
      `资产目标工具为 ${asset.targetTool}，与当前部署目标 ${target.key} 不完全一致，请确认导出预设是否匹配。`,
    );
  }

  if (
    record &&
    record.targetFilePath !== targetFilePath &&
    liveStatus.status !== "installed"
  ) {
    warnings.push("当前配置路径与上次部署路径不同，状态按新路径重新计算。");
  }

  let plannedAction: AssetDeploymentPreviewView["plannedAction"] = "create";
  let backupPath: string | null = null;
  let existingStatus: AssetDeploymentPreviewView["existingFile"]["status"] = "missing";

  if (existingFileState.status === "missing") {
    plannedAction = "create";
    existingStatus = "missing";
  } else if (existingFileState.status === "unreadable") {
    plannedAction = "overwrite";
    existingStatus = "unreadable";
    backupPath = buildBackupPath(targetFilePath);
    warnings.push("现有目标文件不可读取，部署时仍会先保留冲突副本路径。");
  } else if (existingFileState.contentHash === renderedContentHash) {
    plannedAction = "sync_record";
    existingStatus = "matched";
  } else {
    plannedAction = "overwrite";
    existingStatus = "different";
    backupPath = buildBackupPath(targetFilePath);
  }

  return {
    assetId: asset.id,
    assetTitle: asset.title,
    targetId: target.id,
    targetKey: target.key,
    targetLabel: DEPLOYMENT_TARGET_LABELS[target.key],
    targetDirectoryPath: configuredPath,
    targetFilePath,
    targetFilename,
    renderedContent,
    renderedContentHash,
    existingFile: {
      status: existingStatus,
      contentHash: existingFileState.contentHash,
      size: existingFileState.size,
    },
    plannedAction,
    backupPath,
    warnings,
    canDeploy: true,
    liveStatus,
  } satisfies AssetDeploymentPreviewView;
}

export async function deployAssetToTarget(input: DeploymentPreviewInput) {
  const preview = await previewAssetDeployment(input);
  if (!preview.canDeploy) {
    throw new Error("部署目标未配置完成");
  }

  const deployedAt = nowTimestamp();
  let createdBackup = false;
  if (preview.backupPath && preview.plannedAction === "overwrite") {
    await mkdir(path.dirname(preview.backupPath), { recursive: true });
    try {
      await copyFile(preview.targetFilePath, preview.backupPath);
      createdBackup = true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }

  await mkdir(preview.targetDirectoryPath, { recursive: true });
  if (preview.plannedAction !== "sync_record") {
    await writeFile(preview.targetFilePath, preview.renderedContent, "utf8");
  }

  const recordInput: Omit<NewDeploymentRecord, "id"> = {
    assetId: preview.assetId,
    deploymentTargetId: preview.targetId,
    targetDirectoryPath: preview.targetDirectoryPath,
    targetFilePath: preview.targetFilePath,
    targetFilename: preview.targetFilename,
    deployedContentHash: preview.renderedContentHash,
    lastBackupPath: createdBackup ? preview.backupPath : null,
    lastDeployedAt: deployedAt,
    updatedAt: deployedAt,
  };

  const existingRecord = await findDeploymentRecordByAssetAndTarget(
    preview.assetId,
    preview.targetId,
  );
  if (existingRecord) {
    await updateDeploymentRecord(existingRecord.id, recordInput);
  } else {
    await createDeploymentRecord({
      id: createId(),
      ...recordInput,
    });
  }

  return {
    targetFilePath: preview.targetFilePath,
    targetFilename: preview.targetFilename,
    deployedAt,
    createdBackup,
    backupPath: createdBackup ? preview.backupPath : null,
  } satisfies AssetDeploymentExecutionView;
}

export async function getDeploymentPageData(assetId: string) {
  const asset = await findAssetById(assetId);
  if (!asset) {
    throw new Error("资产不存在");
  }

  const [targets, statuses, records] = await Promise.all([
    getDeploymentTargets(),
    getAssetDeploymentStatuses(asset.id),
    findDeploymentRecordsByAssetId(asset.id),
  ]);

  return {
    asset: {
      id: asset.id,
      title: asset.title,
      exportPreset: asset.exportPreset,
      targetTool: asset.targetTool,
    },
    targets,
    statuses,
    records: records.map((record) => ({
      id: record.id,
      targetId: record.deploymentTargetId,
      targetFilePath: record.targetFilePath,
      deployedContentHash: record.deployedContentHash,
      lastBackupPath: record.lastBackupPath,
      lastDeployedAt: record.lastDeployedAt,
    })),
  };
}

export async function previewProjectDeployment(
  projectId: string,
  targetId: string,
) {
  const project = await getProjectById(projectId);
  if (!project) {
    throw new Error("项目不存在");
  }

  const assetIds = project.projectAssets.map((item) => item.assetId);
  if (assetIds.length === 0) {
    throw new Error("项目下没有可部署的资产");
  }

  const assets = await Promise.all(
    assetIds.map((assetId) => previewAssetDeployment({ assetId, targetId })),
  );
  const targetLabel = assets[0]?.targetLabel ?? "部署目标";

  return {
    projectId: project.id,
    projectName: project.name,
    targetId,
    targetLabel,
    assetCount: assets.length,
    canDeploy: assets.every((asset) => asset.canDeploy),
    summary: {
      create: assets.filter((asset) => asset.plannedAction === "create").length,
      overwrite: assets.filter((asset) => asset.plannedAction === "overwrite").length,
      syncRecord: assets.filter((asset) => asset.plannedAction === "sync_record").length,
      blocked: assets.filter((asset) => !asset.canDeploy).length,
    },
    assets,
  } satisfies ProjectDeploymentPreviewView;
}

export async function deployProjectToTarget(
  projectId: string,
  targetId: string,
) {
  const preview = await previewProjectDeployment(projectId, targetId);
  if (!preview.canDeploy) {
    throw new Error("项目部署仍存在未配置的部署目标");
  }

  const results: ProjectDeploymentExecutionView["results"] = [];
  let backupCount = 0;

  for (const assetPreview of preview.assets) {
    const result = await deployAssetToTarget({
      assetId: assetPreview.assetId,
      targetId,
    });

    if (result.createdBackup) {
      backupCount += 1;
    }

    results.push({
      assetId: assetPreview.assetId,
      assetTitle: assetPreview.assetTitle,
      targetFilePath: result.targetFilePath,
      backupPath: result.backupPath,
    });
  }

  return {
    projectId: preview.projectId,
    projectName: preview.projectName,
    targetId,
    targetLabel: preview.targetLabel,
    deployedCount: results.length,
    backupCount,
    results,
  } satisfies ProjectDeploymentExecutionView;
}

export async function getProjectDeploymentPageData(projectId: string) {
  const project = await getProjectById(projectId);
  if (!project) {
    throw new Error("项目不存在");
  }

  const targets = await getDeploymentTargets();

  return {
    project: {
      id: project.id,
      name: project.name,
      assetCount: project.projectAssets.length,
    },
    targets,
    assets: project.projectAssets.map((item) => ({
      id: item.asset.id,
      title: item.asset.title,
      status: item.asset.status,
      type: item.asset.type,
    })),
  };
}
