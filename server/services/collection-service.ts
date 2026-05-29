import { createId } from "@/lib/id";
import { nowTimestamp } from "@/lib/time";
import {
  findAllCollections,
  findCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  addAssetToCollection,
  removeAssetFromCollection,
  reorderCollectionAssets,
  getMaxOrderIndex,
} from "@/server/queries/collection-queries";
import type { CreateCollectionInput, UpdateCollectionInput } from "@/lib/validators/collection";

export async function getAllCollections() {
  return findAllCollections();
}

export async function getCollectionById(id: string) {
  return findCollectionById(id);
}

export async function createNewCollection(input: CreateCollectionInput) {
  const id = createId();
  const now = nowTimestamp();

  const collection = await createCollection({
    id,
    name: input.name,
    description: input.description ?? null,
    icon: input.icon ?? null,
    color: input.color ?? null,
    createdAt: now,
    updatedAt: now,
  });

  return collection;
}

export async function updateExistingCollection(input: UpdateCollectionInput) {
  const { id, ...updates } = input;
  const data: Record<string, unknown> = {};
  if (updates.name !== undefined) data.name = updates.name;
  if (updates.description !== undefined) data.description = updates.description;
  if (updates.icon !== undefined) data.icon = updates.icon;
  if (updates.color !== undefined) data.color = updates.color;

  return updateCollection(id, data);
}

export async function deleteExistingCollection(id: string) {
  const existing = await findCollectionById(id);
  if (!existing) {
    throw new Error("集合不存在");
  }
  return deleteCollection(id);
}

export async function addAssetToExistingCollection(collectionId: string, assetId: string) {
  const maxOrder = await getMaxOrderIndex(collectionId);
  return addAssetToCollection(collectionId, assetId, maxOrder + 1);
}

export async function removeAssetFromExistingCollection(collectionId: string, assetId: string) {
  return removeAssetFromCollection(collectionId, assetId);
}

export async function reorderAssets(collectionId: string, assetOrders: Array<{ assetId: string; orderIndex: number }>) {
  return reorderCollectionAssets(collectionId, assetOrders);
}
