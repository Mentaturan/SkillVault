import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { tags, assetTags } from "@/db/schema";

export async function findTagById(id: string) {
  return db.query.tags.findFirst({
    where: eq(tags.id, id),
  });
}

export async function findTagByName(name: string) {
  return db.query.tags.findFirst({
    where: eq(tags.name, name),
  });
}

export async function findOrCreateTag(name: string, tagId: string) {
  const existing = await findTagByName(name);
  if (existing) {
    return existing;
  }

  try {
    const [tag] = await db
      .insert(tags)
      .values({
        id: tagId,
        name,
        createdAt: Date.now(),
      })
      .returning();
    return tag;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).message?.includes("UNIQUE constraint failed")) {
      const concurrent = await findTagByName(name);
      if (concurrent) return concurrent;
    }
    throw error;
  }
}

export async function findTagsByAssetId(assetId: string) {
  const result = await db
    .select()
    .from(tags)
    .innerJoin(assetTags, eq(tags.id, assetTags.tagId))
    .where(eq(assetTags.assetId, assetId));
  return result.map((r) => r.tags);
}

export async function bindTagToAsset(assetId: string, tagId: string) {
  try {
    await db.insert(assetTags).values({
      assetId,
      tagId,
    });
  } catch (error) {
    if (!(error as NodeJS.ErrnoException).message?.includes("UNIQUE constraint failed")) {
      throw error;
    }
  }
}

export async function unbindTagFromAsset(assetId: string, tagId: string) {
  await db
    .delete(assetTags)
    .where(
      and(eq(assetTags.assetId, assetId), eq(assetTags.tagId, tagId))
    );
}

export async function unbindAllTagsFromAsset(assetId: string) {
  await db.delete(assetTags).where(eq(assetTags.assetId, assetId));
}

export async function findAllTags() {
  return db.query.tags.findMany({
    orderBy: (tags, { asc }) => [asc(tags.name)],
  });
}
