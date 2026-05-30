import { describe, it, expect } from "vitest";
import { ExchangeManifest } from "@/lib/exchange/schema";

describe("ExchangeManifest", () => {
  const validManifest = {
    version: 1,
    exportedAt: 1000000,
    asset: {
      syncId: "sync123",
      slug: "my-asset",
      title: "My Asset",
      type: "agent_skill",
      targetTool: "codex",
      exportPreset: "codex_skill_md",
      status: "active",
      visibility: "private",
      source: "self_created",
      contentHash: "abc123",
    },
  };

  it("validates a correct manifest", () => {
    const result = ExchangeManifest.safeParse(validManifest);
    expect(result.success).toBe(true);
  });

  it("rejects invalid type enum value", () => {
    const manifest = {
      ...validManifest,
      asset: { ...validManifest.asset, type: "invalid_type" },
    };
    const result = ExchangeManifest.safeParse(manifest);
    expect(result.success).toBe(false);
  });

  it("rejects invalid targetTool enum value", () => {
    const manifest = {
      ...validManifest,
      asset: { ...validManifest.asset, targetTool: "invalid_tool" },
    };
    const result = ExchangeManifest.safeParse(manifest);
    expect(result.success).toBe(false);
  });

  it("rejects invalid status enum value", () => {
    const manifest = {
      ...validManifest,
      asset: { ...validManifest.asset, status: "invalid_status" },
    };
    const result = ExchangeManifest.safeParse(manifest);
    expect(result.success).toBe(false);
  });

  it("rejects invalid visibility enum value", () => {
    const manifest = {
      ...validManifest,
      asset: { ...validManifest.asset, visibility: "invalid_vis" },
    };
    const result = ExchangeManifest.safeParse(manifest);
    expect(result.success).toBe(false);
  });

  it("rejects invalid source enum value", () => {
    const manifest = {
      ...validManifest,
      asset: { ...validManifest.asset, source: "invalid_source" },
    };
    const result = ExchangeManifest.safeParse(manifest);
    expect(result.success).toBe(false);
  });

  it("rejects invalid exportPreset enum value", () => {
    const manifest = {
      ...validManifest,
      asset: { ...validManifest.asset, exportPreset: "invalid_preset" },
    };
    const result = ExchangeManifest.safeParse(manifest);
    expect(result.success).toBe(false);
  });

  it("accepts all valid type values", () => {
    const types = ["agent_skill", "system_rule", "chat_prompt", "image_prompt", "reply_template", "workflow", "checklist", "sop", "reference"];
    for (const type of types) {
      const manifest = {
        ...validManifest,
        asset: { ...validManifest.asset, type },
      };
      expect(ExchangeManifest.safeParse(manifest).success).toBe(true);
    }
  });

  it("accepts optional fields", () => {
    const manifest = {
      ...validManifest,
      asset: {
        ...validManifest.asset,
        description: "A description",
        scenario: "A scenario",
        tags: ["tag1", "tag2"],
        pinned: true,
        rating: 5,
      },
    };
    const result = ExchangeManifest.safeParse(manifest);
    expect(result.success).toBe(true);
  });

  it("rejects wrong version number", () => {
    const manifest = { ...validManifest, version: 2 };
    const result = ExchangeManifest.safeParse(manifest);
    expect(result.success).toBe(false);
  });
});
