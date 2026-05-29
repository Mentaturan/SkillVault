import type { Asset, Tag } from "@/db/schema";

interface AssetWithTags extends Asset {
  assetTags?: Array<{ tag: Tag }>;
}

export function renderAgentsMd(asset: AssetWithTags): string {
  const parts: string[] = [];

  parts.push(`# ${asset.title} Agent Rules`);
  parts.push("");

  if (asset.description) {
    parts.push("## Project Overview");
    parts.push("");
    parts.push(asset.description);
    parts.push("");
  }

  parts.push("## Coding Standards");
  parts.push("");
  parts.push(asset.content);
  parts.push("");

  if (asset.scenario) {
    parts.push("## Usage");
    parts.push("");
    parts.push(asset.scenario);
    parts.push("");
  }

  return parts.join("\n").trimEnd() + "\n";
}
