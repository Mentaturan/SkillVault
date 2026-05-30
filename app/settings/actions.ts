"use server";

import { revalidatePath } from "next/cache";

import { APP_VERSION } from "@/lib/constants";
import type { SaveDeploymentTargetsInput } from "@/lib/validators/deployment";
import { getDiagnosticsSnapshot } from "@/server/services/diagnostics-service";
import { saveDeploymentTargets } from "@/server/services/deployment-service";

export async function getDiagnosticsAction() {
  try {
    const data = await getDiagnosticsSnapshot();
    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "获取诊断信息失败" };
  }
}

export async function saveDeploymentTargetsAction(input: SaveDeploymentTargetsInput) {
  try {
    const targets = await saveDeploymentTargets(input);
    revalidatePath("/settings");
    return { success: true as const, targets };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "保存部署目标失败" };
  }
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
    const tagName = typeof data.tag_name === "string" ? data.tag_name : "";
    if (!tagName) {
      return { hasUpdate: false, currentVersion: APP_VERSION, latestVersion: "", downloadUrl: null, releaseNotes: null, error: null };
    }
    const latestVersion = tagName.replace(/^v/, "");
    const currentVersion = APP_VERSION;

    const hasUpdate = compareVersions(latestVersion, currentVersion) > 0;

    const assets = Array.isArray(data.assets) ? data.assets as Array<{ name: string; browser_download_url: string }> : [];
    const dmgAsset = assets.find(a => a.name.endsWith(".dmg"));
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

function compareVersions(current: string, latest: string) {
  const cleanSegment = (s: string) => {
    const num = parseInt(s.replace(/[^0-9]/g, ""), 10);
    return Number.isNaN(num) ? 0 : num;
  };
  const a = current.split(".").map(cleanSegment);
  const b = latest.split(".").map(cleanSegment);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] ?? 0) < (b[i] ?? 0)) return -1;
    if ((a[i] ?? 0) > (b[i] ?? 0)) return 1;
  }
  return 0;
}
