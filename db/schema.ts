import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import {
  ASSET_SOURCES,
  ASSET_STATUSES,
  ASSET_TYPES,
  CAPTURE_INBOX_SOURCE_TYPES,
  CAPTURE_INBOX_STATUSES,
  DEPLOYMENT_TARGET_KEYS,
  EXPORT_PRESETS,
  TARGET_TOOLS,
  TEST_CASE_KINDS,
  VISIBILITIES,
} from "@/lib/constants";

export const assets = sqliteTable(
  "assets",
  {
    id: text("id").primaryKey(),
    syncId: text("sync_id").notNull(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    type: text("type", { enum: ASSET_TYPES }).notNull(),
    targetTool: text("target_tool", { enum: TARGET_TOOLS }).notNull(),
    exportPreset: text("export_preset", { enum: EXPORT_PRESETS }).notNull(),
    description: text("description"),
    scenario: text("scenario"),
    content: text("content").notNull(),
    contentHash: text("content_hash").notNull(),
    status: text("status", { enum: ASSET_STATUSES }).notNull(),
    rating: integer("rating"),
    visibility: text("visibility", { enum: VISIBILITIES }).notNull(),
    source: text("source", { enum: ASSET_SOURCES }).notNull(),
    sourceUrl: text("source_url"),
    sourceRef: text("source_ref"),
    sourcePath: text("source_path"),
    sourceImportedAt: integer("source_imported_at"),
    sourceChecksum: text("source_checksum"),
    pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
    lastUsedAt: integer("last_used_at"),
    reviewDueAt: integer("review_due_at"),
    lastSyncedAt: integer("last_synced_at"),
    deletedAt: integer("deleted_at"),
  },
  (table) => ({
    syncIdUnique: uniqueIndex("assets_sync_id_unique").on(table.syncId),
    slugIndex: index("assets_slug_idx").on(table.slug),
    typeIndex: index("assets_type_idx").on(table.type),
    targetToolIndex: index("assets_target_tool_idx").on(table.targetTool),
    exportPresetIndex: index("assets_export_preset_idx").on(table.exportPreset),
    statusIndex: index("assets_status_idx").on(table.status),
    deletedAtIndex: index("assets_deleted_at_idx").on(table.deletedAt),
    updatedAtIndex: index("assets_updated_at_idx").on(table.updatedAt),
    pinnedIndex: index("assets_pinned_idx").on(table.pinned),
    reviewDueAtIndex: index("assets_review_due_at_idx").on(table.reviewDueAt),
  }),
);

export const assetVersions = sqliteTable(
  "asset_versions",
  {
    id: text("id").primaryKey(),
    assetId: text("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    titleSnapshot: text("title_snapshot").notNull(),
    contentSnapshot: text("content_snapshot").notNull(),
    contentHash: text("content_hash").notNull(),
    changeNote: text("change_note"),
    score: integer("score"),
    createdAt: integer("created_at").notNull(),
  },
  (table) => ({
    assetIdIndex: index("asset_versions_asset_id_idx").on(table.assetId),
    assetVersionUnique: uniqueIndex("asset_versions_asset_version_unique").on(
      table.assetId,
      table.version,
    ),
    createdAtIndex: index("asset_versions_created_at_idx").on(table.createdAt),
  }),
);

export const tags = sqliteTable(
  "tags",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => ({
    nameUnique: uniqueIndex("tags_name_unique").on(table.name),
  }),
);

export const assetTags = sqliteTable(
  "asset_tags",
  {
    assetId: text("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.assetId, table.tagId] }),
    assetIdIndex: index("asset_tags_asset_id_idx").on(table.assetId),
    tagIdIndex: index("asset_tags_tag_id_idx").on(table.tagId),
  }),
);

export const collections = sqliteTable("collections", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  color: text("color"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const collectionAssets = sqliteTable(
  "collection_assets",
  {
    collectionId: text("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    assetId: text("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    orderIndex: integer("order_index").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.collectionId, table.assetId] }),
    collectionIdIndex: index("collection_assets_collection_id_idx").on(
      table.collectionId,
    ),
    assetIdIndex: index("collection_assets_asset_id_idx").on(table.assetId),
  }),
);

export const testCases = sqliteTable(
  "test_cases",
  {
    id: text("id").primaryKey(),
    assetId: text("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    assetVersionId: text("asset_version_id").references(() => assetVersions.id, {
      onDelete: "set null",
    }),
    kind: text("kind", { enum: TEST_CASE_KINDS }).notNull(),
    title: text("title").notNull(),
    input: text("input").notNull(),
    expectedOutput: text("expected_output"),
    actualOutput: text("actual_output"),
    evaluationCriteria: text("evaluation_criteria"),
    score: real("score"),
    note: text("note"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    assetIdIndex: index("test_cases_asset_id_idx").on(table.assetId),
    assetVersionIdIndex: index("test_cases_asset_version_id_idx").on(
      table.assetVersionId,
    ),
    kindIndex: index("test_cases_kind_idx").on(table.kind),
  }),
);

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  path: text("path"),
  icon: text("icon"),
  color: text("color"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const projectAssets = sqliteTable(
  "project_assets",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    assetId: text("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    orderIndex: integer("order_index").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.assetId] }),
    projectIdIndex: index("project_assets_project_id_idx").on(table.projectId),
    assetIdIndex: index("project_assets_asset_id_idx").on(table.assetId),
  }),
);

