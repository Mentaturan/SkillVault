import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  assetTags,
  assetVersions,
  assets,
  collectionAssets,
  collections,
  projectAssets,
  projects,
  tags,
  testCases,
  type NewAsset,
} from "@/db/schema";
import {
  backupBundleSchema,
  createBackupPayloadChecksum,
  restorePreviewSchema,
  type BackupBundle,
  type RestorePreview,
} from "@/lib/backup";
import { RESTORE_CONFLICT_STRATEGIES, type RestoreConflictStrategy } from "@/lib/constants";
import { createContentHash } from "@/lib/hash";
import { createId } from "@/lib/id";
import { parseMarkdownToAsset, type ParsedMarkdownAsset } from "@/lib/markdown";
import { getRestorePreviewContext } from "@/server/queries/restore-queries";

type ParsedRestoreAsset = {
  bundleAsset: BackupBundle["data"]["assets"][number];
  parsedMarkdown: ParsedMarkdownAsset;
};

type RestoreServiceError = { error: string };

type RestorePreviewResult = {
  bundle: BackupBundle;
  parsedAssets: Map<string, ParsedRestoreAsset>;
  preview: RestorePreview;
};

type RestoreExecutionResult = {
  preview: RestorePreview;
  result: {
    restoredAssets: number;
    skippedAssets: number;
    restoredCollections: number;
    restoredProjects: number;
  };
};

type ParsedBundleResult =
  | RestoreServiceError
  | {
      bundle: BackupBundle;
      checksumValid: boolean;
      checksumWarning: string | null;
    };

function parseBackupBundle(raw: string): ParsedBundleResult {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return { error: "备份文件不是合法 JSON" } satisfies RestoreServiceError;
  }

  const bundleResult = backupBundleSchema.safeParse(parsedJson);
  if (!bundleResult.success) {
    return {
      error: bundleResult.error.issues.map((issue) => issue.message).join("；"),
    } satisfies RestoreServiceError;
  }

  const bundle = bundleResult.data;
  const payloadChecksum = createBackupPayloadChecksum(bundle.data);
  const checksumValid = payloadChecksum === bundle.manifest.payloadChecksum;

  return {
    bundle,
    checksumValid,
      checksumWarning: checksumValid
      ? null
      : "payload checksum 与 manifest 不一致，恢复已阻止",
  };
}

function parseBundleAssets(bundle: BackupBundle) {
  const parsedAssets = new Map<string, ParsedRestoreAsset>();
  const errors: string[] = [];

  for (const asset of bundle.data.assets) {
    const parsed = parseMarkdownToAsset(asset.markdown);
    if ("error" in parsed) {
      errors.push(`资产 ${asset.metadata.title} 的 Markdown 解析失败：${parsed.error.message}`);
      continue;
    }

    const contentHash = createContentHash(parsed.data.content);
    if (contentHash !== asset.metadata.contentHash) {
      errors.push(`资产 ${asset.metadata.title} 的内容哈希与 manifest 不一致`);
      continue;
    }

    if (parsed.data.frontmatter.syncId !== asset.syncId) {
          errors.push(`资产 ${asset.metadata.title} 的 syncId 与 Markdown frontmatter 不一致`);
      continue;
    }

    parsedAssets.set(asset.syncId, {
      bundleAsset: asset,
      parsedMarkdown: parsed.data,
    });
  }

  return { parsedAssets, errors };
}

function getAssetAction(
  hasSyncConflict: boolean,
  strategy: RestoreConflictStrategy,
): RestorePreview["assets"][number]["action"] {
  if (!hasSyncConflict) {
    return "create";
  }

  if (strategy === "overwrite") {
    return "overwrite";
  }

  if (strategy === "copy") {
    return "copy";
  }

  return "skip";
}

