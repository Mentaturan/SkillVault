import { describe, it, expect } from "vitest";
import { createContentHash } from "@/lib/hash";

describe("createContentHash", () => {
  it("returns a 64-character hex string", () => {
    const hash = createContentHash("test content");
    expect(hash).toHaveLength(64);
    expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
  });

  it("produces deterministic results", () => {
    const hash1 = createContentHash("same content");
    const hash2 = createContentHash("same content");
    expect(hash1).toBe(hash2);
  });

  it("produces different hashes for different content", () => {
    const hash1 = createContentHash("content a");
    const hash2 = createContentHash("content b");
    expect(hash1).not.toBe(hash2);
  });

  it("handles empty string", () => {
    const hash = createContentHash("");
    expect(hash).toHaveLength(64);
  });
});
