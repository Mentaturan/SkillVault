import { describe, it, expect } from "vitest";

function compareVersions(current: string, latest: string) {
  const cleanSegment = (s: string) => {
    const num = parseInt(s.replace(/[^0-9]/g, ""), 10);
    return Number.isNaN(num) ? 0 : num;
  };
  const a = current.split(".").map(cleanSegment);
  const b = latest.split(".").map(cleanSegment);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] ?? 0) < (b[i] ?? 0)) return -1;
    if ((a[i] ?? 0) > (b[i] ?? 0)) return 1;
  }
  return 0;
}

describe("compareVersions", () => {
  it("returns 0 for equal versions", () => {
    expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
  });

  it("returns positive when current > latest", () => {
    expect(compareVersions("2.0.0", "1.0.0")).toBe(1);
  });

  it("returns negative when current < latest", () => {
    expect(compareVersions("1.0.0", "2.0.0")).toBe(-1);
  });

  it("handles pre-release tags without NaN", () => {
    expect(compareVersions("1.0.0-beta", "1.0.0")).toBe(0);
    expect(compareVersions("1.0.0", "1.0.1")).toBe(-1);
  });

  it("handles different segment counts", () => {
    expect(compareVersions("1.0", "1.0.1")).toBe(-1);
    expect(compareVersions("1.0.1", "1.0")).toBe(1);
  });

  it("handles alpha/beta suffixes gracefully", () => {
    expect(compareVersions("1.0.0-alpha", "1.0.0-beta")).toBe(0);
    expect(compareVersions("2.0.0-rc1", "1.9.9")).toBe(1);
  });
});

describe("isValidGitHubBlobUrl (logic test)", () => {
  function isValidGitHubBlobUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.hostname === "github.com" && /\/blob\//.test(parsed.pathname);
    } catch {
      return false;
    }
  }

  it("accepts valid GitHub blob URLs", () => {
    expect(isValidGitHubBlobUrl("https://github.com/user/repo/blob/main/file.md")).toBe(true);
  });

  it("rejects non-GitHub domains", () => {
    expect(isValidGitHubBlobUrl("https://evil.com/user/repo/blob/main/file.md")).toBe(false);
  });

  it("rejects GitHub URLs without /blob/", () => {
    expect(isValidGitHubBlobUrl("https://github.com/user/repo/tree/main/file.md")).toBe(false);
  });

  it("rejects URLs with github.com in query params only", () => {
    expect(isValidGitHubBlobUrl("https://evil.com/path?ref=github.com&x=/blob/")).toBe(false);
  });

  it("rejects invalid URLs", () => {
    expect(isValidGitHubBlobUrl("not-a-url")).toBe(false);
  });
});