export const deploymentTargets = sqliteTable(
  "deployment_targets",
  {
    id: text("id").primaryKey(),
    key: text("key", { enum: DEPLOYMENT_TARGET_KEYS }).notNull(),
    path: text("path"),
    enabled: integer("enabled", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    keyUnique: uniqueIndex("deployment_targets_key_unique").on(table.key),
  }),
);

export const deploymentRecords = sqliteTable(
  "deployment_records",
  {
    id: text("id").primaryKey(),
    assetId: text("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    deploymentTargetId: text("deployment_target_id")
      .notNull()
      .references(() => deploymentTargets.id, { onDelete: "cascade" }),
    targetDirectoryPath: text("target_directory_path").notNull(),
    targetFilePath: text("target_file_path").notNull(),
    targetFilename: text("target_filename").notNull(),
    deployedContentHash: text("deployed_content_hash").notNull(),
    lastBackupPath: text("last_backup_path"),
    lastDeployedAt: integer("last_deployed_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    assetTargetUnique: uniqueIndex("deployment_records_asset_target_unique").on(
      table.assetId,
      table.deploymentTargetId,
    ),
    assetIdIndex: index("deployment_records_asset_id_idx").on(table.assetId),
    targetIdIndex: index("deployment_records_target_id_idx").on(
      table.deploymentTargetId,
    ),
  }),
);

export const captureInboxItems = sqliteTable(
  "capture_inbox_items",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    rawContent: text("raw_content").notNull(),
    sourceType: text("source_type", { enum: CAPTURE_INBOX_SOURCE_TYPES }).notNull(),
    sourcePath: text("source_path"),
    sourceTimestamp: integer("source_timestamp"),
    extractionNote: text("extraction_note"),
    status: text("status", { enum: CAPTURE_INBOX_STATUSES }).notNull(),
    convertedAssetId: text("converted_asset_id").references(() => assets.id, {
      onDelete: "set null",
    }),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    sourceTypeIndex: index("capture_inbox_items_source_type_idx").on(table.sourceType),
    statusIndex: index("capture_inbox_items_status_idx").on(table.status),
    sourcePathIndex: index("capture_inbox_items_source_path_idx").on(table.sourcePath),
    createdAtIndex: index("capture_inbox_items_created_at_idx").on(table.createdAt),
  }),
);

export const captureImportSources = sqliteTable(
  "capture_import_sources",
  {
    id: text("id").primaryKey(),
    sourceType: text("source_type", { enum: CAPTURE_INBOX_SOURCE_TYPES }).notNull(),
    filePath: text("file_path").notNull(),
    directoryPath: text("directory_path"),
    fileModifiedAt: integer("file_modified_at").notNull(),
    fileSize: integer("file_size").notNull(),
    lastImportedAt: integer("last_imported_at").notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    sourceTypeIndex: index("capture_import_sources_source_type_idx").on(
      table.sourceType,
    ),
    directoryPathIndex: index("capture_import_sources_directory_path_idx").on(
      table.directoryPath,
    ),
    filePathUnique: uniqueIndex("capture_import_sources_source_file_unique").on(
      table.sourceType,
      table.filePath,
    ),
  }),
);

