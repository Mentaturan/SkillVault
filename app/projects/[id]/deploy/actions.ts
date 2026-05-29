"use server";

import { revalidatePath } from "next/cache";

import {
  deployProjectToTarget,
  previewProjectDeployment,
} from "@/server/services/deployment-service";

export async function previewProjectDeploymentAction(projectId: string, targetId: string) {
  try {
    const preview = await previewProjectDeployment(projectId, targetId);
    return { success: true, preview };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "项目部署预览失败",
    };
  }
}

export async function deployProjectToTargetAction(projectId: string, targetId: string) {
  try {
    const result = await deployProjectToTarget(projectId, targetId);

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/deploy`);
    revalidatePath("/assets");

    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "项目部署失败",
    };
  }
}