export async function previewRestoreBundle(
  raw: string,
  strategy: RestoreConflictStrategy,
): Promise<RestoreServiceError | RestorePreviewResult> {
  if (!RESTORE_CONFLICT_STRATEGIES.includes(strategy)) {
    return { error: "无效的恢复冲突策略" };
  }

  const parsedBundle = parseBackupBundle(raw);
  if ("error" in parsedBundle) {
    return parsedBundle;
  }

  const { bundle, checksumValid, checksumWarning } = parsedBundle;
  const { parsedAssets, errors: assetParseErrors } = parseBundleAssets(bundle);
  const context = await getRestorePreviewContext();

  const errors = [...assetParseErrors];
  const assetsBySyncId = new Map(context.assets.map((asset) => [asset.syncId, asset]));
  const assetsBySlug = new Map<string, (typeof context.assets)[number][]>();
  const assetsByTitle = new Map<string, (typeof context.assets)[number][]>();
  const assetsByContentHash = new Map<string, (typeof context.assets)[number][]>();

  for (const asset of context.assets) {
    assetsBySlug.set(asset.slug, [...(assetsBySlug.get(asset.slug) ?? []), asset]);
    assetsByTitle.set(asset.title, [...(assetsByTitle.get(asset.title) ?? []), asset]);
    assetsByContentHash.set(asset.contentHash, [
      ...(assetsByContentHash.get(asset.contentHash) ?? []),
      asset,
    ]);
  }

  const assetPreviews = bundle.data.assets.map((asset) => {
    const existing = assetsBySyncId.get(asset.syncId) ?? null;
    const warnings: string[] = [];
    const slugCollisions = (assetsBySlug.get(asset.metadata.slug) ?? []).filter(
      (candidate) => candidate.syncId !== asset.syncId,
    );
    const titleCollisions = (assetsByTitle.get(asset.metadata.title) ?? []).filter(
      (candidate) => candidate.syncId !== asset.syncId,
    );
    const contentCollisions = (assetsByContentHash.get(asset.metadata.contentHash) ?? []).filter(
      (candidate) => candidate.syncId !== asset.syncId,
    );

    if (existing) {
      warnings.push(`syncId 已存在：${existing.title}`);
      if (existing.deletedAt) {
        warnings.push("目标资产当前处于软删除状态");
      }
    }

    if (slugCollisions.length > 0) {
      warnings.push(`slug 冲突：${slugCollisions[0].title}`);
    }

    if (titleCollisions.length > 0) {
      warnings.push(`标题重名：${titleCollisions[0].title}`);
    }

    if (contentCollisions.length > 0) {
      warnings.push(`内容重复：${contentCollisions[0].title}`);
    }

    return {
      syncId: asset.syncId,
      title: asset.metadata.title,
      action: getAssetAction(!!existing, strategy),
      targetAssetId: existing?.id ?? null,
      targetAssetTitle: existing?.title ?? null,
      warnings,
    };
  });

  for (const collection of bundle.data.collections) {
    for (const member of collection.members) {
      if (!parsedAssets.has(member.assetSyncId) && !assetsBySyncId.has(member.assetSyncId)) {
        errors.push(`集合 ${collection.name} 引用了缺失资产 ${member.assetSyncId}`);
      }
    }
  }

  for (const project of bundle.data.projects) {
    for (const member of project.members) {
      if (!parsedAssets.has(member.assetSyncId) && !assetsBySyncId.has(member.assetSyncId)) {
        errors.push(`项目 ${project.name} 引用了缺失资产 ${member.assetSyncId}`);
      }
    }
  }

  const collectionPreviews = bundle.data.collections.map((collection) => {
    const existing = context.collections.find((item) => item.name === collection.name);
    return {
      name: collection.name,
      action: existing ? "update" : "create",
      warnings: existing ? [`同名集合将被更新：${existing.name}`] : [],
    };
  });

  const projectPreviews = bundle.data.projects.map((project) => {
    const existing = context.projects.find((item) => item.name === project.name);
    return {
      name: project.name,
      action: existing ? "update" : "create",
      warnings: existing ? [`同名项目将被更新：${existing.name}`] : [],
    };
  });

  const preview = restorePreviewSchema.parse({
    manifest: bundle.manifest,
    checksumValid,
    checksumWarning,
    errors,
    summary: {
      createAssets: assetPreviews.filter((asset) => asset.action === "create").length,
      overwriteAssets: assetPreviews.filter((asset) => asset.action === "overwrite").length,
      copyAssets: assetPreviews.filter((asset) => asset.action === "copy").length,
      skipAssets: assetPreviews.filter((asset) => asset.action === "skip").length,
      createCollections: collectionPreviews.filter((item) => item.action === "create").length,
      updateCollections: collectionPreviews.filter((item) => item.action === "update").length,
      createProjects: projectPreviews.filter((item) => item.action === "create").length,
      updateProjects: projectPreviews.filter((item) => item.action === "update").length,
    },
    assets: assetPreviews,
    collections: collectionPreviews,
    projects: projectPreviews,
  });

  return {
    bundle,
    parsedAssets,
    preview,
  };
}

