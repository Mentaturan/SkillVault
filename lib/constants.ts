export const APP_NAME = "SkillVault";
export const APP_VERSION = "0.1.0-alpha";

export const ASSET_TYPES = [
  "agent_skill",
  "system_rule",
  "chat_prompt",
  "image_prompt",
  "reply_template",
  "workflow",
  "checklist",
  "sop",
  "reference",
] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

export const TARGET_TOOLS = [
  "codex",
  "trae_solo",
  "claude_code",
  "chatgpt",
  "claude",
  "gemini",
  "cursor",
  "midjourney",
  "flux",
  "stable_diffusion",
  "dalle",
  "general",
] as const;
export type TargetTool = (typeof TARGET_TOOLS)[number];

export const EXPORT_PRESETS = [
  "general_markdown",
  "codex_skill_md",
  "agents_md",
  "claude_md",
  "cursor_rules",
  "plain_text",
] as const;
export type ExportPreset = (typeof EXPORT_PRESETS)[number];

export const ASSET_STATUSES = [
  "draft",
  "active",
  "deprecated",
  "archived",
] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];

export const ASSET_SOURCES = [
  "self_created",
  "imported",
  "captured",
  "downloaded",
] as const;
export type AssetSource = (typeof ASSET_SOURCES)[number];

export const VISIBILITIES = ["private", "unlisted", "public"] as const;
export type Visibility = (typeof VISIBILITIES)[number];

export const TEST_CASE_KINDS = ["test_case", "run_log"] as const;
export type TestCaseKind = (typeof TEST_CASE_KINDS)[number];

export const SORT_OPTIONS = [
  "updatedAt_desc",
  "createdAt_desc",
  "rating_desc",
  "title_asc",
  "lastUsedAt_desc",
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const IMPORT_CONFLICT_STRATEGIES = [
  "overwrite",
  "copy",
  "cancel",
] as const;
export type ImportConflictStrategy = (typeof IMPORT_CONFLICT_STRATEGIES)[number];

export const DEFAULT_ASSET_VALUES = {
  type: "chat_prompt",
  targetTool: "general",
  exportPreset: "general_markdown",
  status: "draft",
  source: "self_created",
  visibility: "private",
  pinned: false,
} as const satisfies {
  type: AssetType;
  targetTool: TargetTool;
  exportPreset: ExportPreset;
  status: AssetStatus;
  source: AssetSource;
  visibility: Visibility;
  pinned: boolean;
};

export const RATING_MIN = 1;
export const RATING_MAX = 5;

export const MARKDOWN_FILE_EXTENSION = ".md";
export const MARKDOWN_FILENAME_PATTERN = "{slug}.{syncId}.md";

export const VARIABLE_PATTERN = /\{\{\s*([A-Za-z0-9_-]+)\s*\}\}/g;

export const PAGE_ROUTES = {
  dashboard: "/",
  assets: "/assets",
  newAsset: "/assets/new",
  import: "/import",
  collections: "/collections",
  settings: "/settings",
} as const;
