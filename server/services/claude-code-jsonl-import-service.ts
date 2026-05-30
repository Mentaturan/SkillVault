import { access, readFile, stat } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";

import { parseClaudeCodeJsonlImport } from "@/lib/capture-import/claude-code-jsonl";
import type { ClaudeCodeJsonlImportPreview } from "@/lib/capture-import/claude-code-jsonl";
import { createNewCaptureInboxItem } from "@/server/services/capture-inbox-service";
import { findCaptureInboxItemsBySourcePath } from "@/server/queries/capture-inbox-queries";
import { recordCaptureImportSource } from "@/server/services/capture-import-source-service";

export type ClaudeCodeJsonlPreviewCandidate =
  ClaudeCodeJsonlImportPreview["candidates"][number] & {
    isDuplicate: boolean;
  };

export interface ClaudeCodeJsonlImportResult {
  importedCount: number;
  skippedDuplicateCount: number;
  preview: {
    sessionId: string;
    sessionStartedAt: number | null;
    cwd: string | null;
    sourcePath: string;
    candidates: ClaudeCodeJsonlPreviewCandidate[];
  };
}

async function readClaudeCodeJsonlFile(sourcePath: string) {
  await access(sourcePath, fsConstants.R_OK);
  return readFile(sourcePath, "utf8");
}

async function assertClaudeCodeJsonlFile(sourcePath: string) {
  const fileStat = await stat(sourcePath);
  if (!fileStat.isFile()) {
    throw new Error("提供的路径不是可读取文件。");
  }

  if (path.extname(sourcePath) !== ".jsonl") {
    throw new Error("当前只支持导入 `.jsonl` 文件。");
  }
}

function isDuplicateCandidate(
  candidate: ClaudeCodeJsonlImportPreview["candidates"][number],
  existingItems: Awaited<ReturnType<typeof findCaptureInboxItemsBySourcePath>>,
) {
  return existingItems.some(
    (item) =>
      item.sourceType === "claude_code_jsonl" &&
      item.sourceTimestamp === candidate.sourceTimestamp &&
      item.rawContent === candidate.rawContent,
  );
}

export async function previewClaudeCodeJsonlImport(sourcePath: string) {
  await assertClaudeCodeJsonlFile(sourcePath);
  const content = await readClaudeCodeJsonlFile(sourcePath);
  const preview = parseClaudeCodeJsonlImport(content, sourcePath);
  const existingItems = await findCaptureInboxItemsBySourcePath(sourcePath);

  return {
    ...preview,
    candidates: preview.candidates.map((candidate) => ({
      ...candidate,
      isDuplicate: isDuplicateCandidate(candidate, existingItems),
    })),
  };
}

export async function importClaudeCodeJsonlToInbox(
  sourcePath: string,
): Promise<ClaudeCodeJsonlImportResult> {
  const preview = await previewClaudeCodeJsonlImport(sourcePath);
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
      sourceType: "claude_code_jsonl",
      sourcePath: preview.sourcePath,
      sourceTimestamp: candidate.sourceTimestamp ?? undefined,
      extractionNote: candidate.extractionNote,
    });
    importedCount += 1;
  }

  await recordCaptureImportSource("claude_code_jsonl", sourcePath);

  return {
    importedCount,
    skippedDuplicateCount,
    preview,
  };
}
