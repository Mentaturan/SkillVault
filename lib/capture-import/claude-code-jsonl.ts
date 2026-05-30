import { createContentHash } from "@/lib/hash";

export interface ClaudeCodeJsonlImportCandidate {
  candidateKey: string;
  title: string;
  rawContent: string;
  sourceTimestamp: number | null;
  extractionNote: string;
  role: "user" | "assistant";
}

export interface ClaudeCodeJsonlImportPreview {
  sessionId: string;
  sessionStartedAt: number | null;
  cwd: string | null;
  sourcePath: string;
  candidates: ClaudeCodeJsonlImportCandidate[];
}

interface JsonlLine {
  type?: string;
  timestamp?: string;
  message?: {
    role?: string;
    content?: string | Array<{ type?: string; text?: string }>;
  };
  sessionId?: string;
  cwd?: string;
}

function toTimestamp(value: string | undefined) {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function extractText(
  content: string | Array<{ type?: string; text?: string }> | undefined,
): string {
  if (!content) {
    return "";
  }

  if (typeof content === "string") {
    return content.trim();
  }

  return content
    .filter((item) => item.type === "text")
    .map((item) => item.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

const USER_SKIP_PREFIXES = [
  "<system-reminder>",
  "<env>",
  "<tool_result>",
] as const;

function shouldSkipUserMessage(text: string) {
  if (text.length < 20) {
    return true;
  }

  return USER_SKIP_PREFIXES.some((prefix) => text.startsWith(prefix));
}

function shouldSkipAssistantMessage(text: string) {
  return text.length < 100;
}

function toCandidateTitle(role: "user" | "assistant", text: string) {
  const firstLine =
    text
      .split("\n")
      .map((line) => line.trim())
      .find(Boolean) ?? text.trim();
  const normalized = firstLine.replace(/^#+\s*/, "");
  const prefix = role === "user" ? "Claude Code 用户消息" : "Claude Code 助手输出";
  const short = normalized.length > 70 ? `${normalized.slice(0, 70)}...` : normalized;
  return `${prefix}: ${short}`;
}

export function parseClaudeCodeJsonlImport(
  jsonl: string,
  sourcePath: string,
): ClaudeCodeJsonlImportPreview {
  const lines = jsonl
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    throw new Error("JSONL 文件为空。");
  }

  let sessionId = "";
  let sessionStartedAt: number | null = null;
  let cwd: string | null = null;
  const candidates: ClaudeCodeJsonlImportCandidate[] = [];

  for (const line of lines) {
    let parsed: JsonlLine;
    try {
      parsed = JSON.parse(line) as JsonlLine;
    } catch {
      continue;
    }

    if (parsed.sessionId && !sessionId) {
      sessionId = parsed.sessionId;
    }

    if (parsed.cwd && !cwd) {
      cwd = parsed.cwd;
    }

    if (parsed.timestamp && !sessionStartedAt) {
      sessionStartedAt = toTimestamp(parsed.timestamp);
    }

    if (parsed.type !== "user" && parsed.type !== "assistant") {
      continue;
    }

    const role =
      parsed.message?.role === "user" || parsed.message?.role === "assistant"
        ? parsed.message.role
        : null;
    if (!role) {
      continue;
    }

    const text = extractText(parsed.message?.content);
    if (!text) {
      continue;
    }

    if (role === "user" && shouldSkipUserMessage(text)) {
      continue;
    }

    if (role === "assistant" && shouldSkipAssistantMessage(text)) {
      continue;
    }

    const sourceTimestamp = toTimestamp(parsed.timestamp);
    const candidateKey = createContentHash(
      `${parsed.timestamp ?? "no-ts"}:${role}:${text}`,
    ).slice(0, 16);
    const sessionLabel = sessionId || "unknown-session";
    const extractionNote = [
      `Imported from Claude Code JSONL ${sessionLabel}.`,
      `Role: ${role}.`,
      cwd ? `Workspace: ${cwd}.` : null,
    ]
      .filter(Boolean)
      .join(" ");

    candidates.push({
      candidateKey,
      title: toCandidateTitle(role, text),
      rawContent: text,
      sourceTimestamp,
      extractionNote,
      role,
    });
  }

  if (candidates.length === 0) {
    throw new Error("未从该 Claude Code JSONL 中提取到可导入的文本候选。");
  }

  return {
    sessionId: sessionId || "unknown-session",
    sessionStartedAt,
    cwd,
    sourcePath,
    candidates,
  };
}
