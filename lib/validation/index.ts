import yaml from "js-yaml";

import type { AssetType, ExportPreset } from "@/lib/constants";

export type ValidationSeverity = "error" | "warning";

export interface ValidationIssue {
  code: string;
  severity: ValidationSeverity;
  message: string;
}

export interface ValidationResult {
  issues: ValidationIssue[];
  summary: {
    errorCount: number;
    warningCount: number;
  };
}

const VALID_VARIABLE_NAME = /^[A-Za-z0-9_-]+$/;
const SKILL_FRONTMATTER_KEYS = new Set(["name", "description"]);
const SECRET_ASSIGNMENT_PATTERN =
  /\b(api[_-]?key|secret|token|password|passwd|client[_-]?secret|access[_-]?token)\b\s*[:=]\s*["']?([^\s"'`]+)["']?/gi;
const HARD_CODED_SECRET_PATTERNS = [
  {
    code: "hardcoded_openai_key",
    pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/g,
    message: "检测到疑似硬编码的 OpenAI 风格密钥，请改为变量或本地环境注入。",
  },
  {
    code: "hardcoded_github_token",
    pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b/g,
    message: "检测到疑似硬编码的 GitHub Token，请避免直接写入资产内容。",
  },
  {
    code: "hardcoded_github_pat",
    pattern: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g,
    message: "检测到疑似硬编码的 GitHub fine-grained token，请改为变量引用。",
  },
  {
    code: "hardcoded_slack_token",
    pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/g,
    message: "检测到疑似硬编码的 Slack Token，请不要在资产中保存真实凭证。",
  },
  {
    code: "hardcoded_google_api_key",
    pattern: /\bAIza[0-9A-Za-z_-]{20,}\b/g,
    message: "检测到疑似硬编码的 Google API Key，请改为变量或本地配置。",
  },
];
const HIDDEN_INSTRUCTION_PATTERNS = [
  {
    code: "hidden_instruction_html_comment",
    pattern: /<!--[\s\S]*?-->/g,
    message: "检测到 HTML 注释中的隐藏内容，可能会让指令在阅读时不可见但仍被保留。",
  },
  {
    code: "hidden_instruction_markdown_comment",
    pattern: /\[\/\/\]:\s*#\s*\((?:[\s\S]*?)\)/g,
    message: "检测到 Markdown 注释形式的隐藏内容，请确认其中没有不可见指令。",
  },
];
const PIPE_TO_SHELL_PATTERN =
  /\b(?:curl|wget)\b[^\n|]{0,400}\|\s*(?:sh|bash|zsh|fish|python|python3|ruby|node|pwsh|powershell)\b/i;
