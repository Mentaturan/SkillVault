import { db } from "@/db";
import { assets, collections, projects, tags } from "@/db/schema";

export async function getRestorePreviewContext() {
  const [assetRecords, collectionRecords, projectRecords, tagRecords] =
    await Promise.all([
      db
        .select({
          id: assets.id,
          syncId: assets.syncId,
          title: assets.title,
          slug: assets.slug,
          contentHash: assets.contentHash,
          deletedAt: assets.deletedAt,
        })
        .from(assets),
      db
        .select({
          id: collections.id,
          name: collections.name,
        })
        .from(collections),
      db
        .select({
          id: projects.id,
          name: projects.name,
        })
        .from(projects),
      db
        .select({
          id: tags.id,
          name: tags.name,
        })
        .from(tags),
    ]);

  return {
    assets: assetRecords,
    collections: collectionRecords,
    projects: projectRecords,
    tags: tagRecords,
  };
}
