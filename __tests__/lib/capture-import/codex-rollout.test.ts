import { describe, it, expect } from "vitest";
import { parseCodexRolloutImport } from "@/lib/capture-import/codex-rollout";

const LONG_ASSISTANT_TEXT = "This is a sufficiently long assistant response that exceeds the one hundred forty character minimum threshold for inclusion in the import candidates list and should be accepted";

describe("parseCodexRolloutImport", () => {
  it("parses valid JSONL with session_meta and response_item", () => {
    const jsonl = [
      JSON.stringify({ type: "session_meta", payload: { id: "sess1", cwd: "/home", timestamp: "2025-01-01T00:00:00Z" } }),
      JSON.stringify({
        type: "response_item",
        timestamp: "2025-01-01T00:01:00Z",
        payload: { type: "message", role: "user", content: [{ type: "input_text", text: "Hello, this is a user message that is long enough to pass the filter" }] },
      }),
    ].join("\n");

    const result = parseCodexRolloutImport(jsonl, "/test/path");
    expect(result.sessionId).toBe("sess1");
    expect(result.cwd).toBe("/home");
    expect(result.candidates.length).toBeGreaterThan(0);
  });

  it("skips malformed JSON lines instead of throwing", () => {
    const jsonl = [
      "this is not valid json{{{",
      JSON.stringify({ type: "session_meta", payload: { id: "sess2" } }),
      JSON.stringify({
        type: "response_item",
        timestamp: "2025-01-01T00:01:00Z",
        payload: { type: "message", role: "assistant", content: [{ type: "output_text", text: LONG_ASSISTANT_TEXT }] },
      }),
    ].join("\n");

    const result = parseCodexRolloutImport(jsonl, "/test/path");
    expect(result.sessionId).toBe("sess2");
    expect(result.candidates.length).toBeGreaterThan(0);
  });

  it("throws for empty file", () => {
    expect(() => parseCodexRolloutImport("", "/test/path")).toThrow("Rollout 文件为空");
  });

  it("throws when no candidates extracted", () => {
    const jsonl = JSON.stringify({ type: "session_meta", payload: { id: "sess3" } });
    expect(() => parseCodexRolloutImport(jsonl, "/test/path")).toThrow();
  });

  it("skips short assistant messages", () => {
    const jsonl = [
      JSON.stringify({ type: "session_meta", payload: { id: "sess4" } }),
      JSON.stringify({
        type: "response_item",
        timestamp: "2025-01-01T00:01:00Z",
        payload: { type: "message", role: "assistant", content: [{ type: "output_text", text: "Short" }] },
      }),
    ].join("\n");

    expect(() => parseCodexRolloutImport(jsonl, "/test/path")).toThrow();
  });
});
