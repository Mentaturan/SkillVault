import { z } from "zod";

import {
  IMPORT_CONFLICT_STRATEGIES,
  type ImportConflictStrategy,
} from "@/lib/constants";

export const githubImportPreviewSchema = z.object({
  url: z.string().url().max(2000),
});

export const githubImportExecuteSchema = z.object({
  url: z.string().url().max(2000),
  strategy: z.enum(IMPORT_CONFLICT_STRATEGIES),
  previewChecksum: z.string().min(1).max(128),
});

export type GitHubImportPreviewInput = z.infer<typeof githubImportPreviewSchema>;
export type GitHubImportExecuteInput = z.infer<typeof githubImportExecuteSchema>;
export type GitHubImportExecuteStrategy = ImportConflictStrategy;
