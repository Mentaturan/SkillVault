import { createContentHash } from "@/lib/hash";

export interface CodexRolloutImportCandidate {
  candidateKey: string;
  title: string;
  rawContent: string;
  sourceTimestamp: number | null;
  extractionNote: string;
  role: "user" | "assistant";
}

export interface CodexRolloutImportPreview {
  sessionId: string;
  sessionStartedAt: number | null;
  cwd: string | null;
  sourcePath: string;
  candidates: CodexRolloutImportCandidate[];
}

interface RolloutLine {
  timestamp?: string;
  type?: string;
  payload?: {
    id?: string;
    cwd?: string;
    timestamp?: string;
    type?: string;
    role?: string;
    content?: Array<{ type?: string; text?: string }>;
  };
}

const USER_SKIP_PREFIXES = [
  "# AGENTS.md instructions for ",
  "/goal ",
  "<goal_context>",
] as const;

function toTimestamp(value: string | undefined) {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function collectText(content: Array<{ type?: string; text?: string }> | undefined) {
  return (content ?? [])
    .filter((item) => item.type === "input_text" || item.type === "output_text")
    .map((item) => item.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function shouldSkipUserMessage(text: string) {
  return USER_SKIP_PREFIXES.some((prefix) => text.startsWith(prefix));
}

function shouldSkipAssistantMessage(text: string) {
  return text.length < 140;
}

function toCandidateTitle(role: "user" | "assistant", text: string) {
  const firstLine =
    text
      .split("\n")
      .map((line) => line.trim())
      .find(Boolean) ?? text.trim();
  const normalized = firstLine.replace(/^#+\s*/, "");
  const prefix = role === "user" ? "Codex 用户消息" : "Codex 助手输出";
  const short = normalized.length > 70 ? `${normalized.slice(0, 70)}...` : normalized;
  return `${prefix}: ${short}`;
}

export function parseCodexRolloutImport(
  jsonl: string,
  sourcePath: string,
): CodexRolloutImportPreview {
  const lines = jsonl
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    throw new Error("Rollout 文件为空。");
  }

  let sessionId = "";
  let sessionStartedAt: number | null = null;
  let cwd: string | null = null;
  const candidates: CodexRolloutImportCandidate[] = [];

  for (const line of lines) {
    let parsed: RolloutLine;
    try {
      parsed = JSON.parse(line) as RolloutLine;
    } catch {
      continue;
    }

    if (parsed.type === "session_meta") {
      sessionId = parsed.payload?.id ?? sessionId;
      sessionStartedAt = toTimestamp(parsed.payload?.timestamp) ?? sessionStartedAt;
      cwd = parsed.payload?.cwd ?? cwd;
      continue;
    }

    if (parsed.type !== "response_item" || parsed.payload?.type !== "message") {
      continue;
    }

    const role =
      parsed.payload.role === "user" || parsed.payload.role === "assistant"
        ? parsed.payload.role
        : null;
    if (!role) {
      continue;
    }

    const text = collectText(parsed.payload.content);
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
      `Imported from Codex rollout ${sessionLabel}.`,
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
    throw new Error("未从该 Codex rollout 中提取到可导入的文本候选。");
  }

  return {
    sessionId: sessionId || "unknown-session",
    sessionStartedAt,
    cwd,
    sourcePath,
    candidates,
  };
}
