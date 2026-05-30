import { createId } from "@/lib/id";
import { nowTimestamp } from "@/lib/time";
import type {
  CreateCaptureInboxItemInput,
  UpdateCaptureInboxItemInput,
} from "@/lib/validators/capture-inbox";
import {
  createCaptureInboxItem,
  findAllCaptureInboxItems,
  findCaptureInboxItemById,
  updateCaptureInboxItem,
} from "@/server/queries/capture-inbox-queries";

export async function getCaptureInboxItems() {
  return findAllCaptureInboxItems();
}

export async function getCaptureInboxItemById(id: string) {
  return findCaptureInboxItemById(id);
}

export async function createNewCaptureInboxItem(input: CreateCaptureInboxItemInput) {
  const now = nowTimestamp();

  return createCaptureInboxItem({
    id: createId(),
    title: input.title,
    rawContent: input.rawContent,
    sourceType: input.sourceType,
    sourcePath: input.sourcePath ?? null,
    sourceTimestamp: input.sourceTimestamp ?? null,
    extractionNote: input.extractionNote ?? null,
    status: "pending",
    convertedAssetId: null,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateExistingCaptureInboxItem(
  input: UpdateCaptureInboxItemInput,
) {
  const existing = await findCaptureInboxItemById(input.id);
  if (!existing) {
    throw new Error("Capture inbox 项不存在");
  }

  const { id, ...updates } = input;
  const data: Record<string, unknown> = {};

  if (updates.title !== undefined) data.title = updates.title;
  if (updates.rawContent !== undefined) data.rawContent = updates.rawContent;
  if (updates.sourceType !== undefined) data.sourceType = updates.sourceType;
  if (updates.sourcePath !== undefined) data.sourcePath = updates.sourcePath;
  if (updates.sourceTimestamp !== undefined) {
    data.sourceTimestamp = updates.sourceTimestamp;
  }
  if (updates.extractionNote !== undefined) {
    data.extractionNote = updates.extractionNote;
  }
  if (updates.status !== undefined) data.status = updates.status;
  if (updates.convertedAssetId !== undefined) {
    data.convertedAssetId = updates.convertedAssetId;
  }

  return updateCaptureInboxItem(id, data);
}
