import yaml from "js-yaml";
import type { ParsedMarkdownAsset, ParseError } from "./types";
import {
  ASSET_TYPES,
  TARGET_TOOLS,
  EXPORT_PRESETS,
  ASSET_STATUSES,
  VISIBILITIES,
  ASSET_SOURCES,
  DEFAULT_ASSET_VALUES,
  type AssetType,
  type TargetTool,
  type ExportPreset,
  type AssetStatus,
  type Visibility,
  type AssetSource,
} from "@/lib/constants";
import { createId } from "@/lib/id";
import { isSkillMd, parseSkillMd } from "./skill-md";

function validateEnum<T extends string>(value: unknown, values: readonly T[], fallback: T): T {
  if (typeof value === "string" && (values as readonly string[]).includes(value)) {
    return value as T;
  }
  return fallback;
}

function validateOptionalEnum<T extends string>(value: unknown, values: readonly T[]): T | undefined {
  if (typeof value === "string" && (values as readonly string[]).includes(value)) {
    return value as T;
  }
  return undefined;
}

export function parseMarkdownToAsset(
  markdown: string,
): { data: ParsedMarkdownAsset } | { error: ParseError } {
  if (isSkillMd(markdown)) {
    return parseSkillMd(markdown);
  }

  const trimmed = markdown.trimStart();

  if (!trimmed.startsWith("---")) {
    return {
      data: {
        frontmatter: {
          syncId: createId(),
          title: "未命名资产",
          type: DEFAULT_ASSET_VALUES.type,
          targetTool: DEFAULT_ASSET_VALUES.targetTool,
          exportPreset: DEFAULT_ASSET_VALUES.exportPreset,
        },
        content: trimmed,
      },
    };
  }

  const secondDashIndex = trimmed.slice(3).search(/^---\s*$/m);
  const secondDash = secondDashIndex === -1 ? -1 : secondDashIndex + 3;
  if (secondDash === -1) {
    return { error: { message: "Frontmatter 未正确关闭：缺少第二个 ---" } };
  }

  const frontmatterStr = trimmed.slice(3, secondDash).trim();
  const content = trimmed.slice(secondDash + 3).trimStart();

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

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { error: { message: "Frontmatter 必须是 YAML 对象" } };
  }

  const syncId =
    typeof raw.syncId === "string" && raw.syncId.trim()
      ? raw.syncId.trim()
      : createId();

  const title =
    typeof raw.title === "string" && raw.title.trim()
      ? raw.title.trim()
      : "未命名资产";

  const type = validateEnum<AssetType>(raw.type, ASSET_TYPES, DEFAULT_ASSET_VALUES.type);
  const targetTool = validateEnum<TargetTool>(raw.targetTool, TARGET_TOOLS, DEFAULT_ASSET_VALUES.targetTool);
  const exportPreset = validateEnum<ExportPreset>(raw.exportPreset, EXPORT_PRESETS, DEFAULT_ASSET_VALUES.exportPreset);
  const status = validateOptionalEnum<AssetStatus>(raw.status, ASSET_STATUSES);
  const visibility = validateOptionalEnum<Visibility>(raw.visibility, VISIBILITIES);
  const source = validateOptionalEnum<AssetSource>(raw.source, ASSET_SOURCES);

  const sourceUrl =
    typeof raw.sourceUrl === "string" ? raw.sourceUrl : null;
  const sourceRef =
    typeof raw.sourceRef === "string" ? raw.sourceRef : null;
  const sourcePath =
    typeof raw.sourcePath === "string" ? raw.sourcePath : null;
  const sourceImportedAt =
    typeof raw.sourceImportedAt === "number" ? raw.sourceImportedAt : null;
  const sourceChecksum =
    typeof raw.sourceChecksum === "string" ? raw.sourceChecksum : null;

  const pinned =
    typeof raw.pinned === "boolean" ? raw.pinned : undefined;

  const description =
    typeof raw.description === "string" ? raw.description : null;

  const scenario =
    typeof raw.scenario === "string" ? raw.scenario : null;

  const tags = Array.isArray(raw.tags)
    ? raw.tags.filter((t): t is string => typeof t === "string")
    : undefined;

  return {
    data: {
      frontmatter: {
        syncId,
        title,
        type,
        targetTool,
        exportPreset,
        status,
        visibility,
        source,
        sourceUrl,
        sourceRef,
        sourcePath,
        sourceImportedAt,
        sourceChecksum,
        pinned,
        description,
        scenario,
        tags,
      },
      content: content || "",
    },
  };
}
