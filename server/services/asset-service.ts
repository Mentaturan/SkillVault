import { createId } from "@/lib/id";
import { createContentHash } from "@/lib/hash";
import { createSlug } from "@/lib/slug";
import { nowTimestamp } from "@/lib/time";
import {
  findAssetById,
  findAllAssets,
  createAsset,
  updateAsset,
  softDeleteAsset,
  restoreAsset,
  archiveAsset,
} from "@/server/queries/asset-queries";
import { syncAssetTags } from "@/server/services/tag-service";
import { createInitialVersion } from "@/server/services/version-service";
import type { CreateAssetInput, UpdateAssetInput } from "@/lib/validators/asset";

export async function getAssetById(id: string) {
  return findAssetById(id);
}

export async function getAssets(options?: Parameters<typeof findAllAssets>[0]) {
  return findAllAssets(options);
}

export async function createNewAsset(input: CreateAssetInput) {
  const id = createId();
  const syncId = createId();
  const slug = createSlug(input.title);
  const contentHash = createContentHash(input.content);
  const now = nowTimestamp();

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
    pinned: input.pinned ?? false,
    createdAt: now,
    updatedAt: now,
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

  return asset;
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
  if (input.visibility !== undefined) updates.visibility = input.visibility;
  if (input.source !== undefined) updates.source = input.source;
  if (input.sourceUrl !== undefined) updates.sourceUrl = input.sourceUrl;
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
    const { createNewVersion } = await import("@/server/services/version-service");
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
