"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  importExchangePreview,
  executeExchangeImport,
} from "@/server/services/exchange-service";

const previewSchema = z.object({
  bundleDir: z.string().min(1),
});

const executeSchema = z.object({
  bundleDir: z.string().min(1),
  strategy: z.enum(["overwrite", "copy", "skip"]),
  reimport: z.boolean().optional(),
});

export async function previewExchangeImportAction(bundleDir: string) {
  try {
    const parsed = previewSchema.safeParse({ bundleDir });
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors };
    }

    const result = await importExchangePreview(parsed.data.bundleDir);
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "预览交换包导入失败",
    };
  }
}

export async function executeExchangeImportAction(
  bundleDir: string,
  strategy: "overwrite" | "copy" | "skip",
  reimport?: boolean,
) {
  try {
    const parsed = executeSchema.safeParse({ bundleDir, strategy, reimport });
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors };
    }

    const result = await executeExchangeImport(parsed.data.bundleDir, {
      strategy: parsed.data.strategy,
      reimport: parsed.data.reimport,
    });

    revalidatePath("/assets");
    revalidatePath("/import");

    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "执行交换包导入失败",
    };
  }
}
