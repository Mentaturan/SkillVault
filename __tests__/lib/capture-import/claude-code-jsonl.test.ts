import { describe, it, expect } from "vitest";
import path from "node:path";
import fs from "node:fs";
import { parseClaudeCodeJsonlImport } from "@/lib/capture-import/claude-code-jsonl";

const fixturePath = path.join(
  __dirname,
  "../../fixtures/capture/claude-code-session.jsonl",
);

describe("parseClaudeCodeJsonlImport", () => {
  it("extracts candidates from fixture file", () => {
    const jsonl = fs.readFileSync(fixturePath, "utf8");
    const result = parseClaudeCodeJsonlImport(jsonl, "/test/path");

    expect(result.candidates.length).toBeGreaterThan(0);
  });

  it("skips system messages", () => {
    const jsonl = fs.readFileSync(fixturePath, "utf8");
    const result = parseClaudeCodeJsonlImport(jsonl, "/test/path");

    const systemCandidates = result.candidates.filter(
      (c) => c.role !== "user" && c.role !== "assistant",
    );
    expect(systemCandidates.length).toBe(0);
  });

  it("skips short user messages", () => {
    const jsonl = fs.readFileSync(fixturePath, "utf8");
    const result = parseClaudeCodeJsonlImport(jsonl, "/test/path");

    const userCandidates = result.candidates.filter(
      (c) => c.role === "user",
    );
    expect(userCandidates.length).toBe(1);
    expect(userCandidates[0].rawContent).toContain("React component");
  });

  it("skips short assistant messages", () => {
    const jsonl = fs.readFileSync(fixturePath, "utf8");
    const result = parseClaudeCodeJsonlImport(jsonl, "/test/path");

    const assistantCandidates = result.candidates.filter(
      (c) => c.role === "assistant",
    );
    expect(assistantCandidates.length).toBe(1);
    expect(assistantCandidates[0].rawContent).toContain("React Data Fetching");
  });

  it("candidates have correct role", () => {
    const jsonl = fs.readFileSync(fixturePath, "utf8");
    const result = parseClaudeCodeJsonlImport(jsonl, "/test/path");

    for (const candidate of result.candidates) {
      expect(candidate.role).oneOf(["user", "assistant"]);
    }
  });

  it("candidates have correct title", () => {
    const jsonl = fs.readFileSync(fixturePath, "utf8");
    const result = parseClaudeCodeJsonlImport(jsonl, "/test/path");

    for (const candidate of result.candidates) {
      expect(candidate.title.length).toBeGreaterThan(0);
    }
  });

  it("candidates have rawContent", () => {
    const jsonl = fs.readFileSync(fixturePath, "utf8");
    const result = parseClaudeCodeJsonlImport(jsonl, "/test/path");

    for (const candidate of result.candidates) {
      expect(candidate.rawContent.length).toBeGreaterThan(0);
    }
  });

  it("extractionNote contains Claude Code reference", () => {
    const jsonl = fs.readFileSync(fixturePath, "utf8");
    const result = parseClaudeCodeJsonlImport(jsonl, "/test/path");

    for (const candidate of result.candidates) {
      expect(candidate.extractionNote).toContain("Claude Code");
    }
  });
});
