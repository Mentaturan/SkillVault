import yaml from "js-yaml";
import type { MarkdownFrontmatter } from "./types";
import type { Asset, Tag } from "@/db/schema";

interface AssetWithTags extends Asset {
  assetTags?: Array<{ tag: Tag }>;
}

export function renderAssetToMarkdown(asset: AssetWithTags): string {
  const tags = asset.assetTags?.map((at) => at.tag.name) ?? [];

  const frontmatter: MarkdownFrontmatter = {
    syncId: asset.syncId,
    title: asset.title,
    type: asset.type,
    targetTool: asset.targetTool,
    exportPreset: asset.exportPreset,
    status: asset.status !== "draft" ? asset.status : undefined,
    visibility: asset.visibility !== "private" ? asset.visibility : undefined,
    source: asset.source !== "self_created" ? asset.source : undefined,
    sourceUrl: asset.sourceUrl || undefined,
    pinned: asset.pinned || undefined,
    description: asset.description || undefined,
    scenario: asset.scenario || undefined,
    tags: tags.length > 0 ? tags : undefined,
  };

  const cleanFrontmatter = Object.fromEntries(
    Object.entries(frontmatter).filter(([, v]) => v !== undefined && v !== null),
  );

  const frontmatterStr = yaml.dump(cleanFrontmatter, {
    lineWidth: -1,
    quotingType: '"',
    forceQuotes: false,
  }).trimEnd();

  return `---\n${frontmatterStr}\n---\n\n${asset.content}`;
}

export function getExportFilename(asset: Asset): string {
  return `${asset.slug}.${asset.syncId}.md`;
}
