"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { RestoreConflictStrategy } from "@/lib/constants";
import { previewRestoreBundle, restoreBackupBundle } from "@/server/services/restore-service";

const restoreSchema = z.object({
  raw: z.string().min(1).max(50_000_000),
  strategy: z.enum(["skip", "overwrite", "copy"]),
});

export async function previewRestoreAction(
  raw: string,
  strategy: RestoreConflictStrategy,
) {
  try {
    restoreSchema.parse({ raw, strategy });
    const result = await previewRestoreBundle(raw, strategy);
    if ("error" in result) {
      return { success: false, error: result.error };
    }

    return { success: true, preview: result.preview };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "恢复预览失败",
    };
  }
}

export async function restoreBackupAction(
  raw: string,
  strategy: RestoreConflictStrategy,
) {
  try {
    restoreSchema.parse({ raw, strategy });
    const result = await restoreBackupBundle(raw, strategy);
    if ("error" in result) {
      return { success: false, error: result.error };
    }

    revalidatePath("/");
    revalidatePath("/assets");
    revalidatePath("/collections");
    revalidatePath("/projects");
    revalidatePath("/settings");

    return { success: true, preview: result.preview, result: result.result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "恢复失败",
    };
  }
}
