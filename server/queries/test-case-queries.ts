import { eq, desc } from "drizzle-orm";

import { db } from "@/db";
import { testCases } from "@/db/schema";
import type { NewTestCase } from "@/db/schema";

export async function findTestCasesByAssetId(assetId: string) {
  return db.query.testCases.findMany({
    where: eq(testCases.assetId, assetId),
    orderBy: [desc(testCases.createdAt)],
  });
}

export async function findTestCaseById(id: string) {
  return db.query.testCases.findFirst({
    where: eq(testCases.id, id),
  });
}

export async function createTestCase(data: NewTestCase) {
  const [testCase] = await db.insert(testCases).values(data).returning();
  return testCase;
}

export async function updateTestCase(id: string, data: Partial<NewTestCase>) {
  const [testCase] = await db
    .update(testCases)
    .set({ ...data, updatedAt: Date.now() })
    .where(eq(testCases.id, id))
    .returning();
  return testCase;
}

export async function deleteTestCase(id: string) {
  await db.delete(testCases).where(eq(testCases.id, id));
}