import { relations } from "drizzle-orm";

export const assetsRelations = relations(assets, ({ many }) => ({
  assetVersions: many(assetVersions),
  assetTags: many(assetTags),
  testCases: many(testCases),
  collectionAssets: many(collectionAssets),
  deploymentRecords: many(deploymentRecords),
  captureInboxItems: many(captureInboxItems),
}));

export const assetVersionsRelations = relations(assetVersions, ({ one }) => ({
  asset: one(assets, {
    fields: [assetVersions.assetId],
    references: [assets.id],
  }),
}));

export const testCasesRelations = relations(testCases, ({ one }) => ({
  asset: one(assets, {
    fields: [testCases.assetId],
    references: [assets.id],
  }),
  assetVersion: one(assetVersions, {
    fields: [testCases.assetVersionId],
    references: [assetVersions.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  assetTags: many(assetTags),
}));

export const assetTagsRelations = relations(assetTags, ({ one }) => ({
  asset: one(assets, {
    fields: [assetTags.assetId],
    references: [assets.id],
  }),
  tag: one(tags, {
    fields: [assetTags.tagId],
    references: [tags.id],
  }),
}));

export const collectionsRelations = relations(collections, ({ many }) => ({
  collectionAssets: many(collectionAssets),
}));

export const collectionAssetsRelations = relations(collectionAssets, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionAssets.collectionId],
    references: [collections.id],
  }),
  asset: one(assets, {
    fields: [collectionAssets.assetId],
    references: [assets.id],
  }),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  projectAssets: many(projectAssets),
}));

export const projectAssetsRelations = relations(projectAssets, ({ one }) => ({
  project: one(projects, {
    fields: [projectAssets.projectId],
    references: [projects.id],
  }),
  asset: one(assets, {
    fields: [projectAssets.assetId],
    references: [assets.id],
  }),
}));

export const deploymentTargetsRelations = relations(
  deploymentTargets,
  ({ many }) => ({
    deploymentRecords: many(deploymentRecords),
  }),
);

export const deploymentRecordsRelations = relations(
  deploymentRecords,
  ({ one }) => ({
    asset: one(assets, {
      fields: [deploymentRecords.assetId],
      references: [assets.id],
    }),
    deploymentTarget: one(deploymentTargets, {
      fields: [deploymentRecords.deploymentTargetId],
      references: [deploymentTargets.id],
    }),
  }),
);

export const captureInboxItemsRelations = relations(captureInboxItems, ({ one }) => ({
  convertedAsset: one(assets, {
    fields: [captureInboxItems.convertedAssetId],
    references: [assets.id],
  }),
}));

export const captureImportSourcesRelations = relations(captureImportSources, () => ({}));

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
export type AssetVersion = typeof assetVersions.$inferSelect;
export type NewAssetVersion = typeof assetVersions.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type AssetTag = typeof assetTags.$inferSelect;
export type NewAssetTag = typeof assetTags.$inferInsert;
export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;
export type CollectionAsset = typeof collectionAssets.$inferSelect;
export type NewCollectionAsset = typeof collectionAssets.$inferInsert;
export type TestCase = typeof testCases.$inferSelect;
export type NewTestCase = typeof testCases.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectAsset = typeof projectAssets.$inferSelect;
export type NewProjectAsset = typeof projectAssets.$inferInsert;
export type DeploymentTarget = typeof deploymentTargets.$inferSelect;
export type NewDeploymentTarget = typeof deploymentTargets.$inferInsert;
export type DeploymentRecord = typeof deploymentRecords.$inferSelect;
export type NewDeploymentRecord = typeof deploymentRecords.$inferInsert;
export type CaptureInboxItem = typeof captureInboxItems.$inferSelect;
export type NewCaptureInboxItem = typeof captureInboxItems.$inferInsert;
export type CaptureImportSource = typeof captureImportSources.$inferSelect;
export type NewCaptureImportSource = typeof captureImportSources.$inferInsert;
