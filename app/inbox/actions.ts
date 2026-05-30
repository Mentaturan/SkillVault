"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { DEFAULT_ASSET_VALUES } from "@/lib/constants";
import { createAssetSchema } from "@/lib/validators/asset";
import { createCaptureInboxItemSchema } from "@/lib/validators/capture-inbox";
import { createNewAsset } from "@/server/services/asset-service";
import {
  createNewCaptureInboxItem,
  getCaptureInboxItemById,
  updateExistingCaptureInboxItem,
} from "@/server/services/capture-inbox-service";

function parseSourceTimestamp(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? undefined : timestamp;
}

function parseFormData(formData: FormData) {
  return {
    title: formData.get("title") as string,
    rawContent: formData.get("rawContent") as string,
    sourceType: "manual" as const,
    sourcePath: (formData.get("sourcePath") as string) || undefined,
    sourceTimestamp: parseSourceTimestamp(formData.get("sourceTimestamp")),
    extractionNote: (formData.get("extractionNote") as string) || undefined,
  };
}

export async function createCaptureInboxItemAction(formData: FormData) {
  try {
    const parsed = createCaptureInboxItemSchema.safeParse(parseFormData(formData));
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
    }

    const item = await createNewCaptureInboxItem(parsed.data);
    revalidatePath("/inbox");

    return { success: true, item };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "创建 capture inbox 项失败",
    };
  }
}

function parseConvertFormData(formData: FormData) {
  return {
    title: formData.get("title") as string,
    type: (formData.get("type") as string) || DEFAULT_ASSET_VALUES.type,
    targetTool:
      (formData.get("targetTool") as string) || DEFAULT_ASSET_VALUES.targetTool,
    exportPreset:
      (formData.get("exportPreset") as string) || DEFAULT_ASSET_VALUES.exportPreset,
    description: (formData.get("description") as string) || undefined,
    scenario: (formData.get("scenario") as string) || undefined,
    content: formData.get("content") as string,
    status: (formData.get("status") as string) || DEFAULT_ASSET_VALUES.status,
    visibility:
      (formData.get("visibility") as string) || DEFAULT_ASSET_VALUES.visibility,
    pinned: false,
    source: "captured" as const,
  };
}

export async function convertCaptureInboxItemToAssetAction(
  inboxId: string,
  formData: FormData,
) {
  try {
    const inboxItem = await getCaptureInboxItemById(inboxId);
    if (!inboxItem) {
      return { success: false, error: "Capture inbox 项不存在" };
    }

    if (inboxItem.convertedAssetId) {
      redirect(`/assets/${inboxItem.convertedAssetId}`);
    }

    const parsed = createAssetSchema.safeParse(parseConvertFormData(formData));
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
    }

    const result = await createNewAsset(parsed.data);
    await updateExistingCaptureInboxItem({
      id: inboxId,
      status: "converted",
      convertedAssetId: result.asset.id,
    });

    revalidatePath("/assets");
    revalidatePath("/inbox");
    revalidatePath(`/inbox/${inboxId}/convert`);

    return { success: true, assetId: result.asset.id };
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "转换为资产失败",
    };
  }
}
