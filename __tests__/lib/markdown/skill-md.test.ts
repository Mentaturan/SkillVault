import { describe, it, expect } from "vitest";
import { isSkillMd, parseSkillMd } from "@/lib/markdown/skill-md";

describe("isSkillMd", () => {
  it("returns true for valid SKILL.md with name and description", () => {
    const md = `---
name: Test Skill
description: A test skill
---
Content here`;
    expect(isSkillMd(md)).toBe(true);
  });

  it("returns false when syncId is present (not a SKILL.md)", () => {
    const md = `---
name: Test Skill
description: A test skill
syncId: abc123
---
Content here`;
    expect(isSkillMd(md)).toBe(false);
  });

  it("returns false when name is missing", () => {
    const md = `---
description: A test skill
---
Content here`;
    expect(isSkillMd(md)).toBe(false);
  });

  it("returns false when description is missing", () => {
    const md = `---
name: Test Skill
---
Content here`;
    expect(isSkillMd(md)).toBe(false);
  });

  it("returns false for non-frontmatter markdown", () => {
    expect(isSkillMd("Just plain text")).toBe(false);
  });

  it("handles frontmatter with --- inside string values", () => {
    const md = `---
name: "value---continued"
description: A test skill
---
Content here`;
    expect(isSkillMd(md)).toBe(true);
  });

  it("handles frontmatter closing delimiter on its own line", () => {
    const md = `---
name: Test
description: Test desc
---
body`;
    expect(isSkillMd(md)).toBe(true);
  });

  it("rejects frontmatter where --- is not on its own line as closing", () => {
    const md = `---
name: Test
description: Test---inline
body without proper closing`;
    expect(isSkillMd(md)).toBe(false);
  });
});

describe("parseSkillMd", () => {
  it("parses name and description from SKILL.md frontmatter", () => {
    const md = `---
name: My Skill
description: My description
---
Body content`;
    const result = parseSkillMd(md);
    if ("error" in result) throw new Error("Should not error");
    expect(result.data.frontmatter.title).toBe("My Skill");
    expect(result.data.frontmatter.description).toBe("My description");
  });

  it("handles non-string name gracefully (returns empty string)", () => {
    const md = `---
name: 123
description: Valid desc
---
Body`;
    const result = parseSkillMd(md);
    if ("error" in result) throw new Error("Should not error");
    expect(result.data.frontmatter.title).toBe("");
  });

  it("handles non-string description gracefully (returns empty string)", () => {
    const md = `---
name: Valid name
description: 42
---
Body`;
    const result = parseSkillMd(md);
    if ("error" in result) throw new Error("Should not error");
    expect(result.data.frontmatter.description).toBe("");
  });

  it("extracts Examples section as scenario", () => {
    const md = `---
name: Skill
description: Desc
---
## Examples
- Example 1
- Example 2
## Instructions
Do this`;
    const result = parseSkillMd(md);
    if ("error" in result) throw new Error("Should not error");
    expect(result.data.frontmatter.scenario).toBe("Example 1\nExample 2");
    expect(result.data.content).toContain("## Instructions");
    expect(result.data.content).not.toContain("## Examples");
  });

  it("captures full Examples section with multiple lines", () => {
    const md = `---
name: Skill
description: Desc
---
## Examples
- First example
- Second example
- Third example
## Next Section
More content`;
    const result = parseSkillMd(md);
    if ("error" in result) throw new Error("Should not error");
    expect(result.data.frontmatter.scenario).toContain("First example");
    expect(result.data.frontmatter.scenario).toContain("Second example");
    expect(result.data.frontmatter.scenario).toContain("Third example");
  });

  it("returns scenario null when no Examples section", () => {
    const md = `---
name: Skill
description: Desc
---
Just content`;
    const result = parseSkillMd(md);
    if ("error" in result) throw new Error("Should not error");
    expect(result.data.frontmatter.scenario).toBeNull();
  });
});
