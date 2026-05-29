import { createId } from "@/lib/id";
import {
  findOrCreateTag,
  findTagsByAssetId,
  bindTagToAsset,
  unbindTagFromAsset,
  unbindAllTagsFromAsset,
} from "@/server/queries/tag-queries";

export async function getTagsByAssetId(assetId: string) {
  return findTagsByAssetId(assetId);
}

export async function addTagToAsset(assetId: string, tagName: string) {
  const tagId = createId();
  const tag = await findOrCreateTag(tagName.trim().toLowerCase(), tagId);
  await bindTagToAsset(assetId, tag.id);
  return tag;
}

export async function removeTagFromAsset(assetId: string, tagId: string) {
  await unbindTagFromAsset(assetId, tagId);
}

export async function syncAssetTags(assetId: string, tagNames: string[]) {
  await unbindAllTagsFromAsset(assetId);

  for (const name of tagNames) {
    if (name.trim()) {
      const tagId = createId();
      const tag = await findOrCreateTag(name.trim().toLowerCase(), tagId);
      await bindTagToAsset(assetId, tag.id);
    }
  }
}
