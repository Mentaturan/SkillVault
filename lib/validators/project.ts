import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "名称不能为空").max(100),
  description: z.string().max(500).optional(),
  path: z.string().max(500).optional(),
  icon: z.string().max(10).optional(),
  color: z.string().max(20).optional(),
});

export const updateProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "名称不能为空").max(100).optional(),
  description: z.string().max(500).optional(),
  path: z.string().max(500).optional(),
  icon: z.string().max(10).optional(),
  color: z.string().max(20).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
