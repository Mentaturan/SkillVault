"use server";

import { revalidatePath } from "next/cache";

import { deploymentPreviewSchema } from "@/lib/validators/deployment";
import {
  deployAssetToTarget,
  getAssetDeploymentStatuses,
  previewAssetDeployment,
} from "@/server/services/deployment-service";

export async function previewAssetDeploymentAction(input: unknown) {
  const parsed = deploymentPreviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  try {
    const preview = await previewAssetDeployment(parsed.data);
    return { success: true, preview };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "部署预览失败",
    };
  }
}

export async function deployAssetToTargetAction(input: unknown) {
  const parsed = deploymentPreviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  try {
    const result = await deployAssetToTarget(parsed.data);
    const statuses = await getAssetDeploymentStatuses(parsed.data.assetId);

    revalidatePath(`/assets/${parsed.data.assetId}`);
    revalidatePath(`/assets/${parsed.data.assetId}/deploy`);
    revalidatePath("/settings");

    return { success: true, result, statuses };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "部署失败",
    };
  }
}
