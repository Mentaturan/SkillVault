import yaml from "js-yaml";
import type { MarkdownFrontmatter } from "./types";
import type { Asset, Tag } from "@/db/schema";
import type { ExportPreset } from "@/lib/constants";
import { renderAgentsMd } from "./presets/agents-md";
import { renderClaudeMd } from "./presets/claude-md";
import { renderCodexSkill } from "./presets/codex-skill";
import { renderCursorRules } from "./presets/cursor-rules";

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
    sourceRef: asset.sourceRef || undefined,
    sourcePath: asset.sourcePath || undefined,
    sourceImportedAt: asset.sourceImportedAt ?? undefined,
    sourceChecksum: asset.sourceChecksum || undefined,
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

const PRESET_RENDERERS: Record<string, (asset: AssetWithTags) => string> = {
  agents_md: renderAgentsMd,
  claude_md: renderClaudeMd,
  codex_skill_md: renderCodexSkill,
  cursor_rules: renderCursorRules,
  general_markdown: renderAssetToMarkdown,
};

export function renderAssetWithPreset(
  asset: AssetWithTags,
  preset?: ExportPreset,
): string {
  const resolved = preset ?? asset.exportPreset;
  const renderer = PRESET_RENDERERS[resolved] ?? PRESET_RENDERERS["general_markdown"];
  return renderer(asset);
}

export function getExportFilename(asset: Asset): string {
  return `${asset.slug}.${asset.syncId}.md`;
}

const PRESET_FILENAMES: Partial<Record<ExportPreset, (asset: Asset) => string>> = {
  agents_md: () => "AGENTS.md",
  claude_md: () => "CLAUDE.md",
  codex_skill_md: (asset) => `${asset.slug}.SKILL.md`,
  cursor_rules: (asset) => `${asset.slug}.mdc`,
};

export function getExportFilenameWithPreset(
  asset: Asset,
  preset?: ExportPreset,
): string {
  const resolved = preset ?? asset.exportPreset;
  const fn = PRESET_FILENAMES[resolved];
  return fn ? fn(asset) : getExportFilename(asset);
}
