import { createId } from "@/lib/id";
import { nowTimestamp } from "@/lib/time";
import {
  findAllProjects,
  findProjectById,
  createProject,
  updateProject,
  deleteProject,
  addAssetToProject,
  removeAssetFromProject,
  getMaxOrderIndex,
} from "@/server/queries/project-queries";
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/validators/project";

export async function getAllProjects() {
  return findAllProjects();
}

export async function getProjectById(id: string) {
  return findProjectById(id);
}

export async function createNewProject(input: CreateProjectInput) {
  const id = createId();
  const now = nowTimestamp();

  const project = await createProject({
    id,
    name: input.name,
    description: input.description ?? null,
    path: input.path ?? null,
    icon: input.icon ?? null,
    color: input.color ?? null,
    createdAt: now,
    updatedAt: now,
  });

  return project;
}

export async function updateExistingProject(input: UpdateProjectInput) {
  const { id, ...updates } = input;
  const data: Record<string, unknown> = {};
  if (updates.name !== undefined) data.name = updates.name;
  if (updates.description !== undefined) data.description = updates.description;
  if (updates.path !== undefined) data.path = updates.path;
  if (updates.icon !== undefined) data.icon = updates.icon;
  if (updates.color !== undefined) data.color = updates.color;

  return updateProject(id, data);
}

export async function deleteExistingProject(id: string) {
  const existing = await findProjectById(id);
  if (!existing) {
    throw new Error("项目不存在");
  }
  return deleteProject(id);
}

export async function addAssetToExistingProject(projectId: string, assetId: string) {
  const maxOrder = await getMaxOrderIndex(projectId);
  return addAssetToProject(projectId, assetId, maxOrder + 1);
}

export async function removeAssetFromExistingProject(projectId: string, assetId: string) {
  return removeAssetFromProject(projectId, assetId);
}
