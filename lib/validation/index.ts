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

  const secondDash = trimmed.indexOf("---", 3);
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
  const issues = [
    ...validateSkillMetadata(options),
    ...validateVariableSyntax(options.content),
  ];

  return createValidationResult(issues);
}
