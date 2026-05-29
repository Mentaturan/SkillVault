import { eq, isNull, and, desc, asc, like, or, inArray } from "drizzle-orm";

import { db } from "@/db";
import { assets, assetTags, tags } from "@/db/schema";
import type { NewAsset } from "@/db/schema";
import type {
  AssetStatus,
  AssetType,
  SortOption,
  TargetTool,
} from "@/lib/constants";

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

export async function findAllAssets(options?: {
  status?: AssetStatus;
  type?: AssetType;
  targetTool?: TargetTool;
  search?: string;
  tag?: string;
  includeDeleted?: boolean;
  includeArchived?: boolean;
  sortBy?: SortOption;
}) {
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

  if (options?.tag) {
    const taggedAssetIds = await db
      .select({ assetId: assetTags.assetId })
      .from(assetTags)
      .innerJoin(tags, eq(assetTags.tagId, tags.id))
      .where(eq(tags.name, options.tag));

    if (taggedAssetIds.length === 0) {
      return [];
    }

    conditions.push(inArray(assets.id, taggedAssetIds.map((row) => row.assetId)));
  }

  const search = options?.search?.trim();
  if (search) {
    const searchPattern = `%${search}%`;
    const matchingTaggedAssetIds = await db
      .select({ assetId: assetTags.assetId })
      .from(assetTags)
      .innerJoin(tags, eq(assetTags.tagId, tags.id))
      .where(like(tags.name, searchPattern));
    const tagSearchCondition =
      matchingTaggedAssetIds.length > 0
        ? inArray(
            assets.id,
            Array.from(new Set(matchingTaggedAssetIds.map((row) => row.assetId))),
          )
        : undefined;

    conditions.push(
      or(
        like(assets.title, searchPattern),
        like(assets.description, searchPattern),
        like(assets.scenario, searchPattern),
        like(assets.content, searchPattern),
        ...(tagSearchCondition ? [tagSearchCondition] : []),
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

export async function updateAsset(id: string, data: Partial<NewAsset>) {
  const [asset] = await db
    .update(assets)
    .set({ ...data, updatedAt: Date.now() })
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
    .where(eq(assetTags.tagId, tagId));
  return result.map((r) => r.assets);
}
