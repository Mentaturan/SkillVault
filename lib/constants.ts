export const APP_NAME = "SkillVault";
export const APP_VERSION = "0.3.1";

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

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  agent_skill: "Agent 技能",
  system_rule: "系统规则",
  chat_prompt: "聊天提示词",
  image_prompt: "图像提示词",
  reply_template: "回复模板",
  workflow: "工作流",
  checklist: "检查清单",
  sop: "标准作业流程",
  reference: "参考资料",
};

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

export const TARGET_TOOL_LABELS: Record<TargetTool, string> = {
  codex: "Codex",
  trae_solo: "Trae Solo",
  claude_code: "Claude Code",
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  cursor: "Cursor",
  midjourney: "Midjourney",
  flux: "Flux",
  stable_diffusion: "Stable Diffusion",
  dalle: "DALL-E",
  general: "通用",
};

export const EXPORT_PRESETS = [
  "general_markdown",
  "codex_skill_md",
  "agents_md",
  "claude_md",
  "cursor_rules",
  "plain_text",
] as const;
export type ExportPreset = (typeof EXPORT_PRESETS)[number];

export const EXPORT_PRESET_LABELS: Record<ExportPreset, string> = {
  general_markdown: "通用 Markdown",
  codex_skill_md: "Codex Skill Markdown",
  agents_md: "AGENTS.md",
  claude_md: "CLAUDE.md",
  cursor_rules: "Cursor Rules",
  plain_text: "纯文本",
};

export const ASSET_STATUSES = [
  "draft",
  "active",
  "deprecated",
  "archived",
] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  draft: "草稿",
  active: "启用",
  deprecated: "已弃用",
  archived: "已归档",
};

export const ASSET_SOURCES = [
  "self_created",
  "imported",
  "captured",
  "downloaded",
] as const;
export type AssetSource = (typeof ASSET_SOURCES)[number];

export const ASSET_SOURCE_LABELS: Record<AssetSource, string> = {
  self_created: "自建",
  imported: "导入",
  captured: "捕获",
  downloaded: "下载",
};

export const VISIBILITIES = ["private", "unlisted", "public"] as const;
export type Visibility = (typeof VISIBILITIES)[number];

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  private: "私有",
  unlisted: "未列出",
  public: "公开",
};

export const TEST_CASE_KINDS = ["test_case", "run_log"] as const;
export type TestCaseKind = (typeof TEST_CASE_KINDS)[number];

export const DEPLOYMENT_TARGET_KEYS = [
  "codex",
  "claude_code",
  "cursor",
  "windsurf",
  "trae",
  "generic_folder",
] as const;
export type DeploymentTargetKey = (typeof DEPLOYMENT_TARGET_KEYS)[number];

export const DEPLOYMENT_TARGET_LABELS: Record<DeploymentTargetKey, string> = {
  codex: "Codex",
  claude_code: "Claude Code",
  cursor: "Cursor",
  windsurf: "Windsurf",
  trae: "Trae",
  generic_folder: "通用目录",
};

export const DEPLOYMENT_TARGET_DESCRIPTIONS: Record<DeploymentTargetKey, string> = {
  codex: "部署到本地 Codex 规则或技能目录。",
  claude_code: "部署到本地 Claude Code 规则目录。",
  cursor: "部署到本地 Cursor rules 目录。",
  windsurf: "部署到本地 Windsurf 规则目录。",
  trae: "部署到本地 Trae 规则目录。",
  generic_folder: "部署到任意自定义本地目录。",
};

export const DEPLOYMENT_TARGET_PATH_PLACEHOLDERS: Record<DeploymentTargetKey, string> = {
  codex: "/absolute/path/to/codex",
  claude_code: "/absolute/path/to/claude-code",
  cursor: "/absolute/path/to/cursor-rules",
  windsurf: "/absolute/path/to/windsurf",
  trae: "/absolute/path/to/trae",
  generic_folder: "/absolute/path/to/folder",
};

export const DEPLOYMENT_STATUSES = [
  "not_deployed",
  "installed",
  "stale",
  "missing",
  "broken",
] as const;
export type DeploymentStatus = (typeof DEPLOYMENT_STATUSES)[number];

export const DEPLOYMENT_STATUS_LABELS: Record<DeploymentStatus, string> = {
  not_deployed: "未部署",
  installed: "已部署",
  stale: "已过期",
  missing: "目标文件缺失",
  broken: "目标文件漂移",
};

export const SORT_OPTIONS = [
  "updatedAt_desc",
  "createdAt_desc",
  "rating_desc",
  "title_asc",
  "lastUsedAt_desc",
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const SORT_OPTION_LABELS: Record<SortOption, string> = {
  updatedAt_desc: "最近更新",
  createdAt_desc: "最新创建",
  rating_desc: "评分最高",
  title_asc: "标题 A-Z",
  lastUsedAt_desc: "最近使用",
};

export const IMPORT_CONFLICT_STRATEGIES = [
  "overwrite",
  "copy",
  "cancel",
] as const;
export type ImportConflictStrategy = (typeof IMPORT_CONFLICT_STRATEGIES)[number];

export const RESTORE_CONFLICT_STRATEGIES = [
  "skip",
  "overwrite",
  "copy",
] as const;
export type RestoreConflictStrategy = (typeof RESTORE_CONFLICT_STRATEGIES)[number];

export const RESTORE_CONFLICT_STRATEGY_LABELS: Record<RestoreConflictStrategy, string> = {
  skip: "跳过冲突项",
  overwrite: "按 syncId 覆盖",
  copy: "复制为新 syncId",
};

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
  projects: "/projects",
  restore: "/restore",
  settings: "/settings",
} as const;
