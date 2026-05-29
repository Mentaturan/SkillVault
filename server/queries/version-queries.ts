import { eq, desc } from "drizzle-orm";

import { db } from "@/db";
import { assetVersions } from "@/db/schema";
import type { NewAssetVersion } from "@/db/schema";

export async function findVersionsByAssetId(assetId: string) {
  return db.query.assetVersions.findMany({
    where: eq(assetVersions.assetId, assetId),
    orderBy: desc(assetVersions.version),
  });
}

export async function findLatestVersion(assetId: string) {
  return db.query.assetVersions.findFirst({
    where: eq(assetVersions.assetId, assetId),
    orderBy: desc(assetVersions.version),
  });
}

export async function findVersionById(id: string) {
  return db.query.assetVersions.findFirst({
    where: eq(assetVersions.id, id),
  });
}

export async function createVersion(data: NewAssetVersion) {
  const [version] = await db
    .insert(assetVersions)
    .values(data)
    .returning();
  return version;
}

export async function getNextVersionNumber(assetId: string) {
  const latest = await findLatestVersion(assetId);
  return latest ? latest.version + 1 : 1;
}
