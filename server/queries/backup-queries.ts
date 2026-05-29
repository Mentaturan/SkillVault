import { asc } from "drizzle-orm";

import { db } from "@/db";
import {
  assetVersions,
  assets,
  collections,
  collectionAssets,
  projects,
  projectAssets,
  tags,
  testCases,
} from "@/db/schema";

export async function getBackupSnapshot() {
  const [assetRecords, tagRecords, collectionRecords, projectRecords] =
    await Promise.all([
      db.query.assets.findMany({
        orderBy: [asc(assets.syncId)],
        with: {
          assetTags: {
            with: {
              tag: true,
            },
          },
          assetVersions: {
            orderBy: [asc(assetVersions.version)],
          },
          testCases: {
            orderBy: [asc(testCases.createdAt), asc(testCases.title)],
          },
        },
      }),
      db.query.tags.findMany({
        orderBy: [asc(tags.name)],
      }),
      db.query.collections.findMany({
        orderBy: [asc(collections.name), asc(collections.createdAt)],
        with: {
          collectionAssets: {
            orderBy: [asc(collectionAssets.orderIndex)],
            with: {
              asset: {
                columns: {
                  syncId: true,
                },
              },
            },
          },
        },
      }),
      db.query.projects.findMany({
        orderBy: [asc(projects.name), asc(projects.createdAt)],
        with: {
          projectAssets: {
            orderBy: [asc(projectAssets.orderIndex)],
            with: {
              asset: {
                columns: {
                  syncId: true,
                },
              },
            },
          },
        },
      }),
    ]);

  return {
    assets: assetRecords,
    tags: tagRecords,
    collections: collectionRecords,
    projects: projectRecords,
  };
}
