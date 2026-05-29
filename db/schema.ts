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
    pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
    lastUsedAt: integer("last_used_at"),
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

import { relations } from "drizzle-orm";

export const assetsRelations = relations(assets, ({ many }) => ({
  assetVersions: many(assetVersions),
  assetTags: many(assetTags),
  testCases: many(testCases),
}));

export const assetVersionsRelations = relations(assetVersions, ({ one }) => ({
  asset: one(assets, {
    fields: [assetVersions.assetId],
    references: [assets.id],
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
