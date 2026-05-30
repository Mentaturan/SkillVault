import { access, readFile, stat } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";

import { parseCodexRolloutImport } from "@/lib/capture-import/codex-rollout";
import type { CodexRolloutImportPreview } from "@/lib/capture-import/codex-rollout";
import { createNewCaptureInboxItem } from "@/server/services/capture-inbox-service";
import { findCaptureInboxItemsBySourcePath } from "@/server/queries/capture-inbox-queries";
import { recordCaptureImportSource } from "@/server/services/capture-import-source-service";

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

async function assertCodexRolloutFile(sourcePath: string) {
  const fileStat = await stat(sourcePath);
  if (!fileStat.isFile()) {
    throw new Error("提供的路径不是可读取文件。");
  }

  if (path.extname(sourcePath) !== ".jsonl") {
    throw new Error("当前只支持导入 `.jsonl` rollout 文件。");
  }
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
  await assertCodexRolloutFile(sourcePath);
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

  await recordCaptureImportSource("codex_rollout", sourcePath);

  return {
    importedCount,
    skippedDuplicateCount,
    preview,
  };
}
