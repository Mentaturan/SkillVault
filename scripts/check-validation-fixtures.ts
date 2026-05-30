import assert from "node:assert/strict";
import path from "node:path";
import { readFile } from "node:fs/promises";

import { validateAssetContent } from "../lib/validation";

interface FixtureExpectation {
  filename: string;
  title: string;
  description: string;
  expectedCodes: string[];
  expectedErrorCount: number;
  expectedWarningCount: number;
}

const FIXTURE_DIR = path.join(process.cwd(), "lib/validation/fixtures");

const FIXTURES: FixtureExpectation[] = [
  {
    filename: "valid-skill.SKILL.md",
    title: "Valid Skill Fixture",
    description: "A valid deterministic validation fixture.",
    expectedCodes: [],
    expectedErrorCount: 0,
    expectedWarningCount: 0,
  },
  {
    filename: "malformed-skill.SKILL.md",
    title: "Broken Skill Fixture",
    description: "This fixture keeps broken YAML on purpose",
    expectedCodes: ["malformed_yaml"],
    expectedErrorCount: 1,
    expectedWarningCount: 0,
  },
  {
    filename: "suspicious-skill.SKILL.md",
    title: "Suspicious Skill Fixture",
    description: "A fixture with risky content patterns.",
    expectedCodes: [
      "hardcoded_openai_key",
      "hardcoded_secret_assignment",
      "hidden_instruction_html_comment",
      "obfuscated_base64_blob",
      "pipe_to_shell",
    ],
    expectedErrorCount: 0,
    expectedWarningCount: 5,
  },
];

function extractBody(markdown: string) {
  const trimmed = markdown.trimStart();
  if (!trimmed.startsWith("---")) {
    return markdown.trim();
  }

  const secondDash = trimmed.indexOf("---", 3);
  if (secondDash === -1) {
    return markdown.trim();
  }

  return trimmed.slice(secondDash + 3).trim();
}

async function main() {
  for (const fixture of FIXTURES) {
    const markdown = await readFile(path.join(FIXTURE_DIR, fixture.filename), "utf8");
    const result = validateAssetContent({
      markdown,
      title: fixture.title,
      description: fixture.description,
      content: extractBody(markdown),
      type: "agent_skill",
      exportPreset: "codex_skill_md",
    });

    assert.equal(
      result.summary.errorCount,
      fixture.expectedErrorCount,
      `${fixture.filename} error count mismatch`,
    );
    assert.equal(
      result.summary.warningCount,
      fixture.expectedWarningCount,
      `${fixture.filename} warning count mismatch`,
    );

    const codes = result.issues.map((issue) => issue.code).sort();
    assert.deepEqual(
      codes,
      [...fixture.expectedCodes].sort(),
      `${fixture.filename} issue codes mismatch`,
    );
  }

  console.log("Validation fixtures passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
