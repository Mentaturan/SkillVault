"use server";

import { revalidatePath } from "next/cache";
import { createProjectSchema, updateProjectSchema } from "@/lib/validators/project";
import {
  createNewProject,
  updateExistingProject,
  deleteExistingProject,
  addAssetToExistingProject,
  removeAssetFromExistingProject,
} from "@/server/services/project-service";

export async function createProjectAction(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    description: formData.get("description") as string || undefined,
    path: formData.get("path") as string || undefined,
    icon: formData.get("icon") as string || undefined,
    color: formData.get("color") as string || undefined,
  };

  const parsed = createProjectSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const project = await createNewProject(parsed.data);
  revalidatePath("/projects");
  return { project };
}

export async function updateProjectAction(formData: FormData) {
  const raw = {
    id: formData.get("id") as string,
    name: formData.get("name") as string || undefined,
    description: formData.get("description") as string || undefined,
    path: formData.get("path") as string || undefined,
    icon: formData.get("icon") as string || undefined,
    color: formData.get("color") as string || undefined,
  };

  const parsed = updateProjectSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const project = await updateExistingProject(parsed.data);
  revalidatePath("/projects");
  revalidatePath(`/projects/${raw.id}`);
  return { project };
}

export async function deleteProjectAction(formData: FormData) {
  const id = formData.get("id") as string;
  await deleteExistingProject(id);
  revalidatePath("/projects");
  return { success: true };
}

export async function addAssetToProjectAction(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const assetId = formData.get("assetId") as string;
  await addAssetToExistingProject(projectId, assetId);
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function removeAssetFromProjectAction(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const assetId = formData.get("assetId") as string;
  await removeAssetFromExistingProject(projectId, assetId);
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}
