"use server";

import { revalidatePath } from "next/cache";
import { parseMarkdownForPreview, importMarkdownAsset } from "@/server/services/markdown-service";
import { parseMarkdownToAsset } from "@/lib/markdown";
import type { ImportConflictStrategy } from "@/lib/constants";
import { createContentHash } from "@/lib/hash";
import {
  githubImportExecuteSchema,
  githubImportPreviewSchema,
} from "@/lib/validators/github-import";
import {
  importGitHubMarkdownAsset,
  previewGitHubMarkdownImport,
} from "@/server/services/github-import-service";

export async function parseMarkdownAction(markdown: string) {
  try {
    const result = await parseMarkdownForPreview(markdown);
    if ("error" in result) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "解析失败",
    };
  }
}

export async function batchImportAction(
  items: { filename: string; markdown: string }[],
) {
  const results: { filename: string; success: boolean; assetId?: string; error?: string }[] = [];

  for (const item of items) {
    try {
      const parsed = parseMarkdownToAsset(item.markdown);
      if ("error" in parsed) {
        results.push({ filename: item.filename, success: false, error: parsed.error.message });
        continue;
      }

      const result = await importMarkdownAsset(parsed.data, "copy", {
        sourcePath: item.filename,
        sourceChecksum: createContentHash(item.markdown),
        sourceImportedAt: Date.now(),
      });

      if ("cancelled" in result) {
        results.push({ filename: item.filename, success: false, error: "导入已取消" });
        continue;
      }

      results.push({ filename: item.filename, success: true, assetId: result.asset.id });
    } catch (error) {
      results.push({
        filename: item.filename,
        success: false,
        error: error instanceof Error ? error.message : "导入失败",
      });
    }
  }

  revalidatePath("/assets");

  return results;
}

export async function importMarkdownAction(
  markdown: string,
  strategy: ImportConflictStrategy,
) {
  try {
    const parsed = parseMarkdownToAsset(markdown);
    if ("error" in parsed) {
      return { success: false, error: parsed.error.message };
    }

    const result = await importMarkdownAsset(parsed.data, strategy, {
      sourceChecksum: createContentHash(markdown),
      sourceImportedAt: Date.now(),
    });

    if ("cancelled" in result) {
      return { success: true, cancelled: true };
    }

    revalidatePath("/assets");
    if (result.asset) {
      revalidatePath(`/assets/${result.asset.id}`);
    }

    return { success: true, assetId: result.asset.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "导入失败",
    };
  }
}

export async function previewGitHubImportAction(url: string) {
  const parsed = githubImportPreviewSchema.safeParse({ url });
  if (!parsed.success) {
    return { success: false, error: "GitHub URL 格式无效" };
  }

  try {
    const result = await previewGitHubMarkdownImport(parsed.data.url);
    if ("error" in result) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "GitHub 文件预览失败",
    };
  }
}

export async function importGitHubAction(
  url: string,
  previewChecksum: string,
  strategy: ImportConflictStrategy,
) {
  const parsed = githubImportExecuteSchema.safeParse({
    url,
    previewChecksum,
    strategy,
  });
  if (!parsed.success) {
    return { success: false, error: "GitHub 导入参数无效" };
  }

  try {
    const result = await importGitHubMarkdownAsset(
      parsed.data.url,
      parsed.data.previewChecksum,
      parsed.data.strategy,
    );

    if ("cancelled" in result) {
      return { success: true, cancelled: true };
    }

    revalidatePath("/assets");
    if (result.asset) {
      revalidatePath(`/assets/${result.asset.id}`);
    }

    return { success: true, assetId: result.asset.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "GitHub 文件导入失败",
    };
  }
}
