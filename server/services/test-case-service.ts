import { createId } from "@/lib/id";
import { nowTimestamp } from "@/lib/time";
import {
  findTestCasesByAssetId,
  findTestCaseById,
  createTestCase,
  updateTestCase,
  deleteTestCase,
} from "@/server/queries/test-case-queries";
import type { CreateTestCaseInput, UpdateTestCaseInput } from "@/lib/validators/test-case";

export async function getTestCasesByAssetId(assetId: string) {
  return findTestCasesByAssetId(assetId);
}

export async function createNewTestCase(input: CreateTestCaseInput) {
  const id = createId();
  const now = nowTimestamp();

  const testCase = await createTestCase({
    id,
    assetId: input.assetId,
    assetVersionId: input.assetVersionId ?? null,
    kind: input.kind,
    title: input.title,
    input: input.input,
    expectedOutput: input.expectedOutput ?? null,
    actualOutput: input.actualOutput ?? null,
    evaluationCriteria: input.evaluationCriteria ?? null,
    score: input.score ?? null,
    note: input.note ?? null,
    createdAt: now,
    updatedAt: now,
  });

  return testCase;
}

export async function updateExistingTestCase(input: UpdateTestCaseInput) {
  const { id, ...updates } = input;
  const data: Record<string, unknown> = {};
  if (updates.title !== undefined) data.title = updates.title;
  if (updates.input !== undefined) data.input = updates.input;
  if (updates.expectedOutput !== undefined) data.expectedOutput = updates.expectedOutput;
  if (updates.actualOutput !== undefined) data.actualOutput = updates.actualOutput;
  if (updates.evaluationCriteria !== undefined) data.evaluationCriteria = updates.evaluationCriteria;
  if (updates.score !== undefined) data.score = updates.score;
  if (updates.note !== undefined) data.note = updates.note;

  return updateTestCase(id, data);
}

export async function deleteExistingTestCase(id: string) {
  const existing = await findTestCaseById(id);
  if (!existing) {
    throw new Error("测试用例不存在");
  }
  return deleteTestCase(id);
}
