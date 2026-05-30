import { describe, it, expect } from "vitest";
import { renderAssetToMarkdown, getExportFilename, getExportFilenameWithPreset } from "@/lib/markdown/render";
import type { Asset, Tag } from "@/db/schema";

function makeAsset(overrides: Partial<Asset> = {}): Asset {
  return {
    id: "test-id",
    syncId: "sync123",
    slug: "my-asset",
    title: "My Asset",
    type: "chat_prompt",
    targetTool: "general",
    exportPreset: "general_markdown",
    description: null,
    scenario: null,
    content: "Hello world",
    contentHash: "abc123",
    status: "active",
    rating: null,
    visibility: "private",
    source: "self_created",
    sourceUrl: null,
    sourceRef: null,
    sourcePath: null,
    sourceImportedAt: null,
    sourceChecksum: null,
    pinned: false,
    reviewDueAt: null,
    lastUsedAt: null,
    createdAt: 1000000,
    updatedAt: 1000000,
    deletedAt: null,
    lastSyncedAt: null,
    ...overrides,
  };
}

describe("renderAssetToMarkdown", () => {
  it("renders asset with frontmatter and content", () => {
    const asset = makeAsset();
    const result = renderAssetToMarkdown(asset);
    expect(result).toContain("---");
    expect(result).toContain("My Asset");
    expect(result).toContain("Hello world");
  });

  it("omits draft status from frontmatter", () => {
    const asset = makeAsset({ status: "draft" });
    const result = renderAssetToMarkdown(asset);
    expect(result).not.toContain("status:");
  });

  it("includes active status in frontmatter", () => {
    const asset = makeAsset({ status: "active" });
    const result = renderAssetToMarkdown(asset);
    expect(result).toContain("status: active");
  });

  it("preserves sourceImportedAt value of 0 using nullish coalescing", () => {
    const asset = makeAsset({ sourceImportedAt: 0 });
    const result = renderAssetToMarkdown(asset);
    expect(result).toContain("sourceImportedAt: 0");
  });

  it("omits private visibility from frontmatter", () => {
    const asset = makeAsset({ visibility: "private" });
    const result = renderAssetToMarkdown(asset);
    expect(result).not.toContain("visibility:");
  });

  it("includes public visibility in frontmatter", () => {
    const asset = makeAsset({ visibility: "public" });
    const result = renderAssetToMarkdown(asset);
    expect(result).toContain("visibility: public");
  });

  it("includes tags when present", () => {
    const asset = makeAsset();
    const tag: Tag = { id: "tag1", name: "typescript", createdAt: 1000 };
    const assetWithTags = { ...asset, assetTags: [{ tag }] };
    const result = renderAssetToMarkdown(assetWithTags);
    expect(result).toContain("typescript");
  });
});

describe("getExportFilename", () => {
  it("returns slug.syncId.md format", () => {
    const asset = makeAsset();
    expect(getExportFilename(asset)).toBe("my-asset.sync123.md");
  });
});

describe("getExportFilenameWithPreset", () => {
  it("returns AGENTS.md for agents_md preset", () => {
    const asset = makeAsset();
    expect(getExportFilenameWithPreset(asset, "agents_md")).toBe("AGENTS.md");
  });

  it("returns slug.SKILL.md for codex_skill_md preset", () => {
    const asset = makeAsset();
    expect(getExportFilenameWithPreset(asset, "codex_skill_md")).toBe("my-asset.SKILL.md");
  });

  it("returns slug.mdc for cursor_rules preset", () => {
    const asset = makeAsset();
    expect(getExportFilenameWithPreset(asset, "cursor_rules")).toBe("my-asset.mdc");
  });
});
