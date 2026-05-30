import { z } from "zod";

export const codexRolloutImportPathSchema = z.object({
  sourcePath: z
    .string()
    .min(1, "文件路径不能为空")
    .max(2000, "文件路径过长")
    .refine((value) => value.endsWith(".jsonl"), "只支持导入 .jsonl 文件"),
});

export type CodexRolloutImportPathInput = z.infer<typeof codexRolloutImportPathSchema>;

export const codexRolloutScanPathSchema = z.object({
  directoryPath: z.string().min(1, "目录路径不能为空").max(2000, "目录路径过长"),
});

export type CodexRolloutScanPathInput = z.infer<typeof codexRolloutScanPathSchema>;
