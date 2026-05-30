import { describe, it, expect } from "vitest";
import { diffTextSnapshots } from "@/lib/version-diff";

describe("diffTextSnapshots", () => {
  it("returns unchanged for identical text", () => {
    const diff = diffTextSnapshots("line1\nline2", "line1\nline2");
    expect(diff.every((d) => d.type === "unchanged")).toBe(true);
    expect(diff).toHaveLength(2);
  });

  it("detects added lines", () => {
    const diff = diffTextSnapshots("line1", "line1\nline2");
    const added = diff.filter((d) => d.type === "added");
    expect(added).toHaveLength(1);
    expect(added[0].text).toBe("line2");
  });

  it("detects removed lines", () => {
    const diff = diffTextSnapshots("line1\nline2", "line1");
    const removed = diff.filter((d) => d.type === "removed");
    expect(removed).toHaveLength(1);
    expect(removed[0].text).toBe("line2");
  });

  it("handles empty old text", () => {
    const diff = diffTextSnapshots("", "line1\nline2");
    const added = diff.filter((d) => d.type === "added");
    expect(added.length).toBeGreaterThanOrEqual(2);
  });

  it("handles empty new text", () => {
    const diff = diffTextSnapshots("line1\nline2", "");
    const removed = diff.filter((d) => d.type === "removed");
    expect(removed.length).toBeGreaterThanOrEqual(2);
  });

  it("assigns correct line numbers", () => {
    const diff = diffTextSnapshots("a\nb", "a\nc");
    expect(diff[0].type).toBe("unchanged");
    expect(diff[0].oldLineNumber).toBe(1);
    expect(diff[0].newLineNumber).toBe(1);
  });
});
