import { describe, it, expect } from "vitest";
import { createSlug } from "@/lib/slug";

describe("createSlug", () => {
  it("creates slug from simple text", () => {
    expect(createSlug("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(createSlug("Hello, World!")).toBe("hello-world");
  });

  it("removes quotes", () => {
    expect(createSlug("It's a \"test\"")).toBe("its-a-test");
  });

  it("trims leading and trailing hyphens", () => {
    expect(createSlug("--hello--")).toBe("hello");
  });

  it("returns untitled-asset for empty result", () => {
    expect(createSlug("!!!")).toBe("untitled-asset");
  });

  it("truncates to 80 characters", () => {
    const long = "a".repeat(100);
    expect(createSlug(long).length).toBeLessThanOrEqual(80);
  });

  it("converts to lowercase", () => {
    expect(createSlug("UPPER CASE")).toBe("upper-case");
  });
});
