import { createContentHash } from "@/lib/hash";
import { parseGitHubFileUrl } from "@/lib/import-sources/github-file";
import { parseMarkdownToAsset } from "@/lib/markdown";
import { importMarkdownAsset, parseMarkdownForPreview } from "@/server/services/markdown-service";
import type { ImportConflictStrategy } from "@/lib/constants";

const MAX_GITHUB_FILE_BYTES = 1024 * 1024;

async function fetchGitHubMarkdown(url: string) {
  const source = parseGitHubFileUrl(url);
  const response = await fetch(source.rawUrl, {
    cache: "no-store",
    headers: {
      Accept: "text/plain",
      "User-Agent": "SkillVault",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub 文件获取失败：${response.status}`);
  }

  const markdown = await response.text();

  if (Buffer.byteLength(markdown, "utf8") > MAX_GITHUB_FILE_BYTES) {
    throw new Error("GitHub 文件过大，当前仅支持 1MB 以内的 Markdown 文件");
  }

  return { source, markdown };
}

export async function previewGitHubMarkdownImport(url: string) {
  const { source, markdown } = await fetchGitHubMarkdown(url);
  const sourceChecksum = createContentHash(markdown);
  const preview = await parseMarkdownForPreview(markdown, {
    sourceUrl: source.htmlUrl,
    sourceRef: source.ref,
    sourcePath: source.path,
    sourceChecksum,
  });

  if ("error" in preview) {
    return preview;
  }

  return {
    data: {
      preview: preview.data,
      source: {
        htmlUrl: source.htmlUrl,
        rawUrl: source.rawUrl,
        ref: source.ref,
        path: source.path,
        checksum: sourceChecksum,
      },
    },
  };
}

export async function importGitHubMarkdownAsset(
  url: string,
  previewChecksum: string,
  strategy: ImportConflictStrategy,
) {
  const { source, markdown } = await fetchGitHubMarkdown(url);
  const sourceChecksum = createContentHash(markdown);

  if (sourceChecksum !== previewChecksum) {
    throw new Error("远端文件内容已变化，请重新预览后再导入");
  }

  const parsed = parseMarkdownToAsset(markdown);
  if ("error" in parsed) {
    throw new Error(parsed.error.message);
  }

  return importMarkdownAsset(parsed.data, strategy, {
    sourceUrl: source.htmlUrl,
    sourceRef: source.ref,
    sourcePath: source.path,
    sourceChecksum,
    sourceImportedAt: Date.now(),
  });
}
