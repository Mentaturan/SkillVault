import { eq, and, asc, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { collections, collectionAssets } from "@/db/schema";
import type { NewCollection } from "@/db/schema";

export async function findAllCollections() {
  return db.query.collections.findMany({
    orderBy: [desc(collections.updatedAt)],
    with: {
      collectionAssets: {
        columns: { assetId: true },
      },
    },
  });
}

export async function findCollectionById(id: string) {
  return db.query.collections.findFirst({
    where: eq(collections.id, id),
    with: {
      collectionAssets: {
        orderBy: [asc(collectionAssets.orderIndex)],
        with: {
          asset: {
            with: {
              assetTags: {
                with: {
                  tag: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function createCollection(data: NewCollection) {
  const [collection] = await db.insert(collections).values(data).returning();
  return collection;
}

export async function updateCollection(id: string, data: Partial<NewCollection>) {
  const [collection] = await db
    .update(collections)
    .set({ ...data, updatedAt: Date.now() })
    .where(eq(collections.id, id))
    .returning();
  return collection;
}

export async function deleteCollection(id: string) {
  await db.delete(collections).where(eq(collections.id, id));
}

export async function addAssetToCollection(collectionId: string, assetId: string, orderIndex: number) {
  await db.insert(collectionAssets).values({
    collectionId,
    assetId,
    orderIndex,
    createdAt: Date.now(),
  });
}

export async function removeAssetFromCollection(collectionId: string, assetId: string) {
  await db
    .delete(collectionAssets)
    .where(
      and(eq(collectionAssets.collectionId, collectionId), eq(collectionAssets.assetId, assetId))
    );
}

export async function reorderCollectionAssets(collectionId: string, assetOrders: Array<{ assetId: string; orderIndex: number }>) {
  for (const { assetId, orderIndex } of assetOrders) {
    await db
      .update(collectionAssets)
      .set({ orderIndex })
      .where(
        and(eq(collectionAssets.collectionId, collectionId), eq(collectionAssets.assetId, assetId))
      );
  }
}

export async function getMaxOrderIndex(collectionId: string) {
  const result = await db
    .select({ maxOrder: sql<number>`coalesce(max(${collectionAssets.orderIndex}), -1)` })
    .from(collectionAssets)
    .where(eq(collectionAssets.collectionId, collectionId));
  return result[0]?.maxOrder ?? -1;
}

export async function findCollectionsByAssetId(assetId: string) {
  return db
    .select({
      id: collections.id,
      name: collections.name,
      icon: collections.icon,
      color: collections.color,
    })
    .from(collectionAssets)
    .innerJoin(collections, eq(collectionAssets.collectionId, collections.id))
    .where(eq(collectionAssets.assetId, assetId));
}