export async function restoreBackupBundle(
  raw: string,
  strategy: RestoreConflictStrategy,
): Promise<RestoreServiceError | RestoreExecutionResult> {
  const previewResult = await previewRestoreBundle(raw, strategy);
  if ("error" in previewResult) {
    return previewResult;
  }

  const { bundle, parsedAssets, preview } = previewResult;

  if (!preview.checksumValid) {
    return { error: preview.checksumWarning ?? "备份 checksum 校验失败" };
  }

  if (preview.errors.length > 0) {
    return { error: preview.errors.join("；") };
  }

  const context = await getRestorePreviewContext();
  const tagCreatedAtByName = new Map(
    bundle.data.tags.map((tag) => [tag.name, tag.createdAt]),
  );

  const result = db.transaction((tx) => {
    const assetIdBySyncId = new Map<string, string>();
    const existingCollectionByName = new Map(
      context.collections.map((collection) => [collection.name, collection]),
    );
    const existingProjectByName = new Map(
      context.projects.map((project) => [project.name, project]),
    );
    const existingTagByName = new Map(context.tags.map((tag) => [tag.name, tag.id]));

    for (const assetPreview of preview.assets) {
      const parsedAsset = parsedAssets.get(assetPreview.syncId);
      if (!parsedAsset) {
        throw new Error(`缺少资产 ${assetPreview.syncId} 的解析结果`);
      }

      const { bundleAsset, parsedMarkdown } = parsedAsset;
      const finalAssetId =
        assetPreview.action === "overwrite" || assetPreview.action === "skip"
          ? assetPreview.targetAssetId ?? createId()
          : createId();
      const finalSyncId =
        assetPreview.action === "copy" ? createId() : bundleAsset.syncId;
      const contentHash = createContentHash(parsedMarkdown.content);

      if (assetPreview.action === "skip") {
        if (!assetPreview.targetAssetId) {
          throw new Error(`无法跳过不存在的冲突资产 ${bundleAsset.metadata.title}`);
        }
        assetIdBySyncId.set(bundleAsset.syncId, assetPreview.targetAssetId);
        continue;
      }

      const assetRecord: Omit<NewAsset, "id"> = {
        syncId: finalSyncId,
        slug: bundleAsset.metadata.slug,
        title: bundleAsset.metadata.title,
        type: bundleAsset.metadata.type,
        targetTool: bundleAsset.metadata.targetTool,
        exportPreset: bundleAsset.metadata.exportPreset,
        description: bundleAsset.metadata.description,
        scenario: bundleAsset.metadata.scenario,
        content: parsedMarkdown.content,
        contentHash,
        status: bundleAsset.metadata.status,
        rating: bundleAsset.metadata.rating,
        visibility: bundleAsset.metadata.visibility,
        source: bundleAsset.metadata.source,
        sourceUrl: bundleAsset.metadata.sourceUrl,
        pinned: bundleAsset.metadata.pinned,
        createdAt: bundleAsset.metadata.createdAt,
        updatedAt: bundleAsset.metadata.updatedAt,
        lastUsedAt: bundleAsset.metadata.lastUsedAt,
        lastSyncedAt: bundleAsset.metadata.lastSyncedAt,
        deletedAt: bundleAsset.metadata.deletedAt,
      };

      if (assetPreview.action === "overwrite") {
        tx.update(assets)
          .set(assetRecord)
          .where(eq(assets.id, finalAssetId))
          .run();
        tx.delete(assetTags).where(eq(assetTags.assetId, finalAssetId)).run();
        tx.delete(testCases).where(eq(testCases.assetId, finalAssetId)).run();
        tx.delete(assetVersions).where(eq(assetVersions.assetId, finalAssetId)).run();
      } else {
        tx.insert(assets)
          .values({
            id: finalAssetId,
            ...assetRecord,
          })
          .run();
      }

      for (const tagName of bundleAsset.metadata.tagNames) {
        let tagId = existingTagByName.get(tagName);
        if (!tagId) {
          tagId = createId();
          tx.insert(tags)
            .values({
              id: tagId,
              name: tagName,
              createdAt: tagCreatedAtByName.get(tagName) ?? bundle.manifest.exportTimestamp,
            })
            .run();
          existingTagByName.set(tagName, tagId);
        }

        tx.insert(assetTags)
          .values({
            assetId: finalAssetId,
            tagId,
          })
          .run();
      }

      const versionIdByNumber = new Map<number, string>();
      for (const version of bundleAsset.versions) {
        const versionId = createId();
        versionIdByNumber.set(version.version, versionId);
        tx.insert(assetVersions)
          .values({
            id: versionId,
            assetId: finalAssetId,
            version: version.version,
            titleSnapshot: version.titleSnapshot,
            contentSnapshot: version.contentSnapshot,
            contentHash: version.contentHash,
            changeNote: version.changeNote,
            score: version.score,
            createdAt: version.createdAt,
          })
          .run();
      }

      for (const testCase of bundleAsset.testCases) {
        tx.insert(testCases)
          .values({
            id: createId(),
            assetId: finalAssetId,
            assetVersionId:
              testCase.assetVersion !== null
                ? versionIdByNumber.get(testCase.assetVersion) ?? null
                : null,
            kind: testCase.kind,
            title: testCase.title,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: testCase.actualOutput,
            evaluationCriteria: testCase.evaluationCriteria,
            score: testCase.score,
            note: testCase.note,
            createdAt: testCase.createdAt,
            updatedAt: testCase.updatedAt,
          })
          .run();
      }

      assetIdBySyncId.set(bundleAsset.syncId, finalAssetId);
    }

    for (const tag of bundle.data.tags) {
      if (!existingTagByName.has(tag.name)) {
        const tagId = createId();
        tx.insert(tags)
          .values({
            id: tagId,
            name: tag.name,
            createdAt: tag.createdAt,
          })
          .run();
        existingTagByName.set(tag.name, tagId);
      }
    }

    for (const collection of bundle.data.collections) {
      const existing = existingCollectionByName.get(collection.name);
      const collectionId = existing?.id ?? createId();

      if (existing) {
        tx.update(collections)
          .set({
            name: collection.name,
            description: collection.description,
            icon: collection.icon,
            color: collection.color,
            createdAt: collection.createdAt,
            updatedAt: collection.updatedAt,
          })
          .where(eq(collections.id, collectionId))
          .run();
        tx.delete(collectionAssets)
          .where(eq(collectionAssets.collectionId, collectionId))
          .run();
      } else {
        tx.insert(collections)
          .values({
            id: collectionId,
            name: collection.name,
            description: collection.description,
            icon: collection.icon,
            color: collection.color,
            createdAt: collection.createdAt,
            updatedAt: collection.updatedAt,
          })
          .run();
      }

      for (const member of collection.members) {
        const assetId = assetIdBySyncId.get(member.assetSyncId);
        if (!assetId) {
          continue;
        }

        tx.insert(collectionAssets)
          .values({
            collectionId,
            assetId,
            orderIndex: member.orderIndex,
            createdAt: member.createdAt,
          })
          .run();
      }
    }

    for (const project of bundle.data.projects) {
      const existing = existingProjectByName.get(project.name);
      const projectId = existing?.id ?? createId();

      if (existing) {
        tx.update(projects)
          .set({
            name: project.name,
            description: project.description,
            path: project.path,
            icon: project.icon,
            color: project.color,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
          })
          .where(eq(projects.id, projectId))
          .run();
        tx.delete(projectAssets).where(eq(projectAssets.projectId, projectId)).run();
      } else {
        tx.insert(projects)
          .values({
            id: projectId,
            name: project.name,
            description: project.description,
            path: project.path,
            icon: project.icon,
            color: project.color,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
          })
          .run();
      }

      for (const member of project.members) {
        const assetId = assetIdBySyncId.get(member.assetSyncId);
        if (!assetId) {
          continue;
        }

        tx.insert(projectAssets)
          .values({
            projectId,
            assetId,
            orderIndex: member.orderIndex,
            createdAt: member.createdAt,
          })
          .run();
      }
    }

    return {
      restoredAssets: preview.assets.length - preview.summary.skipAssets,
      skippedAssets: preview.summary.skipAssets,
      restoredCollections: bundle.data.collections.length,
      restoredProjects: bundle.data.projects.length,
    };
  });

  return { preview, result };
}
