"use server";

import { revalidatePath } from "next/cache";

import { recordAssetUseSchema } from "@/lib/validators/asset-use";
import { markAssetAsUsed } from "@/server/services/asset-service";

export async function recordAssetUseAction(input: unknown) {
  const parsed = recordAssetUseSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      message: "使用记录参数无效",
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
      message: error instanceof Error ? error.message : "记录使用时间失败",
    };
  }
}
