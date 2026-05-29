"use server";

import { revalidatePath } from "next/cache";
import {
  createNewCollection,
  updateExistingCollection,
  deleteExistingCollection,
  addAssetToExistingCollection,
  removeAssetFromExistingCollection,
  reorderAssets,
} from "@/server/services/collection-service";
import {
  createCollectionSchema,
  updateCollectionSchema,
} from "@/lib/validators/collection";

export async function createCollectionAction(formData: FormData) {
  try {
    const parsed = createCollectionSchema.safeParse({
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
      icon: (formData.get("icon") as string) || undefined,
      color: (formData.get("color") as string) || undefined,
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors };
    }
    const collection = await createNewCollection(parsed.data);
    revalidatePath("/collections");
    return { success: true, collection };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "创建集合失败",
    };
  }
}

export async function updateCollectionAction(id: string, formData: FormData) {
  try {
    const parsed = updateCollectionSchema.safeParse({
      id,
      name: (formData.get("name") as string) || undefined,
      description: (formData.get("description") as string) || undefined,
      icon: (formData.get("icon") as string) || undefined,
      color: (formData.get("color") as string) || undefined,
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors };
    }
    const collection = await updateExistingCollection(parsed.data);
    revalidatePath("/collections");
    revalidatePath(`/collections/${id}`);
    return { success: true, collection };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "更新集合失败",
    };
  }
}

export async function deleteCollectionAction(id: string) {
  try {
    await deleteExistingCollection(id);
    revalidatePath("/collections");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "删除集合失败",
    };
  }
}

export async function addAssetToCollectionAction(collectionId: string, assetId: string) {
  try {
    await addAssetToExistingCollection(collectionId, assetId);
    revalidatePath(`/collections/${collectionId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "添加资产失败",
    };
  }
}

export async function removeAssetFromCollectionAction(collectionId: string, assetId: string) {
  try {
    await removeAssetFromExistingCollection(collectionId, assetId);
    revalidatePath(`/collections/${collectionId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "移除资产失败",
    };
  }
}

export async function reorderCollectionAssetsAction(
  collectionId: string,
  assetOrders: Array<{ assetId: string; orderIndex: number }>,
) {
  try {
    await reorderAssets(collectionId, assetOrders);
    revalidatePath(`/collections/${collectionId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "排序失败",
    };
  }
}
