import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { captureImportSources } from "@/db/schema";
import type { NewCaptureImportSource } from "@/db/schema";
import type { CaptureInboxSourceType } from "@/lib/constants";

export async function findCaptureImportSourcesByFilePaths(
  sourceType: CaptureInboxSourceType,
  filePaths: string[],
) {
  if (filePaths.length === 0) {
    return [];
  }

  return db.query.captureImportSources.findMany({
    where: and(
      eq(captureImportSources.sourceType, sourceType),
      inArray(captureImportSources.filePath, filePaths),
    ),
  });
}

export async function findCaptureImportSourceByFilePath(
  sourceType: CaptureInboxSourceType,
  filePath: string,
) {
  return db.query.captureImportSources.findFirst({
    where: and(
      eq(captureImportSources.sourceType, sourceType),
      eq(captureImportSources.filePath, filePath),
    ),
  });
}

export async function createCaptureImportSource(data: NewCaptureImportSource) {
  const [record] = await db.insert(captureImportSources).values(data).returning();
  return record;
}

export async function updateCaptureImportSource(
  id: string,
  data: Partial<NewCaptureImportSource>,
) {
  const [record] = await db
    .update(captureImportSources)
    .set({ ...data, updatedAt: Date.now() })
    .where(eq(captureImportSources.id, id))
    .returning();
  return record;
}
