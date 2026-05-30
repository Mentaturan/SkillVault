"use server";

import { getAssetById } from "@/server/services/asset-service";
import { checkGitHubSourceUpdate } from "@/server/services/github-import-service";

export async function checkSourceUpdateAction(assetId: string) {
  const asset = await getAssetById(assetId);

  if (!asset) {
    return { success: false as const, error: "资产不存在" };
  }

  if (!asset.sourceUrl || !asset.sourceChecksum) {
    return { success: false as const, error: "资产缺少来源链接或来源校验和" };
  }

  const isGitHubUrl =
    asset.sourceUrl.includes("github.com") &&
    asset.sourceUrl.includes("/blob/");

  if (!isGitHubUrl) {
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
