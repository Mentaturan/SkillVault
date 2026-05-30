"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createId } from "@/lib/id";
import { nowTimestamp } from "@/lib/time";
import { archiveAsset } from "@/server/queries/asset-queries";
import { createBatchAuditLog, findBatchAuditLogs } from "@/server/queries/batch-queries";
import { getDeploymentHealthSummary } from "@/server/services/deployment-service";
import { findDuplicateCandidates } from "@/server/services/maintenance-service";
import {
  previewBatchArchive,
  executeBatchArchive,
  previewBatchRetag,
  executeBatchRetag,
  previewBatchRate,
  executeBatchRate,
  previewBatchReviewDate,
  executeBatchReviewDate,
} from "@/server/services/batch-service";

export async function getBatchAuditLogsAction(limit?: number) {
  return findBatchAuditLogs(limit);
}

export async function getDeploymentHealthAction() {
  return getDeploymentHealthSummary();
}

export async function getDuplicateCandidatesAction() {
  try {
    const candidates = await findDuplicateCandidates();
    return { success: true as const, candidates };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "获取重复候选失败",
    };
  }
}

const dismissDuplicateSchema = z.object({
  asset1Id: z.string().min(1),
  asset2Id: z.string().min(1),
});

export async function dismissDuplicateAction(input: unknown) {
  const parsed = dismissDuplicateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "参数无效" };
  }

  try {
    await createBatchAuditLog({
      id: createId(),
      actionType: "dismiss_duplicate",
      assetIds: JSON.stringify([parsed.data.asset1Id, parsed.data.asset2Id]),
      performedAt: nowTimestamp(),
      snapshotSummary: `Dismissed duplicate pair: ${parsed.data.asset1Id}, ${parsed.data.asset2Id}`,
    });
    revalidatePath("/assets/maintenance");
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "忽略重复失败",
    };
  }
}

const archiveDuplicateSchema = z.object({
  assetIdToArchive: z.string().min(1),
  keptAssetId: z.string().min(1),
});

export async function archiveDuplicateAction(input: unknown) {
  const parsed = archiveDuplicateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "参数无效" };
  }

  try {
    await archiveAsset(parsed.data.assetIdToArchive);
    await createBatchAuditLog({
      id: createId(),
      actionType: "archive",
      assetIds: JSON.stringify([parsed.data.assetIdToArchive, parsed.data.keptAssetId]),
      performedAt: nowTimestamp(),
      snapshotSummary: `Archived duplicate ${parsed.data.assetIdToArchive}, kept ${parsed.data.keptAssetId}`,
    });
    revalidatePath("/assets/maintenance");
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "归档重复资产失败",
    };
  }
}

const assetIdsSchema = z.array(z.string().min(1)).min(1);

const retagSchema = z.object({
  assetIds: z.array(z.string().min(1)).min(1),
  addTagNames: z.array(z.string().min(1)),
  removeTagNames: z.array(z.string().min(1)),
});

const rateSchema = z.object({
  assetIds: z.array(z.string().min(1)).min(1),
  rating: z.number().int().min(1).max(5),
});

const reviewDateSchema = z.object({
  assetIds: z.array(z.string().min(1)).min(1),
  reviewDueAt: z.number().nullable(),
});

export async function previewBatchArchiveAction(assetIds: string[]) {
  const parsed = assetIdsSchema.safeParse(assetIds);
  if (!parsed.success) {
    return { success: false as const, error: "参数无效" };
  }
  try {
    const result = await previewBatchArchive(parsed.data);
    return { success: true as const, ...result };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "预览归档失败",
    };
  }
}

export async function executeBatchArchiveAction(assetIds: string[]) {
  const parsed = assetIdsSchema.safeParse(assetIds);
  if (!parsed.success) {
    return { success: false as const, error: "参数无效" };
  }
  try {
    const result = await executeBatchArchive(parsed.data);
    revalidatePath("/assets");
    return { success: true as const, ...result };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "批量归档失败",
    };
  }
}

export async function previewBatchRetagAction(assetIds: string[], addTagNames: string[], removeTagNames: string[]) {
  const parsed = retagSchema.safeParse({ assetIds, addTagNames, removeTagNames });
  if (!parsed.success) {
    return { success: false as const, error: "参数无效" };
  }
  try {
    const result = await previewBatchRetag(parsed.data.assetIds, parsed.data.addTagNames, parsed.data.removeTagNames);
    return { success: true as const, ...result };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "预览重标失败",
    };
  }
}

export async function executeBatchRetagAction(assetIds: string[], addTagNames: string[], removeTagNames: string[]) {
  const parsed = retagSchema.safeParse({ assetIds, addTagNames, removeTagNames });
  if (!parsed.success) {
    return { success: false as const, error: "参数无效" };
  }
  try {
    const result = await executeBatchRetag(parsed.data.assetIds, parsed.data.addTagNames, parsed.data.removeTagNames);
    revalidatePath("/assets");
    return { success: true as const, ...result };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "批量重标失败",
    };
  }
}

export async function previewBatchRateAction(assetIds: string[], rating: number) {
  const parsed = rateSchema.safeParse({ assetIds, rating });
  if (!parsed.success) {
    return { success: false as const, error: "参数无效" };
  }
  try {
    const result = await previewBatchRate(parsed.data.assetIds, parsed.data.rating);
    return { success: true as const, ...result };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "预览评分失败",
    };
  }
}

export async function executeBatchRateAction(assetIds: string[], rating: number) {
  const parsed = rateSchema.safeParse({ assetIds, rating });
  if (!parsed.success) {
    return { success: false as const, error: "参数无效" };
  }
  try {
    const result = await executeBatchRate(parsed.data.assetIds, parsed.data.rating);
    revalidatePath("/assets");
    return { success: true as const, ...result };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "批量评分失败",
    };
  }
}

export async function previewBatchReviewDateAction(assetIds: string[], reviewDueAt: number | null) {
  const parsed = reviewDateSchema.safeParse({ assetIds, reviewDueAt });
  if (!parsed.success) {
    return { success: false as const, error: "参数无效" };
  }
  try {
    const result = await previewBatchReviewDate(parsed.data.assetIds, parsed.data.reviewDueAt);
    return { success: true as const, ...result };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "预览复查日期失败",
    };
  }
}

export async function executeBatchReviewDateAction(assetIds: string[], reviewDueAt: number | null) {
  const parsed = reviewDateSchema.safeParse({ assetIds, reviewDueAt });
  if (!parsed.success) {
    return { success: false as const, error: "参数无效" };
  }
  try {
    const result = await executeBatchReviewDate(parsed.data.assetIds, parsed.data.reviewDueAt);
    revalidatePath("/assets");
    return { success: true as const, ...result };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "批量设置复查日期失败",
    };
  }
}
