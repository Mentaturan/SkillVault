import { VARIABLE_PATTERN } from "@/lib/constants";

export function extractVariables(content: string) {
  const variables: string[] = [];
  const seen = new Set<string>();

  VARIABLE_PATTERN.lastIndex = 0;
  for (const match of content.matchAll(VARIABLE_PATTERN)) {
    const name = match[1];
    if (!seen.has(name)) {
      seen.add(name);
      variables.push(name);
    }
  }

  return variables;
}

export function renderVariables(
  content: string,
  values: Record<string, string>,
) {
  VARIABLE_PATTERN.lastIndex = 0;
  return content.replace(VARIABLE_PATTERN, (_match, name: string) => {
    return values[name] ?? "";
  });
}

export function getMissingVariables(
  variables: string[],
  values: Record<string, string>,
) {
  return variables.filter((name) => !values[name]?.trim());
}
