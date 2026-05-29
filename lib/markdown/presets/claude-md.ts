import type { Asset, Tag } from "@/db/schema";

interface AssetWithTags extends Asset {
  assetTags?: Array<{ tag: Tag }>;
}

export function renderClaudeMd(asset: AssetWithTags): string {
  const parts: string[] = [];

  parts.push(`# ${asset.title}`);
  parts.push("");

  if (asset.description) {
    parts.push(asset.description);
    parts.push("");
  }

  parts.push(asset.content);
  parts.push("");

  const contextLines: string[] = [];
  if (asset.targetTool) {
    contextLines.push(`- Target: ${asset.targetTool}`);
  }
  if (asset.scenario) {
    contextLines.push(`- Scenario: ${asset.scenario}`);
  }

  if (contextLines.length > 0) {
    parts.push("## Context");
    parts.push("");
    parts.push(...contextLines);
    parts.push("");
  }

  return parts.join("\n").trimEnd() + "\n";
}
