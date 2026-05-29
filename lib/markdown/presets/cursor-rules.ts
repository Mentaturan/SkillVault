import yaml from "js-yaml";
import type { Asset, Tag } from "@/db/schema";

interface AssetWithTags extends Asset {
  assetTags?: Array<{ tag: Tag }>;
}

export function renderCursorRules(asset: AssetWithTags): string {
  const frontmatter: Record<string, string | boolean> = {
    description: asset.description || asset.title,
    globs: "**/*",
    alwaysApply: false,
  };

  const frontmatterStr = yaml.dump(frontmatter, {
    lineWidth: -1,
    quotingType: '"',
    forceQuotes: false,
  }).trimEnd();

  const parts: string[] = [];
  parts.push(`---\n${frontmatterStr}\n---`);
  parts.push("");
  parts.push(asset.content);
  parts.push("");

  return parts.join("\n").trimEnd() + "\n";
}
