"use server";

import { codexRolloutScanPathSchema } from "@/lib/validators/capture-import";
import { scanCodexRolloutDirectory } from "@/server/services/codex-rollout-scan-service";

export async function scanCodexRolloutDirectoryAction(directoryPath: string) {
  try {
    const parsed = codexRolloutScanPathSchema.safeParse({ directoryPath });
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors };
    }

    const result = await scanCodexRolloutDirectory(parsed.data.directoryPath);
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "扫描 Codex rollout 目录失败",
    };
  }
}
