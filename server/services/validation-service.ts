import { findAssetById, findAssetsByExactTitle } from "@/server/queries/asset-queries";
import { validateAssetContent } from "@/lib/validation";
import type { ParsedMarkdownAsset } from "@/lib/markdown";

export async function validateExistingAsset(assetId: string) {
  const asset = await findAssetById(assetId);
  if (!asset) {
    throw new Error("资产不存在");
  }

  const duplicates = await findAssetsByExactTitle(asset.title);
  const duplicateNameCount = duplicates.filter((item) => item.id !== asset.id).length;

  return validateAssetContent({
    title: asset.title,
    description: asset.description,
    content: asset.content,
    type: asset.type,
    exportPreset: asset.exportPreset,
    duplicateNameCount,
  });
}

export async function validateParsedImport(
  markdown: string,
  parsed: ParsedMarkdownAsset,
) {
  const duplicates = await findAssetsByExactTitle(parsed.frontmatter.title);
  return validateAssetContent({
    markdown,
    title: parsed.frontmatter.title,
    description: parsed.frontmatter.description,
    content: parsed.content,
    type: parsed.frontmatter.type,
    exportPreset: parsed.frontmatter.exportPreset,
    duplicateNameCount: duplicates.length,
  });
}
