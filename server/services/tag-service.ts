import { createId } from "@/lib/id";
import {
  findOrCreateTag,
  findTagsByAssetId,
  bindTagToAsset,
  unbindTagFromAsset,
  findAllTags,
} from "@/server/queries/tag-queries";
import { syncAssetFts } from "@/server/services/fts-service";

export async function getTagsByAssetId(assetId: string) {
  return findTagsByAssetId(assetId);
}

export async function getAllTags() {
  return findAllTags();
}

export async function addTagToAsset(assetId: string, tagName: string) {
  const tagId = createId();
  const tag = await findOrCreateTag(tagName.trim().toLowerCase(), tagId);
  await bindTagToAsset(assetId, tag.id);
  syncAssetFts(assetId);
  return tag;
}

export async function removeTagFromAsset(assetId: string, tagId: string) {
  await unbindTagFromAsset(assetId, tagId);
  syncAssetFts(assetId);
}

export async function syncAssetTags(assetId: string, tagNames: string[]) {
  const currentTags = await findTagsByAssetId(assetId);
  const currentNames = new Set(currentTags.map((t) => t.name));
  const desiredNames = new Set(
    tagNames.map((n) => n.trim().toLowerCase()).filter(Boolean),
  );

  for (const tagName of desiredNames) {
    if (!currentNames.has(tagName)) {
      const tagId = createId();
      const tag = await findOrCreateTag(tagName, tagId);
      await bindTagToAsset(assetId, tag.id);
    }
  }

  for (const currentTag of currentTags) {
    if (!desiredNames.has(currentTag.name)) {
      await unbindTagFromAsset(assetId, currentTag.id);
    }
  }

  syncAssetFts(assetId);
}
