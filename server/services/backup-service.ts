import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { z } from "zod";

import { dbPath } from "@/db";
import { createContentHash } from "@/lib/hash";
import { APP_VERSION } from "@/lib/constants";
import {
  BACKUP_BUNDLE_FORMAT,
  BACKUP_CHECKSUM_ALGORITHM,
  BACKUP_SCHEMA_VERSION,
  backupBundleSchema,
  backupMetadataSchema,
  createBackupPayloadChecksum,
  stringifyCanonicalJson,
  type BackupBundle,
  type BackupMetadata,
} from "@/lib/backup";
import { getExportFilename, renderAssetToMarkdown } from "@/lib/markdown/render";
import { getBackupSnapshot } from "@/server/queries/backup-queries";

const migrationJournalSchema = z.object({
  version: z.string().min(1),
  entries: z.array(
    z.object({
      tag: z.string().min(1),
      when: z.number().int().nonnegative(),
    }),
  ),
});

const MIGRATION_JOURNAL_PATH = join(
  process.cwd(),
  "db",
  "migrations",
  "meta",
  "_journal.json",
);
const BACKUP_METADATA_PATH = join(dirname(dbPath), "skillvault-backup-meta.json");

export function getMigrationState() {
  const journalRaw = readFileSync(MIGRATION_JOURNAL_PATH, "utf8");
  const journal = migrationJournalSchema.parse(JSON.parse(journalRaw));
  const latestEntry = journal.entries[journal.entries.length - 1];

  return {
    journalVersion: journal.version,
    latestTag: latestEntry?.tag ?? "no-migrations",
    latestAppliedAt: latestEntry?.when ?? null,
    totalMigrations: journal.entries.length,
  };
}

export function readLastBackupMetadata(): BackupMetadata | null {
  if (!existsSync(BACKUP_METADATA_PATH)) {
    return null;
  }

  try {
    const raw = readFileSync(BACKUP_METADATA_PATH, "utf8");
    return backupMetadataSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeLastBackupMetadata(metadata: BackupMetadata) {
  writeFileSync(BACKUP_METADATA_PATH, stringifyCanonicalJson(metadata, 2), "utf8");
}

export async function exportBackupBundle() {
  const snapshot = await getBackupSnapshot();
  const migrationState = getMigrationState();
  const exportedAt = Date.now();
  const exportTimestampIso = new Date(exportedAt).toISOString();

  const assets = snapshot.assets.map((asset) => {
    const tagNames = (asset.assetTags ?? [])
      .map((assetTag) => assetTag.tag.name)
      .sort((a, b) => a.localeCompare(b));
    const markdown = renderAssetToMarkdown({
      ...asset,
      assetTags: [...(asset.assetTags ?? [])].sort((a, b) =>
        a.tag.name.localeCompare(b.tag.name),
      ),
    });

    return {
      syncId: asset.syncId,
      filename: getExportFilename(asset),
      markdown,
      markdownChecksum: createContentHash(markdown),
      metadata: {
        slug: asset.slug,
        title: asset.title,
        type: asset.type,
        targetTool: asset.targetTool,
        exportPreset: asset.exportPreset,
        description: asset.description,
        scenario: asset.scenario,
        status: asset.status,
        rating: asset.rating,
        visibility: asset.visibility,
        source: asset.source,
        sourceUrl: asset.sourceUrl,
        pinned: asset.pinned,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
        lastUsedAt: asset.lastUsedAt,
        lastSyncedAt: asset.lastSyncedAt,
        deletedAt: asset.deletedAt,
        tagNames,
      },
      versions: asset.assetVersions.map((version) => ({
        version: version.version,
        titleSnapshot: version.titleSnapshot,
        contentSnapshot: version.contentSnapshot,
        contentHash: version.contentHash,
        changeNote: version.changeNote,
        score: version.score,
        createdAt: version.createdAt,
      })),
      testCases: asset.testCases.map((testCase) => ({
        kind: testCase.kind,
        title: testCase.title,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: testCase.actualOutput,
        evaluationCriteria: testCase.evaluationCriteria,
        score: testCase.score,
        note: testCase.note,
        createdAt: testCase.createdAt,
        updatedAt: testCase.updatedAt,
        assetVersion:
          asset.assetVersions.find((version) => version.id === testCase.assetVersionId)
            ?.version ?? null,
      })),
    };
  });

  const data = {
    assets,
    tags: snapshot.tags.map((tag) => ({
      name: tag.name,
      createdAt: tag.createdAt,
    })),
    collections: snapshot.collections.map((collection) => ({
      name: collection.name,
      description: collection.description,
      icon: collection.icon,
      color: collection.color,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      members: collection.collectionAssets.map((item) => ({
        assetSyncId: item.asset.syncId,
        orderIndex: item.orderIndex,
        createdAt: item.createdAt,
      })),
    })),
    projects: snapshot.projects.map((project) => ({
      name: project.name,
      description: project.description,
      path: project.path,
      icon: project.icon,
      color: project.color,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      members: project.projectAssets.map((item) => ({
        assetSyncId: item.asset.syncId,
        orderIndex: item.orderIndex,
        createdAt: item.createdAt,
      })),
    })),
  };

  const payloadChecksum = createBackupPayloadChecksum(data);
  const manifest = {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    migrationMarker: migrationState.latestTag,
    migrationJournalVersion: migrationState.journalVersion,
    exportTimestamp: exportedAt,
    exportTimestampIso,
    checksumAlgorithm: BACKUP_CHECKSUM_ALGORITHM,
    payloadChecksum,
    counts: {
      assets: data.assets.length,
      versions: data.assets.reduce((sum, asset) => sum + asset.versions.length, 0),
      tags: data.tags.length,
      collections: data.collections.length,
      projects: data.projects.length,
      testCases: data.assets.reduce((sum, asset) => sum + asset.testCases.length, 0),
    },
  };

  const bundle = backupBundleSchema.parse({
    format: BACKUP_BUNDLE_FORMAT,
    manifest,
    data,
  }) satisfies BackupBundle;

  const filename = `skillvault-backup-${exportTimestampIso.replace(/[:.]/g, "-")}.json`;

  writeLastBackupMetadata({
    lastBackupAt: exportedAt,
    backupFilename: filename,
    payloadChecksum,
    migrationMarker: migrationState.latestTag,
  });

  return {
    bundle,
    filename,
    json: stringifyCanonicalJson(bundle, 2),
  };
}
