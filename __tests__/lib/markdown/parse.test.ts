import { describe, it, expect } from "vitest";
import { parseMarkdownToAsset } from "@/lib/markdown/parse";

describe("parseMarkdownToAsset", () => {
  it("parses general markdown with frontmatter", () => {
    const md = `---
title: My Asset
type: chat_prompt
targetTool: general
exportPreset: general_markdown
---
Content here`;
    const result = parseMarkdownToAsset(md);
    if ("error" in result) throw new Error("Should not error");
    expect(result.data.frontmatter.title).toBe("My Asset");
    expect(result.data.frontmatter.type).toBe("chat_prompt");
  });

  it("creates default frontmatter for markdown without frontmatter", () => {
    const md = "Just plain text content";
    const result = parseMarkdownToAsset(md);
    if ("error" in result) throw new Error("Should not error");
    expect(result.data.frontmatter.title).toBe("未命名资产");
    expect(result.data.content).toBe("Just plain text content");
  });

  it("handles frontmatter with --- inside string values correctly", () => {
    const md = `---
title: "value---continued"
type: chat_prompt
targetTool: general
exportPreset: general_markdown
---
Content`;
    const result = parseMarkdownToAsset(md);
    if ("error" in result) throw new Error("Should not error");
    expect(result.data.frontmatter.title).toBe("value---continued");
  });

  it("returns error for unclosed frontmatter", () => {
    const md = `---
title: Test
type: chat_prompt
No closing dashes`;
    const result = parseMarkdownToAsset(md);
    expect("error" in result).toBe(true);
  });

  it("preserves sourceImportedAt value of 0", () => {
    const md = `---
title: Test
type: chat_prompt
targetTool: general
exportPreset: general_markdown
sourceImportedAt: 0
---
Content`;
    const result = parseMarkdownToAsset(md);
    if ("error" in result) throw new Error("Should not error");
    expect(result.data.frontmatter.sourceImportedAt).toBe(0);
  });

  it("validates enum fields and falls back to defaults for invalid values", () => {
    const md = `---
title: Test
type: invalid_type
targetTool: invalid_tool
exportPreset: invalid_preset
---
Content`;
    const result = parseMarkdownToAsset(md);
    if ("error" in result) throw new Error("Should not error");
    expect(result.data.frontmatter.type).toBe("chat_prompt");
    expect(result.data.frontmatter.targetTool).toBe("general");
    expect(result.data.frontmatter.exportPreset).toBe("general_markdown");
  });

  it("parses tags from frontmatter", () => {
    const md = `---
title: Test
type: chat_prompt
targetTool: general
exportPreset: general_markdown
tags:
  - tag1
  - tag2
---
Content`;
    const result = parseMarkdownToAsset(md);
    if ("error" in result) throw new Error("Should not error");
    expect(result.data.frontmatter.tags).toEqual(["tag1", "tag2"]);
  });
});
