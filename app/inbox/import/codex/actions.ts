"use server";

import { revalidatePath } from "next/cache";

import { codexRolloutImportPathSchema } from "@/lib/validators/capture-import";
import {
  importCodexRolloutToInbox,
  previewCodexRolloutImport,
} from "@/server/services/capture-import-service";

function parseSourcePath(sourcePath: string) {
  return codexRolloutImportPathSchema.safeParse({ sourcePath });
}

export async function previewCodexRolloutImportAction(sourcePath: string) {
  try {
    const parsed = parseSourcePath(sourcePath);
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors };
    }

    const preview = await previewCodexRolloutImport(parsed.data.sourcePath);
    return { success: true, preview };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "预览 Codex rollout 失败",
    };
  }
}

export async function importCodexRolloutAction(sourcePath: string) {
  try {
    const parsed = parseSourcePath(sourcePath);
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors };
    }

    const result = await importCodexRolloutToInbox(parsed.data.sourcePath);
    revalidatePath("/inbox");

    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "导入 Codex rollout 失败",
    };
  }
}
