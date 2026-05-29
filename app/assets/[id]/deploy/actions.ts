"use server";

import { revalidatePath } from "next/cache";

import type { DeploymentPreviewInput } from "@/lib/validators/deployment";
import {
  deployAssetToTarget,
  getAssetDeploymentStatuses,
  previewAssetDeployment,
} from "@/server/services/deployment-service";

export async function previewAssetDeploymentAction(input: DeploymentPreviewInput) {
  try {
    const preview = await previewAssetDeployment(input);
    return { success: true, preview };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "部署预览失败",
    };
  }
}

export async function deployAssetToTargetAction(input: DeploymentPreviewInput) {
  try {
    const result = await deployAssetToTarget(input);
    const statuses = await getAssetDeploymentStatuses(input.assetId);

    revalidatePath(`/assets/${input.assetId}`);
    revalidatePath(`/assets/${input.assetId}/deploy`);
    revalidatePath("/settings");

    return { success: true, result, statuses };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "部署失败",
    };
  }
}
