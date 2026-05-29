import { z } from "zod";

import { TEST_CASE_KINDS } from "@/lib/constants";

export const createTestCaseSchema = z.object({
  assetId: z.string(),
  assetVersionId: z.string().optional(),
  kind: z.enum(TEST_CASE_KINDS),
  title: z.string().min(1, "标题不能为空").max(200),
  input: z.string().min(1, "输入不能为空"),
  expectedOutput: z.string().optional(),
  actualOutput: z.string().optional(),
  evaluationCriteria: z.string().optional(),
  score: z.number().min(0).max(10).optional(),
  note: z.string().optional(),
});

export const updateTestCaseSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "标题不能为空").max(200).optional(),
  input: z.string().min(1, "输入不能为空").optional(),
  expectedOutput: z.string().optional(),
  actualOutput: z.string().optional(),
  evaluationCriteria: z.string().optional(),
  score: z.number().min(0).max(10).optional(),
  note: z.string().optional(),
});

export type CreateTestCaseInput = z.infer<typeof createTestCaseSchema>;
export type UpdateTestCaseInput = z.infer<typeof updateTestCaseSchema>;
