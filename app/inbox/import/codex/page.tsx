import { CodexRolloutImportPageClient } from "@/components/inbox/codex-rollout-import-page-client";

export default async function CodexRolloutImportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sourcePath = Array.isArray(params.path) ? params.path[0] : params.path;

  return <CodexRolloutImportPageClient initialSourcePath={sourcePath ?? ""} />;
}
