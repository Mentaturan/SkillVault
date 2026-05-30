import { findAllAssets } from "@/server/queries/asset-queries";
import { validateAssetContent } from "@/lib/validation";

export interface MaintenanceQueueItem {
  asset: Awaited<ReturnType<typeof findAllAssets>>[number];
  validation: ReturnType<typeof validateAssetContent>;
  priorityScore: number;
}

export interface DuplicateCandidate {
  asset1: { id: string; title: string; type: string; status: string; contentHash: string };
  asset2: { id: string; title: string; type: string; status: string; contentHash: string };
  reason: "content_hash" | "title_similarity";
  confidence: "high" | "medium";
}

function jaccardSimilarity(a: string, b: string): number {
  const tokenize = (s: string) =>
    new Set(s.toLowerCase().split(/\s+/).filter(Boolean));
  const setA = tokenize(a);
  const setB = tokenize(b);
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return intersection / union;
}

export async function findDuplicateCandidates(): Promise<DuplicateCandidate[]> {
  const assets = await findAllAssets({ includeArchived: true });
  const candidates: DuplicateCandidate[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < assets.length; i++) {
    for (let j = i + 1; j < assets.length; j++) {
      const a = assets[i];
      const b = assets[j];
      const pairKey = [a.id, b.id].sort().join("|");
      if (seen.has(pairKey)) continue;

      if (a.contentHash === b.contentHash) {
        seen.add(pairKey);
        candidates.push({
          asset1: { id: a.id, title: a.title, type: a.type, status: a.status, contentHash: a.contentHash },
          asset2: { id: b.id, title: b.title, type: b.type, status: b.status, contentHash: b.contentHash },
          reason: "content_hash",
          confidence: "high",
        });
        continue;
      }

      const similarity = jaccardSimilarity(a.title, b.title);
      if (similarity >= 0.5) {
        seen.add(pairKey);
        candidates.push({
          asset1: { id: a.id, title: a.title, type: a.type, status: a.status, contentHash: a.contentHash },
          asset2: { id: b.id, title: b.title, type: b.type, status: b.status, contentHash: b.contentHash },
          reason: "title_similarity",
          confidence: "medium",
        });
      }
    }
  }

  return candidates;
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
