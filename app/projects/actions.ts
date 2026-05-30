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
  try {
    const raw = {
      name: formData.get("name") as string,
      description: formData.get("description") as string || undefined,
      path: formData.get("path") as string || undefined,
      icon: formData.get("icon") as string || undefined,
      color: formData.get("color") as string || undefined,
    };

    const parsed = createProjectSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues.map((i) => i.message).join(", ") };
    }

    const project = await createNewProject(parsed.data);
    revalidatePath("/projects");
    return { success: true as const, project };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "创建项目失败" };
  }
}

export async function updateProjectAction(formData: FormData) {
  try {
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
      return { success: false as const, error: parsed.error.issues.map((i) => i.message).join(", ") };
    }

    const project = await updateExistingProject(parsed.data);
    revalidatePath("/projects");
    revalidatePath(`/projects/${raw.id}`);
    return { success: true as const, project };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "更新项目失败" };
  }
}

export async function deleteProjectAction(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id || typeof id !== "string") {
    return { success: false as const, error: "缺少项目 ID" };
  }

  try {
    await deleteExistingProject(id);
    revalidatePath("/projects");
    return { success: true as const };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "删除项目失败" };
  }
}

export async function addAssetToProjectAction(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const assetId = formData.get("assetId") as string;
  if (!projectId || typeof projectId !== "string") {
    return { success: false as const, error: "缺少项目 ID" };
  }
  if (!assetId || typeof assetId !== "string") {
    return { success: false as const, error: "缺少资产 ID" };
  }

  try {
    await addAssetToExistingProject(projectId, assetId);
    revalidatePath(`/projects/${projectId}`);
    return { success: true as const };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "添加资产到项目失败" };
  }
}

export async function removeAssetFromProjectAction(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const assetId = formData.get("assetId") as string;
  if (!projectId || typeof projectId !== "string") {
    return { success: false as const, error: "缺少项目 ID" };
  }
  if (!assetId || typeof assetId !== "string") {
    return { success: false as const, error: "缺少资产 ID" };
  }

  try {
    await removeAssetFromExistingProject(projectId, assetId);
    revalidatePath(`/projects/${projectId}`);
    return { success: true as const };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "从项目移除资产失败" };
  }
}
