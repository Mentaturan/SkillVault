import { findAllAssets } from "@/server/queries/asset-queries";
import { validateAssetContent } from "@/lib/validation";

export interface MaintenanceQueueItem {
  asset: Awaited<ReturnType<typeof findAllAssets>>[number];
  validation: ReturnType<typeof validateAssetContent>;
  priorityScore: number;
}

export async function getAssetMaintenanceQueue() {
  const assets = await findAllAssets({
    includeArchived: true,
  });

  const duplicateTitleCounts = new Map<string, number>();
  for (const asset of assets) {
    duplicateTitleCounts.set(asset.title, (duplicateTitleCounts.get(asset.title) ?? 0) + 1);
  }

  const items: MaintenanceQueueItem[] = assets
    .map((asset) => {
      const duplicateNameCount = Math.max((duplicateTitleCounts.get(asset.title) ?? 1) - 1, 0);
      const validation = validateAssetContent({
        title: asset.title,
        description: asset.description,
        content: asset.content,
        type: asset.type,
        exportPreset: asset.exportPreset,
        duplicateNameCount,
      });

      return {
        asset,
        validation,
        priorityScore: validation.summary.errorCount * 100 + validation.summary.warningCount,
      };
    })
    .filter(
      (item) =>
        item.validation.summary.errorCount > 0 || item.validation.summary.warningCount > 0,
    )
    .sort((left, right) => {
      if (right.priorityScore !== left.priorityScore) {
        return right.priorityScore - left.priorityScore;
      }

      return right.asset.updatedAt - left.asset.updatedAt;
    });

  return {
    items,
    summary: {
      scannedAssetCount: assets.length,
      flaggedAssetCount: items.length,
      errorAssetCount: items.filter((item) => item.validation.summary.errorCount > 0).length,
      warningOnlyAssetCount: items.filter(
        (item) =>
          item.validation.summary.errorCount === 0 &&
          item.validation.summary.warningCount > 0,
      ).length,
    },
  };
}
