import { isNull, desc, sql } from "drizzle-orm";

import { db } from "@/db";
import { assets, collections, projects } from "@/db/schema";

export async function getDashboardData() {
  const [assetCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(assets)
    .where(isNull(assets.deletedAt));

  const [collectionCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(collections);

  const [projectCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(projects);

  const recentAssets = await db.query.assets.findMany({
    where: isNull(assets.deletedAt),
    orderBy: [desc(assets.updatedAt)],
    limit: 5,
    columns: {
      id: true,
      title: true,
      type: true,
      updatedAt: true,
      status: true,
    },
  });

  return {
    assetCount: assetCount.count,
    collectionCount: collectionCount.count,
    projectCount: projectCount.count,
    recentAssets,
  };
}
