import { createContentHash } from "@/lib/hash";

export interface ClaudeCodeConversation {
  type: "human" | "assistant" | "system";
  message: {
    role: string;
    content: Array<{ type: string; text?: string }>;
    model?: string;
  };
  timestamp?: string;
}

export interface CaptureCandidate {
  id: string;
  rawContent: string;
  sourceType: "claude_code_jsonl";
  sourcePath: string;
  sourceLine: number;
  suggestedTitle: string;
  confidence: number;
  extractedAt: number;
}

export interface ValidationResult {
  valid: boolean;
  issues: string[];
  score: number;
}

interface ParsedLine {
  lineIndex: number;
  data: ClaudeCodeConversation;
}

const USER_MIN_LENGTH = 100;
const ASSISTANT_MIN_LENGTH = 140;
const TITLE_MAX_LENGTH = 50;
const VALIDATE_MIN_LENGTH = 50;
const VALIDATE_TEXT_RATIO = 0.5;

const SUSPICIOUS_PATTERNS = [
  /(?:api[_-]?key|apikey)\s*[:=]\s*\S+/i,
  /(?:password|passwd|pwd)\s*[:=]\s*\S+/i,
  /(?:secret|token)\s*[:=]\s*\S+/i,
  /sk-[a-zA-Z0-9]{20,}/,
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/,
];

const STRUCTURED_PATTERNS = [
  /^\s*\d+\.\s+/m,
  /^\s*[-*]\s+/m,
  /^#{1,6}\s+/m,
  /```/,
  /^\s*(?:step|步骤)\s*\d+/im,
];

function collectText(
  content: Array<{ type: string; text?: string }> | undefined,
): string {
  return (content ?? [])
    .filter((item) => item.type === "text" && item.text)
    .map((item) => item.text!.trim())
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function toTimestamp(value: string | undefined): number | null {
  if (!value) return null;
  const ts = new Date(value).getTime();
  return Number.isNaN(ts) ? null : ts;
}

function hasStructuredInstructions(text: string): boolean {
  return STRUCTURED_PATTERNS.some((p) => p.test(text));
}

function computeConfidence(
  role: "human" | "assistant",
  text: string,
): number {
  let score = 0;

  if (role === "human") {
    score += 0.3;
    if (text.length > 200) score += 0.1;
    if (text.length > 500) score += 0.1;
  } else {
    score += 0.2;
    if (hasStructuredInstructions(text)) score += 0.3;
    if (text.length > 300) score += 0.1;
    if (text.length > 600) score += 0.1;
  }

  return Math.min(score, 1);
}

function toSuggestedTitle(text: string): string {
  const firstLine =
    text
      .split("\n")
      .map((l) => l.trim())
      .find(Boolean) ?? text.trim();

  const normalized = firstLine.replace(/^#+\s*/, "");
  return normalized.length > TITLE_MAX_LENGTH
    ? `${normalized.slice(0, TITLE_MAX_LENGTH)}...`
    : normalized;
}

function codeBlockRatio(text: string): number {
  const codeBlockRegex = /```[\s\S]*?```/g;
  let codeLength = 0;
  let match: RegExpExecArray | null;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    codeLength += match[0].length;
  }
  return text.length === 0 ? 0 : codeLength / text.length;
}

function hasSuspiciousContent(text: string): boolean {
  return SUSPICIOUS_PATTERNS.some((p) => p.test(text));
}

export function parseClaudeCodeJSONL(content: string): ClaudeCodeConversation[] {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const results: ClaudeCodeConversation[] = [];

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line) as ClaudeCodeConversation;
      if (
        parsed.type === "human" ||
        parsed.type === "assistant" ||
        parsed.type === "system"
      ) {
        results.push(parsed);
      }
    } catch {
      continue;
    }
  }

  return results;
}

export function extractCandidates(
  conversation: ClaudeCodeConversation[],
  sourcePath: string,
): CaptureCandidate[] {
  const candidates: CaptureCandidate[] = [];
  const now = Date.now();

  for (let i = 0; i < conversation.length; i++) {
    const entry = conversation[i];
    const text = collectText(entry.message.content);
    if (!text) continue;

    const role = entry.type;
    if (role !== "human" && role !== "assistant") continue;

    if (role === "human" && text.length < USER_MIN_LENGTH) continue;
    if (role === "assistant" && text.length < ASSISTANT_MIN_LENGTH) continue;

    if (role === "assistant" && !hasStructuredInstructions(text)) continue;

    const confidence = computeConfidence(role, text);
    const lineIndex = i + 1;
    const id = createContentHash(
      `claude_code_jsonl:${sourcePath}:${lineIndex}:${text}`,
    ).slice(0, 16);

    candidates.push({
      id,
      rawContent: text,
      sourceType: "claude_code_jsonl",
      sourcePath,
      sourceLine: lineIndex,
      suggestedTitle: toSuggestedTitle(text),
      confidence,
      extractedAt: now,
    });
  }

  return candidates;
}

export function validateCandidate(candidate: CaptureCandidate): ValidationResult {
  const issues: string[] = [];
  let score = 100;
  const text = candidate.rawContent;

  if (text.length < VALIDATE_MIN_LENGTH) {
    issues.push("内容过短（少于 50 字符）");
    score -= 30;
  }

  const codeRatio = codeBlockRatio(text);
  if (codeRatio > VALIDATE_TEXT_RATIO) {
    issues.push("代码块占比过高（超过 50%）");
    score -= 25;
  }

  if (hasSuspiciousContent(text)) {
    issues.push("内容包含可疑模式（API 密钥、密码等）");
    score -= 40;
  }

  score = Math.max(0, Math.min(100, score));
  return {
    valid: issues.length === 0,
    issues,
    score,
  };
}
