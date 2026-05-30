"use server";

import { claudeCodeJsonlScanPathSchema } from "@/lib/validators/capture-import";
import { scanClaudeCodeJsonlDirectory } from "@/server/services/claude-code-jsonl-scan-service";

export async function scanClaudeCodeDirectoryAction(directoryPath: string) {
  try {
    const parsed = claudeCodeJsonlScanPathSchema.safeParse({ directoryPath });
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors };
    }

    const result = await scanClaudeCodeJsonlDirectory(parsed.data.directoryPath);
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "扫描 Claude Code 目录失败",
    };
  }
}
