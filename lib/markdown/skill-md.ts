import yaml from "js-yaml";
import type { ParsedMarkdownAsset, ParseError } from "./types";
import type { Asset, Tag } from "@/db/schema";
import { createId } from "@/lib/id";
import { renderCodexSkill } from "./presets/codex-skill";

interface AssetWithTags extends Asset {
  assetTags?: Array<{ tag: Tag }>;
}

export function isSkillMd(markdown: string): boolean {
  const trimmed = markdown.trimStart();
  if (!trimmed.startsWith("---")) return false;

  const secondDash = trimmed.indexOf("---", 3);
  if (secondDash === -1) return false;

  const frontmatterStr = trimmed.slice(3, secondDash).trim();
  let raw: Record<string, unknown>;
  try {
    raw = yaml.load(frontmatterStr) as Record<string, unknown>;
  } catch {
    return false;
  }

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;

  const hasName = typeof raw.name === "string" && raw.name.trim().length > 0;
  const hasDescription = typeof raw.description === "string" && raw.description.trim().length > 0;
  const hasSyncId = typeof raw.syncId === "string" && raw.syncId.trim().length > 0;

  return hasName && hasDescription && !hasSyncId;
}

function extractExamplesSection(content: string): { scenario: string | null; remainingContent: string } {
  const examplesRegex = /^##\s+Examples\s*\n([\s\S]*?)(?=\n##\s|$)/m;
  const match = content.match(examplesRegex);

  if (!match) return { scenario: null, remainingContent: content };

  const examplesText = match[1].trim();
  const lines = examplesText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(1).trim());

  const scenario = lines.length > 0 ? lines.join("\n") : examplesText;
  const remainingContent = content.replace(match[0], "\n").trim();

  return { scenario, remainingContent };
}

export function parseSkillMd(
  markdown: string,
): { data: ParsedMarkdownAsset } | { error: ParseError } {
  const trimmed = markdown.trimStart();
  const secondDash = trimmed.indexOf("---", 3);
  const frontmatterStr = trimmed.slice(3, secondDash).trim();
  const rawContent = trimmed.slice(secondDash + 3).trimStart();

  let raw: Record<string, unknown>;
  try {
    raw = yaml.load(frontmatterStr) as Record<string, unknown>;
  } catch (e) {
    return {
      error: {
        message: `YAML 解析错误：${e instanceof Error ? e.message : "未知错误"}`,
      },
    };
  }

  const name = (raw.name as string).trim();
  const description = (raw.description as string).trim();

  const { scenario, remainingContent } = extractExamplesSection(rawContent);

  return {
    data: {
      frontmatter: {
        syncId: createId(),
        title: name,
        type: "agent_skill",
        targetTool: "codex",
        exportPreset: "codex_skill_md",
        description,
        scenario,
      },
      content: remainingContent,
    },
  };
}

export function renderSkillMd(asset: AssetWithTags): string {
  return renderCodexSkill(asset);
}
