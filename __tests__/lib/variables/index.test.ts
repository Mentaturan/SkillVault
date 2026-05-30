import { describe, it, expect } from "vitest";
import { extractVariables, renderVariables, getMissingVariables } from "@/lib/variables";

describe("extractVariables", () => {
  it("extracts variable names from content", () => {
    const vars = extractVariables("Hello {{name}}, welcome to {{place}}");
    expect(vars).toEqual(["name", "place"]);
  });

  it("deduplicates variables", () => {
    const vars = extractVariables("{{name}} and {{name}} again");
    expect(vars).toEqual(["name"]);
  });

  it("handles variables with spaces around name", () => {
    const vars = extractVariables("Hello {{ name }}");
    expect(vars).toEqual(["name"]);
  });

  it("returns empty array for content without variables", () => {
    const vars = extractVariables("No variables here");
    expect(vars).toEqual([]);
  });
});

describe("renderVariables", () => {
  it("replaces variables with values", () => {
    const result = renderVariables("Hello {{name}}", { name: "World" });
    expect(result).toBe("Hello World");
  });

  it("replaces missing variables with empty string", () => {
    const result = renderVariables("Hello {{name}}", {});
    expect(result).toBe("Hello ");
  });

  it("replaces multiple variables", () => {
    const result = renderVariables("{{greeting}} {{name}}", { greeting: "Hello", name: "World" });
    expect(result).toBe("Hello World");
  });
});

describe("getMissingVariables", () => {
  it("identifies missing variables", () => {
    const missing = getMissingVariables(["name", "place"], { name: "World" });
    expect(missing).toEqual(["place"]);
  });

  it("returns empty array when all variables are provided", () => {
    const missing = getMissingVariables(["name"], { name: "World" });
    expect(missing).toEqual([]);
  });

  it("treats empty string values as missing", () => {
    const missing = getMissingVariables(["name"], { name: "" });
    expect(missing).toEqual(["name"]);
  });
});
