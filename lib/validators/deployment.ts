import path from "node:path";
import { z } from "zod";

import { DEPLOYMENT_TARGET_KEYS } from "@/lib/constants";

const deploymentPathSchema = z
  .string()
  .trim()
  .max(1000, "路径过长")
  .refine((value) => value.length === 0 || path.isAbsolute(value), {
    message: "部署目录必须是绝对路径",
  });

export const saveDeploymentTargetsSchema = z.array(
  z.object({
    key: z.enum(DEPLOYMENT_TARGET_KEYS),
    path: deploymentPathSchema,
    enabled: z.boolean(),
  }),
);

export const deploymentPreviewSchema = z.object({
  assetId: z.string().min(1),
  targetId: z.string().min(1),
});

export type SaveDeploymentTargetsInput = z.infer<typeof saveDeploymentTargetsSchema>;
export type DeploymentPreviewInput = z.infer<typeof deploymentPreviewSchema>;
