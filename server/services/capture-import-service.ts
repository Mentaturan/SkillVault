import { access, readFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";

import { parseCodexRolloutImport } from "@/lib/capture-import/codex-rollout";
import type { CodexRolloutImportPreview } from "@/lib/capture-import/codex-rollout";
import { createNewCaptureInboxItem } from "@/server/services/capture-inbox-service";
import { findCaptureInboxItemsBySourcePath } from "@/server/queries/capture-inbox-queries";

export type CodexRolloutPreviewCandidate =
  CodexRolloutImportPreview["candidates"][number] & {
    isDuplicate: boolean;
  };

export interface CodexRolloutImportResult {
  importedCount: number;
  skippedDuplicateCount: number;
  preview: {
    sessionId: string;
    sessionStartedAt: number | null;
    cwd: string | null;
    sourcePath: string;
    candidates: CodexRolloutPreviewCandidate[];
  };
}

async function readCodexRolloutFile(sourcePath: string) {
  await access(sourcePath, fsConstants.R_OK);
  return readFile(sourcePath, "utf8");
}

function isDuplicateCandidate(
  candidate: CodexRolloutImportPreview["candidates"][number],
  existingItems: Awaited<ReturnType<typeof findCaptureInboxItemsBySourcePath>>,
) {
  return existingItems.some(
    (item) =>
      item.sourceType === "codex_rollout" &&
      item.sourceTimestamp === candidate.sourceTimestamp &&
      item.rawContent === candidate.rawContent,
  );
}

export async function previewCodexRolloutImport(sourcePath: string) {
  const content = await readCodexRolloutFile(sourcePath);
  const preview = parseCodexRolloutImport(content, sourcePath);
  const existingItems = await findCaptureInboxItemsBySourcePath(sourcePath);

  return {
    ...preview,
    candidates: preview.candidates.map((candidate) => ({
      ...candidate,
      isDuplicate: isDuplicateCandidate(candidate, existingItems),
    })),
  };
}

export async function importCodexRolloutToInbox(
  sourcePath: string,
): Promise<CodexRolloutImportResult> {
  const preview = await previewCodexRolloutImport(sourcePath);
  let importedCount = 0;
  let skippedDuplicateCount = 0;

  for (const candidate of preview.candidates) {
    if (candidate.isDuplicate) {
      skippedDuplicateCount += 1;
      continue;
    }

    await createNewCaptureInboxItem({
      title: candidate.title,
      rawContent: candidate.rawContent,
      sourceType: "codex_rollout",
      sourcePath: preview.sourcePath,
      sourceTimestamp: candidate.sourceTimestamp ?? undefined,
      extractionNote: candidate.extractionNote,
    });
    importedCount += 1;
  }

  return {
    importedCount,
    skippedDuplicateCount,
    preview,
  };
}
