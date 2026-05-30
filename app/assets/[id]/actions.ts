"use server";

import { getAssetById } from "@/server/services/asset-service";
import { checkGitHubSourceUpdate } from "@/server/services/github-import-service";

function isValidGitHubBlobUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "github.com" && /\/blob\//.test(parsed.pathname);
  } catch {
    return false;
  }
}

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
