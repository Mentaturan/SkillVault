"use server";

import { revalidatePath } from "next/cache";

import { claudeCodeJsonlImportPathSchema } from "@/lib/validators/capture-import";
import {
  importClaudeCodeJsonlToInbox,
  previewClaudeCodeJsonlImport,
} from "@/server/services/claude-code-jsonl-import-service";

function parseSourcePath(sourcePath: string) {
  return claudeCodeJsonlImportPathSchema.safeParse({ sourcePath });
}

export async function previewClaudeCodeJsonlImportAction(sourcePath: string) {
  try {
    const parsed = parseSourcePath(sourcePath);
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors };
    }

    const preview = await previewClaudeCodeJsonlImport(parsed.data.sourcePath);
    return { success: true, preview };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "预览 Claude Code JSONL 失败",
    };
  }
}

export async function importClaudeCodeJsonlAction(sourcePath: string) {
  try {
    const parsed = parseSourcePath(sourcePath);
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors };
    }

    const result = await importClaudeCodeJsonlToInbox(parsed.data.sourcePath);
    revalidatePath("/inbox");

    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "导入 Claude Code JSONL 失败",
    };
  }
}
