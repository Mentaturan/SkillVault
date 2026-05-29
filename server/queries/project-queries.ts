import { eq, and, asc, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { projects, projectAssets } from "@/db/schema";
import type { NewProject } from "@/db/schema";

export async function findAllProjects() {
  return db.query.projects.findMany({
    orderBy: [desc(projects.updatedAt)],
    with: {
      projectAssets: {
        columns: { assetId: true },
      },
    },
  });
}

export async function findProjectById(id: string) {
  return db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: {
      projectAssets: {
        orderBy: [asc(projectAssets.orderIndex)],
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

export async function createProject(data: NewProject) {
  const [project] = await db.insert(projects).values(data).returning();
  return project;
}

export async function updateProject(id: string, data: Partial<NewProject>) {
  const [project] = await db
    .update(projects)
    .set({ ...data, updatedAt: Date.now() })
    .where(eq(projects.id, id))
    .returning();
  return project;
}

export async function deleteProject(id: string) {
  await db.delete(projects).where(eq(projects.id, id));
}

export async function addAssetToProject(projectId: string, assetId: string, orderIndex: number) {
  await db.insert(projectAssets).values({
    projectId,
    assetId,
    orderIndex,
    createdAt: Date.now(),
  });
}

export async function removeAssetFromProject(projectId: string, assetId: string) {
  await db
    .delete(projectAssets)
    .where(
      and(eq(projectAssets.projectId, projectId), eq(projectAssets.assetId, assetId))
    );
}

export async function getMaxOrderIndex(projectId: string) {
  const result = await db
    .select({ maxOrder: sql<number>`coalesce(max(${projectAssets.orderIndex}), -1)` })
    .from(projectAssets)
    .where(eq(projectAssets.projectId, projectId));
  return result[0]?.maxOrder ?? -1;
}
