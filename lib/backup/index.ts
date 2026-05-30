import { z } from "zod";

import { createContentHash } from "@/lib/hash";
import {
  ASSET_SOURCES,
  ASSET_STATUSES,
  ASSET_TYPES,
  EXPORT_PRESETS,
  TARGET_TOOLS,
  TEST_CASE_KINDS,
  VISIBILITIES,
} from "@/lib/constants";

export const BACKUP_BUNDLE_FORMAT = "skillvault-backup";
export const BACKUP_SCHEMA_VERSION = 1;
export const BACKUP_CHECKSUM_ALGORITHM = "sha256";

export const backupTagSchema = z.object({
  name: z.string().min(1),
  createdAt: z.number().int().nonnegative(),
});

export const backupAssetVersionSchema = z.object({
  version: z.number().int().positive(),
  titleSnapshot: z.string().min(1),
  contentSnapshot: z.string(),
  contentHash: z.string().min(1),
  changeNote: z.string().nullable(),
  score: z.number().int().nullable(),
  createdAt: z.number().int().nonnegative(),
});

export const backupTestCaseSchema = z.object({
  kind: z.enum(TEST_CASE_KINDS),
  title: z.string().min(1),
  input: z.string(),
  expectedOutput: z.string().nullable(),
  actualOutput: z.string().nullable(),
  evaluationCriteria: z.string().nullable(),
  score: z.number().nullable(),
  note: z.string().nullable(),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
  assetVersion: z.number().int().positive().nullable(),
});

export const backupAssetSchema = z.object({
  syncId: z.string().min(1),
  filename: z.string().min(1),
  markdown: z.string(),
  markdownChecksum: z.string().min(1),
  metadata: z.object({
    slug: z.string().min(1),
    title: z.string().min(1),
    type: z.enum(ASSET_TYPES),
    targetTool: z.enum(TARGET_TOOLS),
    exportPreset: z.enum(EXPORT_PRESETS),
    description: z.string().nullable(),
    scenario: z.string().nullable(),
    status: z.enum(ASSET_STATUSES),
    contentHash: z.string().min(1),
    rating: z.number().int().nullable(),
    visibility: z.enum(VISIBILITIES),
    source: z.enum(ASSET_SOURCES),
    sourceUrl: z.string().nullable(),
    pinned: z.boolean(),
    createdAt: z.number().int().nonnegative(),
    updatedAt: z.number().int().nonnegative(),
    lastUsedAt: z.number().int().nonnegative().nullable(),
    reviewDueAt: z.number().int().nonnegative().nullable().optional(),
    lastSyncedAt: z.number().int().nonnegative().nullable(),
    deletedAt: z.number().int().nonnegative().nullable(),
    tagNames: z.array(z.string().min(1)),
  }),
  versions: z.array(backupAssetVersionSchema),
  testCases: z.array(backupTestCaseSchema),
});

export const backupMemberSchema = z.object({
  assetSyncId: z.string().min(1),
  orderIndex: z.number().int(),
  createdAt: z.number().int().nonnegative(),
});

export const backupCollectionSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
  members: z.array(backupMemberSchema),
});

export const backupProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  path: z.string().nullable(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
  members: z.array(backupMemberSchema),
});

export const backupDataSchema = z.object({
  assets: z.array(backupAssetSchema),
  tags: z.array(backupTagSchema),
  collections: z.array(backupCollectionSchema),
  projects: z.array(backupProjectSchema),
});

export const backupManifestSchema = z.object({
  schemaVersion: z.number().int().positive(),
  appVersion: z.string().min(1),
  migrationMarker: z.string().min(1),
  migrationJournalVersion: z.string().min(1),
  exportTimestamp: z.number().int().nonnegative(),
  exportTimestampIso: z.string().min(1),
  checksumAlgorithm: z.literal(BACKUP_CHECKSUM_ALGORITHM),
  payloadChecksum: z.string().min(1),
  counts: z.object({
    assets: z.number().int().nonnegative(),
    versions: z.number().int().nonnegative(),
    tags: z.number().int().nonnegative(),
    collections: z.number().int().nonnegative(),
    projects: z.number().int().nonnegative(),
    testCases: z.number().int().nonnegative(),
  }),
});

export const backupBundleSchema = z.object({
  format: z.literal(BACKUP_BUNDLE_FORMAT),
  manifest: backupManifestSchema,
  data: backupDataSchema,
});

export const backupMetadataSchema = z.object({
  lastBackupAt: z.number().int().nonnegative(),
  backupFilename: z.string().min(1),
  payloadChecksum: z.string().min(1),
  migrationMarker: z.string().min(1),
});

export const restorePreviewAssetSchema = z.object({
  syncId: z.string().min(1),
  title: z.string().min(1),
  action: z.enum(["create", "overwrite", "copy", "skip"]),
  targetAssetId: z.string().nullable(),
  targetAssetTitle: z.string().nullable(),
  warnings: z.array(z.string()),
});

export const restorePreviewGroupSchema = z.object({
  name: z.string().min(1),
  action: z.enum(["create", "update"]),
  warnings: z.array(z.string()),
});

export const restorePreviewSchema = z.object({
  manifest: backupManifestSchema,
  checksumValid: z.boolean(),
  checksumWarning: z.string().nullable(),
  errors: z.array(z.string()),
  summary: z.object({
    createAssets: z.number().int().nonnegative(),
    overwriteAssets: z.number().int().nonnegative(),
    copyAssets: z.number().int().nonnegative(),
    skipAssets: z.number().int().nonnegative(),
    updateCollections: z.number().int().nonnegative(),
    createCollections: z.number().int().nonnegative(),
    updateProjects: z.number().int().nonnegative(),
    createProjects: z.number().int().nonnegative(),
  }),
  assets: z.array(restorePreviewAssetSchema),
  collections: z.array(restorePreviewGroupSchema),
  projects: z.array(restorePreviewGroupSchema),
});

export type BackupData = z.infer<typeof backupDataSchema>;
export type BackupBundle = z.infer<typeof backupBundleSchema>;
export type BackupMetadata = z.infer<typeof backupMetadataSchema>;
export type RestorePreview = z.infer<typeof restorePreviewSchema>;

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => canonicalize(item));
  }

  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = canonicalize((value as Record<string, unknown>)[key]);
        return result;
      }, {});
  }

  return value;
}

export function stringifyCanonicalJson(value: unknown, space = 0) {
  return JSON.stringify(canonicalize(value), null, space);
}

export function createBackupPayloadChecksum(payload: BackupData) {
  return createContentHash(stringifyCanonicalJson(payload));
}
