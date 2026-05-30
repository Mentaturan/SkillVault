import { mkdir, readFile, readdir, stat, writeFile, copyFile } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

import { ExchangeManifest, type ExchangeManifestType } from "@/lib/exchange/schema";
import { createContentHash } from "@/lib/hash";
import { findAssetById, findAssetBySyncId } from "@/server/queries/asset-queries";
import { createNewAsset, updateExistingAsset } from "@/server/services/asset-service";
import { nowTimestamp } from "@/lib/time";

export interface ReimportStatus {
  assetId: string;
  hasSource: boolean;
  sourceUnchanged: boolean;
  currentChecksum: string;
  incomingChecksum: string;
  action: "skip" | "update" | "conflict" | "error";
  reason: string;
}

export interface ExchangeImportPreview {
  valid: boolean;
  manifest: ExchangeManifestType | null;
  content: string;
  supportFiles: Array<{ name: string; size: number }>;
  conflictStatus: "new" | "update" | "conflict";
  existingAsset: { id: string; title: string; updatedAt: number } | null;
  errors?: string[];
}

export async function exportExchangeBundle(params: {
  assetId: string;
  outputDir: string;
}): Promise<{ manifest: ExchangeManifestType; filePaths: string[] }> {
  const asset = await findAssetById(params.assetId);
  if (!asset) {
    throw new Error("资产不存在");
  }

  if (!existsSync(params.outputDir)) {
    await mkdir(params.outputDir, { recursive: true });
  }

  const supportFilesDir = join(params.outputDir, "support-files");
  const supportFiles: Array<{ name: string; size: number }> = [];

  const tagNames = asset.assetTags?.map((at) => at.tag.name) ?? [];

  const manifest: ExchangeManifestType = {
    version: 1,
    exportedAt: nowTimestamp(),
    asset: {
      syncId: asset.syncId,
      slug: asset.slug,
      title: asset.title,
      type: asset.type,
      targetTool: asset.targetTool,
      exportPreset: asset.exportPreset,
      description: asset.description,
      scenario: asset.scenario,
      status: asset.status,
      visibility: asset.visibility,
      source: asset.source,
      sourceUrl: asset.sourceUrl,
      sourceRef: asset.sourceRef,
      sourcePath: asset.sourcePath,
      sourceImportedAt: asset.sourceImportedAt,
      sourceChecksum: asset.sourceChecksum,
      pinned: asset.pinned,
      rating: asset.rating,
      tags: tagNames,
      contentHash: asset.contentHash,
    },
    supportFiles,
  };

  const manifestPath = join(params.outputDir, "manifest.json");
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

  const assetPath = join(params.outputDir, "asset.md");
  await writeFile(assetPath, asset.content, "utf8");

  const filePaths = [manifestPath, assetPath];

  if (supportFiles.length > 0) {
    await mkdir(supportFilesDir, { recursive: true });
    for (const sf of supportFiles) {
      const src = join(supportFilesDir, sf.name);
      if (existsSync(src)) {
        const dest = join(supportFilesDir, sf.name);
        await copyFile(src, dest);
        filePaths.push(dest);
      }
    }
  }

  return { manifest, filePaths };
}

