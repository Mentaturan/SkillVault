import { createId } from "@/lib/id";
import { nowTimestamp } from "@/lib/time";
import { findAssetById, archiveAsset, updateAsset } from "@/server/queries/asset-queries";
import { createBatchAuditLog } from "@/server/queries/batch-queries";
import { syncAssetTags } from "@/server/services/tag-service";

export async function previewBatchArchive(assetIds: string[]) {
  const items = [];
  for (const id of assetIds) {
    const asset = await findAssetById(id);
    if (asset) {
      items.push({ id: asset.id, title: asset.title, status: asset.status });
    }
  }
  return { items, totalCount: items.length };
}

export async function executeBatchArchive(assetIds: string[]) {
  let archivedCount = 0;
  for (const id of assetIds) {
    const asset = await findAssetById(id);
    if (asset) {
      await archiveAsset(id);
      archivedCount++;
    }
  }
  const auditLogId = createId();
  await createBatchAuditLog({
    id: auditLogId,
    actionType: "archive",
    assetIds: JSON.stringify(assetIds),
    performedAt: nowTimestamp(),
    snapshotSummary: `Archived ${archivedCount} assets`,
  });
  return { archivedCount, auditLogId };
}

export async function previewBatchRetag(assetIds: string[], addTagNames: string[], removeTagNames: string[]) {
  const items = [];
  for (const id of assetIds) {
    const asset = await findAssetById(id);
    if (asset) {
      const currentTags = (asset.assetTags ?? []).map((at) => at.tag.name);
      const afterTags = [
        ...currentTags.filter((t) => !removeTagNames.includes(t)),
        ...addTagNames.filter((t) => !currentTags.includes(t)),
      ];
      items.push({
        id: asset.id,
        title: asset.title,
        currentTags,
        afterTags,
      });
    }
  }
  return { items, totalCount: items.length };
}

export async function executeBatchRetag(assetIds: string[], addTagNames: string[], removeTagNames: string[]) {
  let updatedCount = 0;
  for (const id of assetIds) {
    const asset = await findAssetById(id);
    if (asset) {
      const currentTags = (asset.assetTags ?? []).map((at) => at.tag.name);
      const afterTags = [
        ...currentTags.filter((t) => !removeTagNames.includes(t)),
        ...addTagNames.filter((t) => !currentTags.includes(t)),
      ];
      await syncAssetTags(id, afterTags);
      updatedCount++;
    }
  }
  const auditLogId = createId();
  await createBatchAuditLog({
    id: auditLogId,
    actionType: "retag",
    assetIds: JSON.stringify(assetIds),
    performedAt: nowTimestamp(),
    snapshotSummary: `Retagged ${updatedCount} assets (add: [${addTagNames.join(", ")}], remove: [${removeTagNames.join(", ")}])`,
  });
  return { updatedCount, auditLogId };
}

export async function previewBatchRate(assetIds: string[], rating: number) {
  const items = [];
  for (const id of assetIds) {
    const asset = await findAssetById(id);
    if (asset) {
      items.push({
        id: asset.id,
        title: asset.title,
        currentRating: asset.rating,
        proposedRating: rating,
      });
    }
  }
  return { items, totalCount: items.length };
}

export async function executeBatchRate(assetIds: string[], rating: number) {
  let updatedCount = 0;
  for (const id of assetIds) {
    const asset = await findAssetById(id);
    if (asset) {
      await updateAsset(id, { rating });
      updatedCount++;
    }
  }
  const auditLogId = createId();
  await createBatchAuditLog({
    id: auditLogId,
    actionType: "rate",
    assetIds: JSON.stringify(assetIds),
    performedAt: nowTimestamp(),
    snapshotSummary: `Rated ${updatedCount} assets to ${rating}`,
  });
  return { updatedCount, auditLogId };
}

export async function previewBatchReviewDate(assetIds: string[], reviewDueAt: number | null) {
  const items = [];
  for (const id of assetIds) {
    const asset = await findAssetById(id);
    if (asset) {
      items.push({
        id: asset.id,
        title: asset.title,
        currentReviewDueAt: asset.reviewDueAt,
        proposedReviewDueAt: reviewDueAt,
      });
    }
  }
  return { items, totalCount: items.length };
}

export async function executeBatchReviewDate(assetIds: string[], reviewDueAt: number | null) {
  let updatedCount = 0;
  for (const id of assetIds) {
    const asset = await findAssetById(id);
    if (asset) {
      await updateAsset(id, { reviewDueAt });
      updatedCount++;
    }
  }
  const auditLogId = createId();
  await createBatchAuditLog({
    id: auditLogId,
    actionType: "review_date",
    assetIds: JSON.stringify(assetIds),
    performedAt: nowTimestamp(),
    snapshotSummary: `Set review date for ${updatedCount} assets to ${reviewDueAt !== null ? new Date(reviewDueAt).toISOString() : "null"}`,
  });
  return { updatedCount, auditLogId };
}
