import { desc } from "drizzle-orm";

import { db } from "@/db";
import { batchAuditLogs } from "@/db/schema";
import type { NewBatchAuditLog } from "@/db/schema";

export async function createBatchAuditLog(data: NewBatchAuditLog) {
  const [row] = await db.insert(batchAuditLogs).values(data).returning();
  return row;
}

export async function findBatchAuditLogs(limit = 50) {
  return db.query.batchAuditLogs.findMany({
    orderBy: desc(batchAuditLogs.performedAt),
    limit,
  });
}
