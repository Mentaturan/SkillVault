import { renderAssetWithPreset, getExportFilenameWithPreset, parseMarkdownToAsset } from "@/lib/markdown";
import type { ParsedMarkdownAsset } from "@/lib/markdown";
import { createContentHash } from "@/lib/hash";
import { findAssetById, findAssetBySyncId, findAssetByContentHash } from "@/server/queries/asset-queries";
import { createNewAsset, updateExistingAsset } from "@/server/services/asset-service";
import type { ImportConflictStrategy, ExportPreset } from "@/lib/constants";

export async function exportAssetToMarkdown(assetId: string, preset?: ExportPreset) {
  const asset = await findAssetById(assetId);
  if (!asset) {
    throw new Error("资产不存在");
  }

  const markdown = renderAssetWithPreset(asset, preset);
  const filename = getExportFilenameWithPreset(asset, preset);

  return { markdown, filename };
}

export async function parseMarkdownForPreview(markdown: string) {
  const result = parseMarkdownToAsset(markdown);

  if ("error" in result) {
    return { error: result.error.message };
  }

  const { frontmatter, content } = result.data;

  let conflictAsset = null;
  if (frontmatter.syncId) {
    conflictAsset = await findAssetBySyncId(frontmatter.syncId);
  }

  const contentHash = createContentHash(content);
  const duplicateByContent = await findAssetByContentHash(contentHash);

  return {
    data: {
      frontmatter,
      content,
      hasConflict: !!conflictAsset,
      conflictAssetId: conflictAsset?.id ?? null,
      conflictAssetTitle: conflictAsset?.title ?? null,
      hasContentDuplicate: !!duplicateByContent,
      contentDuplicateAssetTitle: duplicateByContent?.title ?? null,
    },
  };
}

export async function importMarkdownAsset(
  parsed: ParsedMarkdownAsset,
  strategy: ImportConflictStrategy,
) {
  const { frontmatter, content } = parsed;

  if (strategy === "cancel") {
    return { cancelled: true as const };
  }

  if (strategy === "overwrite") {
    const existing = await findAssetBySyncId(frontmatter.syncId);
    if (!existing) {
      return createAssetFromParsed(parsed, "imported");
    }

    const asset = await updateExistingAsset({
      id: existing.id,
      title: frontmatter.title,
      type: frontmatter.type,
      targetTool: frontmatter.targetTool,
      exportPreset: frontmatter.exportPreset,
      description: frontmatter.description ?? undefined,
      scenario: frontmatter.scenario ?? undefined,
      content,
      status: frontmatter.status,
      visibility: frontmatter.visibility,
      source: frontmatter.source ?? "imported",
      sourceUrl: frontmatter.sourceUrl ?? undefined,
      pinned: frontmatter.pinned,
      tagNames: frontmatter.tags,
    });

    return { asset };
  }

  return createAssetFromParsed(parsed, "imported");
}

async function createAssetFromParsed(
  parsed: ParsedMarkdownAsset,
  source: "imported",
) {
  const { frontmatter, content } = parsed;

  const result = await createNewAsset({
    title: frontmatter.title,
    type: frontmatter.type,
    targetTool: frontmatter.targetTool,
    exportPreset: frontmatter.exportPreset,
    description: frontmatter.description ?? undefined,
    scenario: frontmatter.scenario ?? undefined,
    content,
    status: frontmatter.status,
    visibility: frontmatter.visibility,
    source,
    sourceUrl: frontmatter.sourceUrl ?? undefined,
    pinned: frontmatter.pinned,
    tagNames: frontmatter.tags,
  });

  return { asset: result.asset };
}
