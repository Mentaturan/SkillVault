import { createId } from "@/lib/id";
import { createContentHash } from "@/lib/hash";
import { createSlug } from "@/lib/slug";
import { nowTimestamp } from "@/lib/time";
import {
  findAssetById,
  findAssetByContentHash,
  findAllAssets,
  createAsset,
  updateAsset,
  updateAssetLastUsedAt,
  softDeleteAsset,
  restoreAsset,
  archiveAsset,
} from "@/server/queries/asset-queries";
import { syncAssetTags } from "@/server/services/tag-service";
import { findAssetIdsWithTestCases } from "@/server/queries/test-case-queries";
import {
  createInitialVersion,
  createNewVersion,
  getVersionById,
} from "@/server/services/version-service";
import type { CreateAssetInput, UpdateAssetInput } from "@/lib/validators/asset";
import type { AssetStateFilter, LifecycleFilter } from "@/lib/constants";
import type { FindAllAssetsOptions } from "@/server/queries/asset-queries";
import { validateAssetContent } from "@/lib/validation";

export async function getAssetById(id: string) {
  return findAssetById(id);
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

async function filterAssetsByState<T extends Awaited<ReturnType<typeof findAllAssets>>>(
  assets: T,
  stateFilter: AssetStateFilter,
) {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const staleThreshold = startOfToday() + dayMs;

  switch (stateFilter) {
    case "stale":
      return assets.filter(
        (asset) => asset.reviewDueAt !== null && asset.reviewDueAt < staleThreshold,
      ) as T;
    case "recently_used":
      return assets.filter(
        (asset) => asset.lastUsedAt !== null && asset.lastUsedAt >= now - 30 * dayMs,
      ) as T;
    case "never_used":
      return assets.filter((asset) => asset.lastUsedAt === null) as T;
    case "low_rated":
      return assets.filter((asset) => asset.rating !== null && asset.rating <= 2) as T;
    case "untested": {
      const testedAssetIds = new Set(await findAssetIdsWithTestCases());
      return assets.filter((asset) => !testedAssetIds.has(asset.id)) as T;
    }
  }
}

async function filterAssetsByLifecycle<T extends Awaited<ReturnType<typeof findAllAssets>>>(
  assets: T,
  lifecycleFilters: LifecycleFilter[],
) {
  if (lifecycleFilters.length === 0) {
    return assets;
  }

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  let filtered = assets;

  for (const filter of lifecycleFilters) {
    switch (filter) {
      case "last_used_over_30d":
        filtered = filtered.filter(
          (asset) => asset.lastUsedAt === null || asset.lastUsedAt < now - 30 * dayMs,
        ) as typeof filtered;
        break;
      case "last_used_over_90d":
        filtered = filtered.filter(
          (asset) => asset.lastUsedAt === null || asset.lastUsedAt < now - 90 * dayMs,
        ) as typeof filtered;
        break;
      case "last_reviewed_over_30d":
        filtered = filtered.filter(
          (asset) => asset.updatedAt < now - 30 * dayMs,
        ) as typeof filtered;
        break;
      case "never_used":
        filtered = filtered.filter((asset) => asset.lastUsedAt === null) as typeof filtered;
        break;
      case "low_rated":
        filtered = filtered.filter(
          (asset) => asset.rating !== null && asset.rating <= 2,
        ) as typeof filtered;
        break;
      case "untested": {
        const testedAssetIds = new Set(await findAssetIdsWithTestCases());
        filtered = filtered.filter(
          (asset) => !testedAssetIds.has(asset.id),
        ) as typeof filtered;
        break;
      }
      case "has_validation_warnings":
        filtered = filtered.filter((asset) => {
          const result = validateAssetContent({
            title: asset.title,
            description: asset.description,
            content: asset.content,
            type: asset.type,
            exportPreset: asset.exportPreset,
          });
          return result.summary.warningCount > 0;
        }) as typeof filtered;
        break;
      case "review_overdue":
        filtered = filtered.filter(
          (asset) => asset.reviewDueAt !== null && asset.reviewDueAt < now,
        ) as typeof filtered;
        break;
    }
  }

  return filtered;
}

export async function getAssets(
  options?: FindAllAssetsOptions & { stateFilter?: AssetStateFilter; lifecycleFilters?: LifecycleFilter[] },
) {
  const assets = await findAllAssets(options);

  let result = assets;

  if (options?.stateFilter) {
    result = await filterAssetsByState(result, options.stateFilter);
  }

  if (options?.lifecycleFilters && options.lifecycleFilters.length > 0) {
    result = await filterAssetsByLifecycle(result, options.lifecycleFilters);
  }

  return result;
}

export async function createNewAsset(input: CreateAssetInput) {
  const id = createId();
  const syncId = createId();
  const slug = createSlug(input.title);
  const contentHash = createContentHash(input.content);
  const now = nowTimestamp();

  const duplicate = await findAssetByContentHash(contentHash);

  const asset = await createAsset({
    id,
    syncId,
    slug,
    title: input.title,
    type: input.type,
    targetTool: input.targetTool,
    exportPreset: input.exportPreset,
    description: input.description ?? null,
    scenario: input.scenario ?? null,
    content: input.content,
    contentHash,
    status: input.status ?? "draft",
    rating: input.rating ?? null,
    visibility: input.visibility ?? "private",
    source: input.source ?? "self_created",
    sourceUrl: input.sourceUrl ?? null,
    sourceRef: input.sourceRef ?? null,
    sourcePath: input.sourcePath ?? null,
    sourceImportedAt: input.sourceImportedAt ?? null,
    sourceChecksum: input.sourceChecksum ?? null,
    pinned: input.pinned ?? false,
    createdAt: now,
    updatedAt: now,
    reviewDueAt: input.reviewDueAt ?? null,
  });

  await createInitialVersion({
    assetId: asset.id,
    titleSnapshot: asset.title,
    contentSnapshot: asset.content,
    contentHash: asset.contentHash,
  });

  if (input.tagNames && input.tagNames.length > 0) {
    await syncAssetTags(asset.id, input.tagNames);
  }

  const duplicateWarning = duplicate
    ? `已存在内容相同的资产：${duplicate.title}`
    : undefined;

  return { asset, duplicateWarning };
}

export async function updateExistingAsset(input: UpdateAssetInput) {
  const existing = await findAssetById(input.id);
  if (!existing) {
    throw new Error("资产不存在");
  }

  const updates: Record<string, unknown> = {};
  let contentChanged = false;

  if (input.title !== undefined) {
    updates.title = input.title;
    updates.slug = createSlug(input.title);
  }

  if (input.type !== undefined) updates.type = input.type;
  if (input.targetTool !== undefined) updates.targetTool = input.targetTool;
  if (input.exportPreset !== undefined) updates.exportPreset = input.exportPreset;
  if (input.description !== undefined) updates.description = input.description;
  if (input.scenario !== undefined) updates.scenario = input.scenario;
  if (input.status !== undefined) updates.status = input.status;
  if (input.rating !== undefined) updates.rating = input.rating;
  if (input.reviewDueAt !== undefined) updates.reviewDueAt = input.reviewDueAt;
  if (input.visibility !== undefined) updates.visibility = input.visibility;
  if (input.source !== undefined) updates.source = input.source;
  if (input.sourceUrl !== undefined) updates.sourceUrl = input.sourceUrl;
  if (input.sourceRef !== undefined) updates.sourceRef = input.sourceRef;
  if (input.sourcePath !== undefined) updates.sourcePath = input.sourcePath;
  if (input.sourceImportedAt !== undefined) {
    updates.sourceImportedAt = input.sourceImportedAt;
  }
  if (input.sourceChecksum !== undefined) updates.sourceChecksum = input.sourceChecksum;
  if (input.pinned !== undefined) updates.pinned = input.pinned;

  if (input.content !== undefined) {
    const newHash = createContentHash(input.content);
    if (newHash !== existing.contentHash) {
      updates.content = input.content;
      updates.contentHash = newHash;
      contentChanged = true;
    }
  }

  const asset = await updateAsset(input.id, updates);

  if (contentChanged) {
    await createNewVersion({
      assetId: asset.id,
      titleSnapshot: asset.title,
      contentSnapshot: asset.content,
      contentHash: asset.contentHash,
    });
  }

  if (input.tagNames !== undefined) {
    await syncAssetTags(asset.id, input.tagNames);
  }

  return asset;
}

export async function rollbackAssetToVersion(assetId: string, versionId: string) {
  const existing = await findAssetById(assetId);
  if (!existing) {
    throw new Error("资产不存在");
  }

  const version = await getVersionById(versionId);
  if (!version || version.assetId !== assetId) {
    throw new Error("版本不存在");
  }

  const asset = await updateAsset(assetId, {
    title: version.titleSnapshot,
    slug: createSlug(version.titleSnapshot),
    content: version.contentSnapshot,
    contentHash: version.contentHash,
  });

  await createNewVersion({
    assetId: asset.id,
    titleSnapshot: asset.title,
    contentSnapshot: asset.content,
    contentHash: asset.contentHash,
    changeNote: `Rollback to version ${version.version}`,
  });

  return asset;
}

export async function markAssetAsUsed(assetId: string, usedAt = nowTimestamp()) {
  const existing = await findAssetById(assetId);
  if (!existing) {
    throw new Error("资产不存在");
  }

  return updateAssetLastUsedAt(assetId, usedAt);
}

export async function archiveExistingAsset(id: string) {
  const existing = await findAssetById(id);
  if (!existing) {
    throw new Error("资产不存在");
  }
  return archiveAsset(id);
}

export async function deleteExistingAsset(id: string) {
  const existing = await findAssetById(id);
  if (!existing) {
    throw new Error("资产不存在");
  }
  return softDeleteAsset(id);
}

export async function restoreExistingAsset(id: string) {
  const existing = await findAssetById(id);
  if (!existing) {
    throw new Error("资产不存在");
  }
  return restoreAsset(id);
}
