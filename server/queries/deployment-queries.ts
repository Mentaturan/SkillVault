import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  deploymentRecords,
  deploymentTargets,
  type NewDeploymentRecord,
  type NewDeploymentTarget,
} from "@/db/schema";

export async function findAllDeploymentTargets() {
  return db.query.deploymentTargets.findMany({
    orderBy: [asc(deploymentTargets.createdAt)],
  });
}

export async function findDeploymentTargetById(id: string) {
  return db.query.deploymentTargets.findFirst({
    where: eq(deploymentTargets.id, id),
  });
}

export async function findDeploymentTargetByKey(key: NewDeploymentTarget["key"]) {
  return db.query.deploymentTargets.findFirst({
    where: eq(deploymentTargets.key, key),
  });
}

export async function createDeploymentTarget(data: NewDeploymentTarget) {
  const [target] = await db.insert(deploymentTargets).values(data).returning();
  return target;
}

export async function updateDeploymentTarget(
  id: string,
  data: Partial<NewDeploymentTarget>,
) {
  const [target] = await db
    .update(deploymentTargets)
    .set({ ...data, updatedAt: Date.now() })
    .where(eq(deploymentTargets.id, id))
    .returning();
  return target;
}

export async function findAllDeploymentRecords() {
  return db.query.deploymentRecords.findMany({
    with: {
      asset: {
        columns: {
          id: true,
          title: true,
        },
      },
      deploymentTarget: true,
    },
    orderBy: [asc(deploymentRecords.updatedAt)],
  });
}

export async function findDeploymentRecordsByAssetId(assetId: string) {
  return db.query.deploymentRecords.findMany({
    where: eq(deploymentRecords.assetId, assetId),
    with: {
      deploymentTarget: true,
    },
  });
}

export async function findDeploymentRecordByAssetAndTarget(
  assetId: string,
  deploymentTargetId: string,
) {
  return db.query.deploymentRecords.findFirst({
    where: and(
      eq(deploymentRecords.assetId, assetId),
      eq(deploymentRecords.deploymentTargetId, deploymentTargetId),
    ),
    with: {
      deploymentTarget: true,
    },
  });
}

export async function createDeploymentRecord(data: NewDeploymentRecord) {
  const [record] = await db.insert(deploymentRecords).values(data).returning();
  return record;
}

export async function updateDeploymentRecord(
  id: string,
  data: Partial<NewDeploymentRecord>,
) {
  const [record] = await db
    .update(deploymentRecords)
    .set({ ...data, updatedAt: Date.now() })
    .where(eq(deploymentRecords.id, id))
    .returning();
  return record;
}
