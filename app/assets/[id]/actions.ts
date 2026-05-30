"use server";

import { z } from "zod";
import { getAssetById } from "@/server/services/asset-service";
import { checkGitHubSourceUpdate } from "@/server/services/github-import-service";
import { exportExchangeBundle } from "@/server/services/exchange-service";

function isValidGitHubBlobUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "github.com" && /\/blob\//.test(parsed.pathname);
  } catch {
    return false;
  }
}

const exportExchangeSchema = z.object({
  assetId: z.string().min(1),
  outputDir: z.string().min(1),
});

export async function checkSourceUpdateAction(assetId: string) {
  const asset = await getAssetById(assetId);

  if (!asset) {
    return { success: false as const, error: "资产不存在" };
  }

  if (!asset.sourceUrl || !asset.sourceChecksum) {
    return { success: false as const, error: "资产缺少来源链接或来源校验和" };
  }

  if (!isValidGitHubBlobUrl(asset.sourceUrl)) {
    return { success: false as const, error: "仅支持 GitHub 来源的更新检查" };
  }

  try {
    const result = await checkGitHubSourceUpdate(
      asset.sourceUrl,
      asset.sourceChecksum,
    );

    return {
      success: true as const,
      data: {
        hasUpdate: result.hasUpdate,
        remoteChecksum: result.remoteChecksum,
      },
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "来源检查失败";
    return { success: false as const, error: message };
  }
}

export async function exportExchangeBundleAction(
  assetId: string,
  outputDir: string,
) {
  try {
    const parsed = exportExchangeSchema.safeParse({ assetId, outputDir });
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors };
    }

    const result = await exportExchangeBundle({
      assetId: parsed.data.assetId,
      outputDir: parsed.data.outputDir,
    });

    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "导出交换包失败",
    };
  }
}
