import { db } from "@/db";
import { assets, tags, assetVersions } from "@/db/schema";
import { isNull, sql } from "drizzle-orm";

export async function getEntityCounts() {
  const [assetCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(assets)
    .where(isNull(assets.deletedAt));

  const [tagCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(tags);

  const [versionCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(assetVersions);

  return {
    assets: assetCount.count,
    tags: tagCount.count,
    versions: versionCount.count,
  };
}
