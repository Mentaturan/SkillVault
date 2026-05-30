import { describe, it, expect } from "vitest";

function isSafePath(inputPath: string): boolean {
  const resolved = inputPath.replace(/\/+/g, "/");
  if (resolved.includes("..")) return false;
  if (!resolved.startsWith("/")) return false;
  return true;
}

describe("scan-directory path validation", () => {
  it("accepts absolute paths without traversal", () => {
    expect(isSafePath("/Users/test/project")).toBe(true);
    expect(isSafePath("/home/user/documents")).toBe(true);
  });

  it("rejects paths with .. traversal", () => {
    expect(isSafePath("/Users/test/../../../etc/passwd")).toBe(false);
    expect(isSafePath("/../etc/passwd")).toBe(false);
    expect(isSafePath("/home/user/..")).toBe(false);
  });

  it("rejects relative paths", () => {
    expect(isSafePath("relative/path")).toBe(false);
    expect(isSafePath("./current/dir")).toBe(false);
  });

  it("accepts root path", () => {
    expect(isSafePath("/")).toBe(true);
  });
});
