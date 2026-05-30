import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { captureInboxItems } from "@/db/schema";
import type { NewCaptureInboxItem } from "@/db/schema";

export async function findAllCaptureInboxItems() {
  return db.query.captureInboxItems.findMany({
    orderBy: [desc(captureInboxItems.createdAt)],
    with: {
      convertedAsset: {
        columns: {
          id: true,
          title: true,
        },
      },
    },
  });
}

export async function findCaptureInboxItemById(id: string) {
  return db.query.captureInboxItems.findFirst({
    where: eq(captureInboxItems.id, id),
    with: {
      convertedAsset: {
        columns: {
          id: true,
          title: true,
        },
      },
    },
  });
}

export async function findCaptureInboxItemsBySourcePath(sourcePath: string) {
  return db.query.captureInboxItems.findMany({
    where: and(
      eq(captureInboxItems.sourcePath, sourcePath),
      eq(captureInboxItems.sourceType, "codex_rollout"),
    ),
    columns: {
      id: true,
      sourceType: true,
      sourceTimestamp: true,
      rawContent: true,
    },
  });
}

export async function createCaptureInboxItem(data: NewCaptureInboxItem) {
  const [item] = await db.insert(captureInboxItems).values(data).returning();
  return item;
}

export async function updateCaptureInboxItem(
  id: string,
  data: Partial<NewCaptureInboxItem>,
) {
  const [item] = await db
    .update(captureInboxItems)
    .set({ ...data, updatedAt: Date.now() })
    .where(eq(captureInboxItems.id, id))
    .returning();
  return item;
}
