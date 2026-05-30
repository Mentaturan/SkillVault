import { access, readdir, stat } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";

import { getCaptureImportFileSnapshots } from "@/server/services/capture-import-source-service";

const MAX_SCAN_FILES = 500;

async function collectRolloutFiles(directoryPath: string, files: string[] = []) {
  const entries = await readdir(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      await collectRolloutFiles(fullPath, files);
      if (files.length > MAX_SCAN_FILES) {
        break;
      }
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".jsonl")) {
      files.push(fullPath);
      if (files.length > MAX_SCAN_FILES) {
        break;
      }
    }
  }

  return files;
}

export async function scanCodexRolloutDirectory(directoryPath: string) {
  await access(directoryPath, fsConstants.R_OK);
  const directoryStat = await stat(directoryPath);
  if (!directoryStat.isDirectory()) {
    throw new Error("提供的路径不是目录。");
  }

  const files = await collectRolloutFiles(directoryPath);
  if (files.length > MAX_SCAN_FILES) {
    throw new Error(`扫描结果超过 ${MAX_SCAN_FILES} 个文件，请缩小目录范围。`);
  }

  const snapshots = await getCaptureImportFileSnapshots("codex_rollout", files);
  const sorted = snapshots.sort((left, right) => {
    const statusOrder = { changed: 0, new: 1, unchanged: 2 };
    if (statusOrder[left.status] !== statusOrder[right.status]) {
      return statusOrder[left.status] - statusOrder[right.status];
    }
    return right.fileModifiedAt - left.fileModifiedAt;
  });

  return {
    directoryPath,
    files: sorted,
    summary: {
      total: sorted.length,
      changed: sorted.filter((file) => file.status === "changed").length,
      new: sorted.filter((file) => file.status === "new").length,
      unchanged: sorted.filter((file) => file.status === "unchanged").length,
    },
  };
}
