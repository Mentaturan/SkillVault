import yaml from "js-yaml";
import type { Asset, Tag } from "@/db/schema";

interface AssetWithTags extends Asset {
  assetTags?: Array<{ tag: Tag }>;
}

export function renderCodexSkill(asset: AssetWithTags): string {
  const frontmatter: Record<string, string> = {
    name: asset.slug,
    description: asset.description || asset.title,
  };

  const frontmatterStr = yaml.dump(frontmatter, {
    lineWidth: -1,
    quotingType: '"',
    forceQuotes: false,
  }).trimEnd();

  const parts: string[] = [];
  parts.push(`---\n${frontmatterStr}\n---`);
  parts.push("");
  parts.push(`# ${asset.title}`);
  parts.push("");
  parts.push(asset.content);
  parts.push("");

  if (asset.scenario) {
    parts.push("## Examples");
    parts.push("");
    parts.push(`- ${asset.scenario}`);
    parts.push("");
  }

  return parts.join("\n").trimEnd() + "\n";
}
