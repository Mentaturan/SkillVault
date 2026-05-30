import { describe, it, expect, vi } from "vitest";
import path from "node:path";
import { importExchangePreview } from "@/server/services/exchange-service";

vi.mock("@/server/queries/asset-queries", () => ({
  findAssetBySyncId: vi.fn().mockResolvedValue(null),
}));

const fixturesDir = path.join(__dirname, "../../fixtures/exchange");

describe("importExchangePreview", () => {
  it("returns valid preview for a well-formed bundle", async () => {
    const result = await importExchangePreview(
      path.join(fixturesDir, "valid-bundle"),
    );

    expect(result.valid).toBe(true);
    expect(result.manifest).not.toBeNull();
    expect(result.manifest!.asset.syncId).toBe("fixture-sync-001");
    expect(result.manifest!.asset.title).toBe("Test Skill Fixture");
    expect(result.manifest!.asset.type).toBe("agent_skill");
    expect(result.manifest!.asset.tags).toEqual(["test", "fixture"]);
    expect(result.content).toContain("Test Skill Fixture");
    expect(result.content).toContain("round-trip validation");
    expect(result.conflictStatus).toBe("new");
  });

  it("returns invalid for a malformed bundle", async () => {
    const result = await importExchangePreview(
      path.join(fixturesDir, "malformed-bundle"),
    );

    expect(result.valid).toBe(false);
    expect(result.manifest).toBeNull();
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it("returns invalid when manifest.json is missing", async () => {
    const result = await importExchangePreview(
      path.join(fixturesDir, "missing-manifest"),
    );

    expect(result.valid).toBe(false);
    expect(result.manifest).toBeNull();
    expect(result.errors).toContain("manifest.json 不存在");
  });

  it("catches invalid version in manifest schema validation", async () => {
    const result = await importExchangePreview(
      path.join(fixturesDir, "malformed-bundle"),
    );

    expect(result.valid).toBe(false);
    expect(result.errors!.some((e) => e.includes("version"))).toBe(true);
  });

  it("catches missing required fields in manifest", async () => {
    const result = await importExchangePreview(
      path.join(fixturesDir, "malformed-bundle"),
    );

    expect(result.valid).toBe(false);
    expect(result.errors!.some((e) => e.includes("asset"))).toBe(true);
  });
});
