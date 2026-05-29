"use server";

import { revalidatePath } from "next/cache";
import {
  createNewTestCase,
  updateExistingTestCase,
  deleteExistingTestCase,
} from "@/server/services/test-case-service";
import {
  createTestCaseSchema,
  updateTestCaseSchema,
} from "@/lib/validators/test-case";

export async function createTestCaseAction(formData: FormData) {
  try {
    const parsed = createTestCaseSchema.safeParse({
      assetId: formData.get("assetId") as string,
      assetVersionId: (formData.get("assetVersionId") as string) || undefined,
      kind: formData.get("kind") as string,
      title: formData.get("title") as string,
      input: formData.get("input") as string,
      expectedOutput: (formData.get("expectedOutput") as string) || undefined,
      actualOutput: (formData.get("actualOutput") as string) || undefined,
      evaluationCriteria: (formData.get("evaluationCriteria") as string) || undefined,
      score: formData.get("score") ? parseFloat(formData.get("score") as string) : undefined,
      note: (formData.get("note") as string) || undefined,
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors };
    }
    const testCase = await createNewTestCase(parsed.data);
    revalidatePath(`/assets/${parsed.data.assetId}/test-cases`);
    return { success: true, testCase };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "创建测试用例失败",
    };
  }
}

export async function updateTestCaseAction(id: string, assetId: string, formData: FormData) {
  try {
    const parsed = updateTestCaseSchema.safeParse({
      id,
      title: (formData.get("title") as string) || undefined,
      input: (formData.get("input") as string) || undefined,
      expectedOutput: (formData.get("expectedOutput") as string) || undefined,
      actualOutput: (formData.get("actualOutput") as string) || undefined,
      evaluationCriteria: (formData.get("evaluationCriteria") as string) || undefined,
      score: formData.get("score") ? parseFloat(formData.get("score") as string) : undefined,
      note: (formData.get("note") as string) || undefined,
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors };
    }
    const testCase = await updateExistingTestCase(parsed.data);
    revalidatePath(`/assets/${assetId}/test-cases`);
    return { success: true, testCase };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "更新测试用例失败",
    };
  }
}

export async function deleteTestCaseAction(id: string, assetId: string) {
  try {
    await deleteExistingTestCase(id);
    revalidatePath(`/assets/${assetId}/test-cases`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "删除测试用例失败",
    };
  }
}
