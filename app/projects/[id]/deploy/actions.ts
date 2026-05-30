"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  deployProjectToTarget,
  previewProjectDeployment,
} from "@/server/services/deployment-service";

const deployIdSchema = z.object({
  projectId: z.string().min(1),
  targetId: z.string().min(1),
});

export async function previewProjectDeploymentAction(projectId: string, targetId: string) {
  const parsed = deployIdSchema.safeParse({ projectId, targetId });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  try {
    const preview = await previewProjectDeployment(parsed.data.projectId, parsed.data.targetId);
    return { success: true, preview };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "项目部署预览失败",
    };
  }
}

export async function deployProjectToTargetAction(projectId: string, targetId: string) {
  const parsed = deployIdSchema.safeParse({ projectId, targetId });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  try {
    const result = await deployProjectToTarget(parsed.data.projectId, parsed.data.targetId);

    revalidatePath(`/projects/${parsed.data.projectId}`);
    revalidatePath(`/projects/${parsed.data.projectId}/deploy`);
    revalidatePath("/assets");

    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "项目部署失败",
    };
  }
}
