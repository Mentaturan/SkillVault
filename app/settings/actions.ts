"use server";

import { revalidatePath } from "next/cache";

import type { SaveDeploymentTargetsInput } from "@/lib/validators/deployment";
import { getDiagnosticsSnapshot } from "@/server/services/diagnostics-service";
import { saveDeploymentTargets } from "@/server/services/deployment-service";

export async function getDiagnosticsAction() {
  return getDiagnosticsSnapshot();
}

export async function saveDeploymentTargetsAction(input: SaveDeploymentTargetsInput) {
  const targets = await saveDeploymentTargets(input);
  revalidatePath("/settings");
  return targets;
}
