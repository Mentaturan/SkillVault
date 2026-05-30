import { stat } from "node:fs/promises";
import path from "node:path";

import { createId } from "@/lib/id";
import { nowTimestamp } from "@/lib/time";
import type { CaptureInboxSourceType } from "@/lib/constants";
import {
  createCaptureImportSource,
  findCaptureImportSourceByFilePath,
  findCaptureImportSourcesByFilePaths,
  updateCaptureImportSource,
} from "@/server/queries/capture-import-source-queries";

export type CaptureImportFileStatus = "new" | "changed" | "unchanged";

export interface CaptureImportFileSnapshot {
  sourceType: CaptureInboxSourceType;
  filePath: string;
  directoryPath: string;
  fileModifiedAt: number;
  fileSize: number;
  lastImportedAt: number | null;
  status: CaptureImportFileStatus;
}

function toModifiedTimestamp(modifiedAtMs: number) {
  return Math.round(modifiedAtMs);
}

export async function recordCaptureImportSource(
  sourceType: CaptureInboxSourceType,
  filePath: string,
) {
  const fileStat = await stat(filePath);
  const modifiedAt = toModifiedTimestamp(fileStat.mtimeMs);
  const current = await findCaptureImportSourceByFilePath(sourceType, filePath);
  const now = nowTimestamp();

  if (!current) {
    return createCaptureImportSource({
      id: createId(),
      sourceType,
      filePath,
      directoryPath: path.dirname(filePath),
      fileModifiedAt: modifiedAt,
      fileSize: fileStat.size,
      lastImportedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  return updateCaptureImportSource(current.id, {
    directoryPath: path.dirname(filePath),
    fileModifiedAt: modifiedAt,
    fileSize: fileStat.size,
    lastImportedAt: now,
  });
}

export async function getCaptureImportFileSnapshots(
  sourceType: CaptureInboxSourceType,
  filePaths: string[],
) {
  const records = await findCaptureImportSourcesByFilePaths(sourceType, filePaths);
  const recordMap = new Map(records.map((record) => [record.filePath, record]));

  return Promise.all(
    filePaths.map(async (filePath) => {
      const fileStat = await stat(filePath);
      const record = recordMap.get(filePath);
      const modifiedAt = toModifiedTimestamp(fileStat.mtimeMs);
      const status: CaptureImportFileStatus = !record
        ? "new"
        : record.fileModifiedAt !== modifiedAt || record.fileSize !== fileStat.size
          ? "changed"
          : "unchanged";

      return {
        sourceType,
        filePath,
        directoryPath: path.dirname(filePath),
        fileModifiedAt: modifiedAt,
        fileSize: fileStat.size,
        lastImportedAt: record?.lastImportedAt ?? null,
        status,
      } satisfies CaptureImportFileSnapshot;
    }),
  );
}
