"use server";

import { revalidatePath } from "next/cache";

import { APP_VERSION } from "@/lib/constants";
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

interface UpdateCheckResult {
  currentVersion: string;
  latestVersion: string | null;
  hasUpdate: boolean;
  downloadUrl: string | null;
  releaseNotes: string | null;
  error: string | null;
}

export async function checkForUpdateAction(): Promise<UpdateCheckResult> {
  try {
    const res = await fetch("https://api.github.com/repos/Mentaturan/SkillVault/releases/latest", {
      headers: { "User-Agent": "SkillVault" },
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      return { currentVersion: APP_VERSION, latestVersion: null, hasUpdate: false, downloadUrl: null, releaseNotes: null, error: "Failed to fetch release info" };
    }
    const data = await res.json();
    const tagName = data.tag_name as string;
    const latestVersion = tagName.replace(/^v/, "");
    const currentVersion = APP_VERSION;

    const hasUpdate = compareVersions(latestVersion, currentVersion) > 0;

    const dmgAsset = (data.assets as Array<{ name: string; browser_download_url: string }>)?.find(a => a.name.endsWith(".dmg"));
    const downloadUrl = dmgAsset?.browser_download_url ?? data.html_url ?? null;

    return {
      currentVersion,
      latestVersion,
      hasUpdate,
      downloadUrl,
      releaseNotes: data.body ?? null,
      error: null,
    };
  } catch {
    return { currentVersion: APP_VERSION, latestVersion: null, hasUpdate: false, downloadUrl: null, releaseNotes: null, error: "Network error" };
  }
}

function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}
