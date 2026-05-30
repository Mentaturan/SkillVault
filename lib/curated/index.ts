import { promises as fs } from "fs";
import { join } from "path";
import { parseMarkdownToAsset } from "@/lib/markdown";
import type { CuratedExamplePreview } from "./types";

const CURATED_FILES = [
  "code-review-checklist.md",
  "git-commit-workflow.md",
  "react-component-rule.md",
  "bug-fix-prompt.md",
  "api-design-skill.md",
  "refactor-checklist.md",
] as const;

export type CuratedFilename = (typeof CURATED_FILES)[number];

function getCuratedDir(): string {
  return join(process.cwd(), "lib", "curated");
}

export async function getCuratedExamples(): Promise<CuratedExamplePreview[]> {
  const dir = getCuratedDir();
  const results: CuratedExamplePreview[] = [];

  for (const filename of CURATED_FILES) {
    const filePath = join(dir, filename);
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = parseMarkdownToAsset(raw);

    if ("error" in parsed) {
      continue;
    }

    const { frontmatter } = parsed.data;
    results.push({
      filename,
      title: frontmatter.title,
      type: frontmatter.type,
      targetTool: frontmatter.targetTool,
      description: frontmatter.description ?? "",
      tags: frontmatter.tags ?? [],
    });
  }

  return results;
}

export async function getCuratedExampleContent(filename: string): Promise<string> {
  if (!CURATED_FILES.includes(filename as CuratedFilename)) {
    throw new Error(`Invalid curated filename: ${filename}`);
  }

  const filePath = join(getCuratedDir(), filename);
  return fs.readFile(filePath, "utf-8");
}