const REMOTE_INSTALL_PATTERNS = [
  {
    code: "remote_install_process_substitution",
    pattern: /\b(?:bash|sh|zsh)\s+<\(\s*(?:curl|wget)\b/i,
    message: "检测到通过远程下载内容直接执行的安装命令，请先落盘审查后再运行。",
  },
  {
    code: "remote_install_shell_c",
    pattern: /\b(?:bash|sh|zsh)\s+-c\s+["']?\$\((?:curl|wget)\b/i,
    message: "检测到通过 shell -c 执行远程下载结果的命令，请改为先下载再检查。",
  },
  {
    code: "remote_install_powershell_iex",
    pattern:
      /\b(?:iex|invoke-expression)\b\s*\(\s*(?:irm|iwr|invoke-restmethod|invoke-webrequest)\b/i,
    message: "检测到 PowerShell 远程脚本即时执行命令，请改为先下载并审查脚本。",
  },
];
const OBFUSCATED_TEXT_PATTERNS = [
  {
    code: "obfuscated_base64_blob",
    pattern: /\b(?:[A-Za-z0-9+/]{80,}={0,2})\b/g,
    message: "检测到较长的 Base64 风格字符串，请确认这不是隐藏指令或嵌入密钥。",
  },
  {
    code: "obfuscated_hex_blob",
    pattern: /\b(?:0x)?[A-Fa-f0-9]{64,}\b/g,
    message: "检测到较长的十六进制字符串，请确认这不是混淆内容或硬编码凭证。",
  },
];
const INVISIBLE_TEXT_PATTERN = /[\u200B-\u200F\u2060\uFEFF]/;

export function createValidationResult(issues: ValidationIssue[]): ValidationResult {
  return {
    issues,
    summary: {
      errorCount: issues.filter((issue) => issue.severity === "error").length,
      warningCount: issues.filter((issue) => issue.severity === "warning").length,
    },
  };
}

export function parseFrontmatterForValidation(markdown: string) {
  const trimmed = markdown.trimStart();
  if (!trimmed.startsWith("---")) {
    return { data: null as Record<string, unknown> | null };
  }

  const secondDashIndex = trimmed.slice(3).search(/^---\s*$/m);
  const secondDash = secondDashIndex === -1 ? -1 : secondDashIndex + 3;
  if (secondDash === -1) {
    return {
      error: "Frontmatter 未正确关闭：缺少第二个 ---",
    };
  }

  const frontmatterStr = trimmed.slice(3, secondDash).trim();
  try {
    const raw = yaml.load(frontmatterStr);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return { error: "Frontmatter 必须是 YAML 对象" };
    }
    return {
      data: raw as Record<string, unknown>,
    };
  } catch (error) {
    return {
      error: `YAML 解析错误：${error instanceof Error ? error.message : "未知错误"}`,
    };
  }
}

export function validateVariableSyntax(content: string) {
  const issues: ValidationIssue[] = [];
  const validMatches = Array.from(
    content.matchAll(/\{\{\s*([A-Za-z0-9_-]+)\s*\}\}/g),
  );
  const allMatches = Array.from(content.matchAll(/\{\{([\s\S]*?)\}\}/g));
  const validSet = new Set(validMatches.map((match) => match[0]));

  for (const match of allMatches) {
    const placeholder = match[0];
    const variableName = match[1].trim();
    if (!validSet.has(placeholder) || !VALID_VARIABLE_NAME.test(variableName)) {
      issues.push({
        code: "invalid_variable_placeholder",
        severity: "warning",
        message: `变量占位符格式无效：${placeholder}`,
      });
    }
  }

  const openCount = (content.match(/\{\{/g) ?? []).length;
  const closeCount = (content.match(/\}\}/g) ?? []).length;
  if (openCount !== closeCount) {
    issues.push({
      code: "unbalanced_variable_braces",
      severity: "warning",
      message: "检测到未配对的变量花括号，请检查 `{{` 与 `}}` 是否完整匹配。",
    });
  }

  return issues;
}

function isLikelySecretValue(value: string) {
  const normalized = value.trim();

  if (
    normalized.length < 12 ||
    normalized.includes("{{") ||
    normalized.includes("}}") ||
    /^\$[{(]?[A-Za-z_][A-Za-z0-9_]*(?:[)}])?$/.test(normalized) ||
    /^(?:your_|example|sample|test_|demo|placeholder|changeme|replace[-_]?me|xxx)/i.test(
      normalized,
    )
  ) {
    return false;
  }

  if (/\s/.test(normalized)) {
    return false;
  }

  const hasLetter = /[A-Za-z]/.test(normalized);
  const hasNumber = /\d/.test(normalized);
  const hasSymbol = /[_\-./+=]/.test(normalized);

  return (hasLetter && hasNumber) || (hasLetter && hasSymbol);
}

function pushIssueIfMatched(
  issues: ValidationIssue[],
  issue: Omit<ValidationIssue, "severity"> & { severity?: ValidationSeverity },
  matched: boolean,
) {
  if (!matched) {
    return;
  }

  issues.push({
    severity: issue.severity ?? "warning",
    code: issue.code,
    message: issue.message,
  });
}

export function validateSuspiciousPatterns(content: string) {
  const issues: ValidationIssue[] = [];

  for (const rule of HARD_CODED_SECRET_PATTERNS) {
    pushIssueIfMatched(issues, rule, rule.pattern.test(content));
    rule.pattern.lastIndex = 0;
  }

  let genericSecretAssignmentMatched = false;
  SECRET_ASSIGNMENT_PATTERN.lastIndex = 0;
  for (const match of content.matchAll(SECRET_ASSIGNMENT_PATTERN)) {
    if (isLikelySecretValue(match[2] ?? "")) {
      genericSecretAssignmentMatched = true;
      break;
    }
  }
  SECRET_ASSIGNMENT_PATTERN.lastIndex = 0;
  pushIssueIfMatched(
    issues,
    {
      code: "hardcoded_secret_assignment",
      message: "检测到疑似硬编码凭证赋值，请改为变量占位符或本地环境配置。",
    },
    genericSecretAssignmentMatched,
  );

  for (const rule of HIDDEN_INSTRUCTION_PATTERNS) {
    pushIssueIfMatched(issues, rule, rule.pattern.test(content));
    rule.pattern.lastIndex = 0;
  }

  pushIssueIfMatched(
    issues,
    {
      code: "hidden_instruction_invisible_text",
      message: "检测到零宽或不可见字符，请确认内容中没有隐藏指令。",
    },
    INVISIBLE_TEXT_PATTERN.test(content),
  );

  for (const rule of OBFUSCATED_TEXT_PATTERNS) {
    pushIssueIfMatched(issues, rule, rule.pattern.test(content));
    rule.pattern.lastIndex = 0;
  }

  pushIssueIfMatched(
    issues,
    {
      code: "pipe_to_shell",
      message: "检测到通过管道直接执行下载内容的命令，请先下载并审查再执行。",
    },
    PIPE_TO_SHELL_PATTERN.test(content),
  );

  for (const rule of REMOTE_INSTALL_PATTERNS) {
    pushIssueIfMatched(issues, rule, rule.pattern.test(content));
    rule.pattern.lastIndex = 0;
  }

  return issues;
}

export function validateSkillMetadata(options: {
  markdown?: string;
  title: string;
  description?: string | null;
  content: string;
  type: AssetType;
  exportPreset: ExportPreset;
  duplicateNameCount?: number;
}) {
  const issues: ValidationIssue[] = [];
  const isSkillLike =
    options.type === "agent_skill" || options.exportPreset === "codex_skill_md";

  if (!isSkillLike) {
    return issues;
  }

  const rawFrontmatter = options.markdown
    ? parseFrontmatterForValidation(options.markdown)
    : { data: null as Record<string, unknown> | null };

  if ("error" in rawFrontmatter && rawFrontmatter.error) {
    issues.push({
      code: "malformed_yaml",
      severity: "error",
      message: rawFrontmatter.error,
    });
  }

  if (rawFrontmatter.data) {
    const name = rawFrontmatter.data.name;
    const description = rawFrontmatter.data.description;

    if (typeof name !== "string" || name.trim().length === 0) {
      issues.push({
        code: "skill_missing_name",
        severity: "error",
        message: "SKILL.md frontmatter 缺少必填 `name`。",
      });
    }

    if (typeof description !== "string" || description.trim().length === 0) {
      issues.push({
        code: "skill_missing_description",
        severity: "error",
        message: "SKILL.md frontmatter 缺少必填 `description`。",
      });
    }

    const unsupportedKeys = Object.keys(rawFrontmatter.data).filter(
      (key) => !SKILL_FRONTMATTER_KEYS.has(key),
    );
    if (unsupportedKeys.length > 0) {
      issues.push({
        code: "skill_unsupported_metadata",
        severity: "warning",
        message: `SKILL.md frontmatter 包含当前未支持的字段：${unsupportedKeys.join(", ")}`,
      });
    }
  }

  if (!options.description?.trim()) {
    issues.push({
      code: "skill_weak_description",
      severity: "warning",
      message: "技能缺少单独描述，当前导出会退回使用标题作为 description。",
    });
  }

  const trimmedContent = options.content.trim();
  if (trimmedContent.length === 0) {
    issues.push({
      code: "skill_empty_body",
      severity: "warning",
      message: "技能正文为空。",
    });
  } else if (trimmedContent.length < 120) {
    issues.push({
      code: "skill_weak_body",
      severity: "warning",
      message: "技能正文偏短，可能不足以形成稳定可复用的说明。",
    });
  }

  if ((options.duplicateNameCount ?? 0) > 0) {
    issues.push({
      code: "skill_duplicate_name",
      severity: "warning",
      message: `发现 ${options.duplicateNameCount} 个同名技能资产，可能影响后续查找和维护。`,
    });
  }

  return issues;
}

export function validateAssetContent(options: {
  markdown?: string;
  title: string;
  description?: string | null;
  content: string;
  type: AssetType;
  exportPreset: ExportPreset;
  duplicateNameCount?: number;
}) {
  const validationSource =
    options.markdown ??
    [options.title, options.description ?? "", options.content].filter(Boolean).join("\n\n");
  const issues = [
    ...validateSkillMetadata(options),
    ...validateVariableSyntax(options.content),
    ...validateSuspiciousPatterns(validationSource),
  ];

  return createValidationResult(issues);
}
