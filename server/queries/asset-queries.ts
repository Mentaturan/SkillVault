import { eq, isNull, and, desc, asc, like, or, inArray } from "drizzle-orm";

import { db } from "@/db";
import { assets, assetTags, tags } from "@/db/schema";
import type { NewAsset } from "@/db/schema";
import type {
  AssetSource,
  AssetStatus,
  AssetType,
  SortOption,
  TargetTool,
} from "@/lib/constants";

export interface FindAllAssetsOptions {
  status?: AssetStatus;
  type?: AssetType;
  targetTool?: TargetTool;
  source?: AssetSource;
  search?: string;
  tag?: string;
  includeDeleted?: boolean;
  includeArchived?: boolean;
  sortBy?: SortOption;
}

export async function findAssetBySyncId(syncId: string) {
  return db.query.assets.findFirst({
    where: eq(assets.syncId, syncId),
    with: {
      assetTags: {
        with: {
          tag: true,
        },
      },
    },
  });
}

export async function findAssetByContentHash(contentHash: string) {
  return db.query.assets.findFirst({
    where: eq(assets.contentHash, contentHash),
    columns: { id: true, title: true, contentHash: true },
  });
}

export async function findAssetById(id: string) {
  return db.query.assets.findFirst({
    where: eq(assets.id, id),
    with: {
      assetTags: {
        with: {
          tag: true,
        },
      },
    },
  });
}

export async function findAllAssets(options?: FindAllAssetsOptions) {
  const conditions = [];

  if (!options?.includeDeleted) {
    conditions.push(isNull(assets.deletedAt));
  }

  if (!options?.includeArchived && options?.status !== "archived") {
    conditions.push(or(eq(assets.status, "draft"), eq(assets.status, "active"), eq(assets.status, "deprecated")));
  }

  if (options?.status) {
    conditions.push(eq(assets.status, options.status));
  }

  if (options?.type) {
    conditions.push(eq(assets.type, options.type));
  }

  if (options?.targetTool) {
    conditions.push(eq(assets.targetTool, options.targetTool));
  }

  if (options?.source) {
    conditions.push(eq(assets.source, options.source));
  }

  if (options?.tag) {
    const tagSubquery = db
      .select({ assetId: assetTags.assetId })
      .from(assetTags)
      .innerJoin(tags, eq(assetTags.tagId, tags.id))
      .where(eq(tags.name, options.tag));
    conditions.push(inArray(assets.id, tagSubquery));
  }

  const search = options?.search?.trim();
  if (search) {
    const searchPattern = `%${search}%`;
    const tagSearchSubquery = db
      .selectDistinct({ assetId: assetTags.assetId })
      .from(assetTags)
      .innerJoin(tags, eq(assetTags.tagId, tags.id))
      .where(like(tags.name, searchPattern));

    conditions.push(
      or(
        like(assets.title, searchPattern),
        like(assets.description, searchPattern),
        like(assets.scenario, searchPattern),
        like(assets.content, searchPattern),
        inArray(assets.id, tagSearchSubquery),
      ),
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  let orderBy;
  switch (options?.sortBy) {
    case "createdAt_desc":
      orderBy = desc(assets.createdAt);
      break;
    case "rating_desc":
      orderBy = desc(assets.rating);
      break;
    case "title_asc":
      orderBy = asc(assets.title);
      break;
    case "lastUsedAt_desc":
      orderBy = desc(assets.lastUsedAt);
      break;
    default:
      orderBy = desc(assets.updatedAt);
  }

  return db.query.assets.findMany({
    where,
    orderBy: [desc(assets.pinned), orderBy],
    with: {
      assetTags: {
        with: {
          tag: true,
        },
      },
    },
  });
}

export async function createAsset(data: NewAsset) {
  const [asset] = await db.insert(assets).values(data).returning();
  return asset;
}

const UPDATABLE_ASSET_FIELDS = new Set([
  "slug", "title", "type", "targetTool", "exportPreset",
  "description", "scenario", "content", "contentHash",
  "status", "rating", "visibility", "source", "sourceUrl",
  "sourceRef", "sourcePath", "sourceImportedAt", "sourceChecksum",
  "pinned", "reviewDueAt", "lastUsedAt", "updatedAt", "deletedAt",
]);

export async function updateAsset(id: string, data: Partial<NewAsset>) {
  const filtered = Object.fromEntries(
    Object.entries(data).filter(([key]) => UPDATABLE_ASSET_FIELDS.has(key)),
  );
  const [asset] = await db
    .update(assets)
    .set({ ...filtered, updatedAt: Date.now() })
    .where(eq(assets.id, id))
    .returning();
  return asset;
}

export async function updateAssetLastUsedAt(id: string, lastUsedAt: number) {
  const [asset] = await db
    .update(assets)
    .set({ lastUsedAt })
    .where(eq(assets.id, id))
    .returning();
  return asset;
}

export async function softDeleteAsset(id: string) {
  const [asset] = await db
    .update(assets)
    .set({ deletedAt: Date.now(), updatedAt: Date.now() })
    .where(eq(assets.id, id))
    .returning();
  return asset;
}

export async function restoreAsset(id: string) {
  const [asset] = await db
    .update(assets)
    .set({ deletedAt: null, updatedAt: Date.now() })
    .where(eq(assets.id, id))
    .returning();
  return asset;
}

export async function archiveAsset(id: string) {
  const [asset] = await db
    .update(assets)
    .set({ status: "archived", updatedAt: Date.now() })
    .where(eq(assets.id, id))
    .returning();
  return asset;
}

export async function findAssetsByTagId(tagId: string) {
  const result = await db
    .select()
    .from(assets)
    .innerJoin(assetTags, eq(assets.id, assetTags.assetId))
    .where(and(eq(assetTags.tagId, tagId), isNull(assets.deletedAt)));
  return result.map((r) => r.assets);
}

export async function findAssetsByExactTitle(title: string) {
  return db.query.assets.findMany({
    where: and(eq(assets.title, title), isNull(assets.deletedAt)),
    columns: {
      id: true,
      title: true,
      type: true,
    },
  });
}
