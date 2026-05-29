"use server";

import { revalidatePath } from "next/cache";
import {
  archiveExistingAsset,
  createNewAsset,
  deleteExistingAsset,
  restoreExistingAsset,
  updateExistingAsset,
} from "@/server/services/asset-service";
import {
  createAssetSchema,
  updateAssetSchema,
} from "@/lib/validators/asset";

function parseFormData(formData: FormData) {
  const tagNamesRaw = formData.get("tagNames") as string | null;
  const tagNames = tagNamesRaw
    ? tagNamesRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : undefined;

  return {
    title: formData.get("title") as string,
    type: formData.get("type") as string,
    targetTool: formData.get("targetTool") as string,
    exportPreset: formData.get("exportPreset") as string,
    description: (formData.get("description") as string) || undefined,
    scenario: (formData.get("scenario") as string) || undefined,
    content: formData.get("content") as string,
    status: formData.get("status") as string | undefined,
    visibility: formData.get("visibility") as string | undefined,
    source: formData.get("source") as string | undefined,
    sourceUrl: (formData.get("sourceUrl") as string) || undefined,
    pinned: formData.get("pinned") === "true",
    tagNames,
  };
}

export async function createAssetAction(formData: FormData) {
  try {
    const parsed = createAssetSchema.safeParse(parseFormData(formData));
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors };
    }
    const asset = await createNewAsset(parsed.data);
    revalidatePath("/assets");
    return { success: true, asset };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create asset",
    };
  }
}

export async function updateAssetAction(id: string, formData: FormData) {
  try {
    const parsed = updateAssetSchema.safeParse({
      id,
      ...parseFormData(formData),
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors };
    }
    const asset = await updateExistingAsset(parsed.data);
    revalidatePath("/assets");
    revalidatePath(`/assets/${id}`);
    return { success: true, asset };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update asset",
    };
  }
}

export async function archiveAssetAction(id: string) {
  try {
    await archiveExistingAsset(id);
    revalidatePath("/assets");
    revalidatePath(`/assets/${id}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to archive asset",
    };
  }
}

export async function deleteAssetAction(id: string) {
  try {
    await deleteExistingAsset(id);
    revalidatePath("/assets");
    revalidatePath(`/assets/${id}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete asset",
    };
  }
}

export async function restoreAssetAction(id: string) {
  try {
    await restoreExistingAsset(id);
    revalidatePath("/assets");
    revalidatePath(`/assets/${id}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to restore asset",
    };
  }
}
