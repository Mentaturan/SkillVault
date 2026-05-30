import { ClaudeCodeJsonlImportPageClient } from "@/components/inbox/claude-code-jsonl-import-page-client";

export default async function ClaudeCodeImportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sourcePath = Array.isArray(params.path) ? params.path[0] : params.path;

  return <ClaudeCodeJsonlImportPageClient initialSourcePath={sourcePath ?? ""} />;
}
