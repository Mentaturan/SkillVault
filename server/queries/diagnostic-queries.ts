import { db } from "@/db";
import { assetVersions, assets, collections, projects, tags, testCases } from "@/db/schema";
import { isNull, sql } from "drizzle-orm";

export async function getEntityCounts() {
  const [assetCount, liveAssetCount, tagCount, versionCount, collectionCount, projectCount, testCaseCount] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(assets),
      db
        .select({ count: sql<number>`count(*)` })
        .from(assets)
        .where(isNull(assets.deletedAt)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(tags),
      db
        .select({ count: sql<number>`count(*)` })
        .from(assetVersions),
      db
        .select({ count: sql<number>`count(*)` })
        .from(collections),
      db
        .select({ count: sql<number>`count(*)` })
        .from(projects),
      db
        .select({ count: sql<number>`count(*)` })
        .from(testCases),
    ]);

  return {
    assets: assetCount[0].count,
    liveAssets: liveAssetCount[0].count,
    deletedAssets: assetCount[0].count - liveAssetCount[0].count,
    tags: tagCount[0].count,
    versions: versionCount[0].count,
    collections: collectionCount[0].count,
    projects: projectCount[0].count,
    testCases: testCaseCount[0].count,
  };
}