export async function importExchangePreview(
  bundleDir: string,
): Promise<ExchangeImportPreview> {
  const manifestPath = join(bundleDir, "manifest.json");
  const assetPath = join(bundleDir, "asset.md");
  const supportFilesDir = join(bundleDir, "support-files");

  if (!existsSync(manifestPath)) {
    return {
      valid: false,
      manifest: null,
      content: "",
      supportFiles: [],
      conflictStatus: "new",
      existingAsset: null,
      errors: ["manifest.json 不存在"],
    };
  }

  let rawManifest: unknown;
  try {
    const raw = await readFile(manifestPath, "utf8");
    rawManifest = JSON.parse(raw);
  } catch {
    return {
      valid: false,
      manifest: null,
      content: "",
      supportFiles: [],
      conflictStatus: "new",
      existingAsset: null,
      errors: ["manifest.json 解析失败"],
    };
  }

  const parsed = ExchangeManifest.safeParse(rawManifest);
  if (!parsed.success) {
    const errors = parsed.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`,
    );
    return {
      valid: false,
      manifest: null,
      content: "",
      supportFiles: [],
      conflictStatus: "new",
      existingAsset: null,
      errors,
    };
  }

  const manifest = parsed.data;

  let content = "";
  if (existsSync(assetPath)) {
    content = await readFile(assetPath, "utf8");
  }

  const supportFiles: Array<{ name: string; size: number }> = [];
  if (existsSync(supportFilesDir)) {
    const entries = await readdir(supportFilesDir);
    for (const entry of entries) {
      const entryPath = join(supportFilesDir, entry);
      const entryStat = await stat(entryPath);
      if (entryStat.isFile()) {
        supportFiles.push({ name: entry, size: entryStat.size });
      }
    }
  }

  const existing = await findAssetBySyncId(manifest.asset.syncId);

  let conflictStatus: "new" | "update" | "conflict";
  let existingAsset: { id: string; title: string; updatedAt: number } | null = null;

  if (!existing) {
    conflictStatus = "new";
  } else if (existing.contentHash !== manifest.asset.contentHash) {
    conflictStatus = "conflict";
    existingAsset = {
      id: existing.id,
      title: existing.title,
      updatedAt: existing.updatedAt,
    };
  } else {
    conflictStatus = "update";
    existingAsset = {
      id: existing.id,
      title: existing.title,
      updatedAt: existing.updatedAt,
    };
  }

  return {
    valid: true,
    manifest,
    content,
    supportFiles,
    conflictStatus,
    existingAsset,
  };
}

export async function checkReimportStatus(params: {
  assetId: string;
  bundleDir: string;
}): Promise<ReimportStatus> {
  const asset = await findAssetById(params.assetId);
  if (!asset) {
    return {
      assetId: params.assetId,
      hasSource: false,
      sourceUnchanged: false,
      currentChecksum: "",
      incomingChecksum: "",
      action: "error",
      reason: "资产不存在",
    };
  }

  const manifestPath = join(params.bundleDir, "manifest.json");
  if (!existsSync(manifestPath)) {
    return {
      assetId: params.assetId,
      hasSource: false,
      sourceUnchanged: false,
      currentChecksum: "",
      incomingChecksum: "",
      action: "error",
      reason: "manifest.json 不存在",
    };
  }

  let rawManifest: unknown;
  try {
    const raw = await readFile(manifestPath, "utf8");
    rawManifest = JSON.parse(raw);
  } catch {
    return {
      assetId: params.assetId,
      hasSource: false,
      sourceUnchanged: false,
      currentChecksum: "",
      incomingChecksum: "",
      action: "error",
      reason: "manifest.json 解析失败",
    };
  }

  const parsed = ExchangeManifest.safeParse(rawManifest);
  if (!parsed.success) {
    return {
      assetId: params.assetId,
      hasSource: false,
      sourceUnchanged: false,
      currentChecksum: "",
      incomingChecksum: "",
      action: "error",
      reason: "manifest.json 校验失败",
    };
  }

  const manifest = parsed.data;
  const currentChecksum = createContentHash(asset.content);
  const incomingChecksum = manifest.asset.contentHash;

  if (currentChecksum === incomingChecksum) {
    return {
      assetId: params.assetId,
      hasSource: true,
      sourceUnchanged: true,
      currentChecksum,
      incomingChecksum,
      action: "skip",
      reason: "Source unchanged",
    };
  }

  return {
    assetId: params.assetId,
    hasSource: true,
    sourceUnchanged: false,
    currentChecksum,
    incomingChecksum,
    action: "update",
    reason: "Source has changed since last import",
  };
}

export async function executeExchangeImport(
  bundleDir: string,
  options: { strategy: "overwrite" | "copy" | "skip"; userId?: string; reimport?: boolean },
): Promise<{ assetId: string; action: string; reason?: string }> {
  const preview = await importExchangePreview(bundleDir);

  if (!preview.valid || !preview.manifest) {
    throw new Error(`无效的交换包: ${(preview.errors ?? []).join("; ")}`);
  }

  if (options.reimport && preview.existingAsset) {
    const reimportStatus = await checkReimportStatus({
      assetId: preview.existingAsset.id,
      bundleDir,
    });

    if (reimportStatus.action === "error") {
      throw new Error(reimportStatus.reason);
    }

    if (reimportStatus.action === "skip") {
      return { assetId: preview.existingAsset.id, action: "skipped", reason: "No changes detected" };
    }
  }

  const { manifest, content } = preview;
  const { asset: assetMeta } = manifest;

  if (preview.conflictStatus === "conflict" && options.strategy === "skip") {
    return { assetId: preview.existingAsset!.id, action: "skipped" };
  }

  if (
    preview.conflictStatus === "new" ||
    (preview.conflictStatus === "conflict" && options.strategy === "copy") ||
    (preview.conflictStatus === "update" && options.strategy === "copy")
  ) {
    const result = await createNewAsset({
      title: assetMeta.title,
      type: assetMeta.type as typeof assetMeta.type & "agent_skill",
      targetTool: assetMeta.targetTool as typeof assetMeta.targetTool & "codex",
      exportPreset: assetMeta.exportPreset as typeof assetMeta.exportPreset & "general_markdown",
      description: assetMeta.description ?? undefined,
      scenario: assetMeta.scenario ?? undefined,
      content: content || "",
      status: assetMeta.status as typeof assetMeta.status & "draft",
      visibility: assetMeta.visibility as typeof assetMeta.visibility & "private",
      source: "imported",
      sourceUrl: assetMeta.sourceUrl ?? undefined,
      sourceRef: assetMeta.sourceRef ?? undefined,
      sourcePath: assetMeta.sourcePath ?? undefined,
      sourceImportedAt: assetMeta.sourceImportedAt ?? nowTimestamp(),
      sourceChecksum: assetMeta.sourceChecksum ?? undefined,
      pinned: assetMeta.pinned,
      tagNames: assetMeta.tags,
    });

    return { assetId: result.asset.id, action: "created" };
  }

  if (
    (preview.conflictStatus === "update" || preview.conflictStatus === "conflict") &&
    options.strategy === "overwrite"
  ) {
    const existingId = preview.existingAsset!.id;

    await updateExistingAsset({
      id: existingId,
      title: assetMeta.title,
      type: assetMeta.type as typeof assetMeta.type & "agent_skill",
      targetTool: assetMeta.targetTool as typeof assetMeta.targetTool & "codex",
      exportPreset: assetMeta.exportPreset as typeof assetMeta.exportPreset & "general_markdown",
      description: assetMeta.description ?? undefined,
      scenario: assetMeta.scenario ?? undefined,
      content: content || "",
      status: assetMeta.status as typeof assetMeta.status & "draft",
      visibility: assetMeta.visibility as typeof assetMeta.visibility & "private",
      source: "imported",
      sourceUrl: assetMeta.sourceUrl ?? undefined,
      sourceRef: assetMeta.sourceRef ?? undefined,
      sourcePath: assetMeta.sourcePath ?? undefined,
      sourceImportedAt: assetMeta.sourceImportedAt ?? nowTimestamp(),
      sourceChecksum: assetMeta.sourceChecksum ?? undefined,
      pinned: assetMeta.pinned,
      tagNames: assetMeta.tags,
    });

    return { assetId: existingId, action: "updated" };
  }

  throw new Error(`无法处理的冲突状态: ${preview.conflictStatus} + ${options.strategy}`);
}
