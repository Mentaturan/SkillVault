"use server";

import { revalidatePath } from "next/cache";

import { recordAssetUseSchema } from "@/lib/validators/asset-use";
import {
  createAssetSchema,
  updateAssetSchema,
} from "@/lib/validators/asset";
import {
  archiveExistingAsset,
  createNewAsset,
  deleteExistingAsset,
  markAssetAsUsed,
  restoreExistingAsset,
  rollbackAssetToVersion,
  updateExistingAsset,
} from "@/server/services/asset-service";

function parseFormData(formData: FormData) {
  const tagNamesRaw = formData.get("tagNames") as string | null;
  const reviewDueAtRaw = (formData.get("reviewDueAt") as string | null)?.trim();
  const tagNames = tagNamesRaw
    ? tagNamesRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : undefined;
  const reviewDueAt = reviewDueAtRaw
    ? new Date(`${reviewDueAtRaw}T00:00:00`).getTime()
    : undefined;

  return {
    title: formData.get("title") as string,
    type: formData.get("type") as string,
    targetTool: formData.get("targetTool") as string,
    exportPreset: formData.get("exportPreset") as string,
    description: (formData.get("description") as string) || undefined,
    scenario: (formData.get("scenario") as string) || undefined,
    content: formData.get("content") as string,
    status: (formData.get("status") as string) || undefined,
    reviewDueAt,
    visibility: (formData.get("visibility") as string) || undefined,
    source: (formData.get("source") as string) || undefined,
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
    const result = await createNewAsset(parsed.data);
    revalidatePath("/assets");
    return { success: true, asset: result.asset, duplicateWarning: result.duplicateWarning };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "创建资产失败",
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
      error: error instanceof Error ? error.message : "更新资产失败",
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
      error: error instanceof Error ? error.message : "归档资产失败",
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
      error: error instanceof Error ? error.message : "删除资产失败",
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
      error: error instanceof Error ? error.message : "恢复资产失败",
    };
  }
}

export async function rollbackAssetAction(id: string, versionId: string) {
  try {
    await rollbackAssetToVersion(id, versionId);
    revalidatePath("/assets");
    revalidatePath(`/assets/${id}`);
    revalidatePath(`/assets/${id}/versions`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "回滚资产失败",
    };
  }
}

export async function recordAssetUseAction(input: unknown) {
  const parsed = recordAssetUseSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      error: "使用记录参数无效",
    };
  }

  try {
    await markAssetAsUsed(parsed.data.assetId);
    revalidatePath("/assets");
    revalidatePath(`/assets/${parsed.data.assetId}`);

    return {
      success: true as const,
      kind: parsed.data.kind,
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "记录使用时间失败",
    };
  }
}
