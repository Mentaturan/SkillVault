import { z } from "zod";

import {
  CAPTURE_INBOX_SOURCE_TYPES,
  CAPTURE_INBOX_STATUSES,
} from "@/lib/constants";

export const createCaptureInboxItemSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200),
  rawContent: z.string().min(1, "内容不能为空").max(50000),
  sourceType: z.enum(CAPTURE_INBOX_SOURCE_TYPES).default("manual"),
  sourcePath: z.string().max(1000).optional(),
  sourceTimestamp: z.number().int().optional(),
  extractionNote: z.string().max(2000).optional(),
});

export const updateCaptureInboxItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "标题不能为空").max(200).optional(),
  rawContent: z.string().min(1, "内容不能为空").max(50000).optional(),
  sourceType: z.enum(CAPTURE_INBOX_SOURCE_TYPES).optional(),
  sourcePath: z.string().max(1000).optional(),
  sourceTimestamp: z.number().int().optional().nullable(),
  extractionNote: z.string().max(2000).optional().nullable(),
  status: z.enum(CAPTURE_INBOX_STATUSES).optional(),
  convertedAssetId: z.string().optional().nullable(),
});

export type CreateCaptureInboxItemInput = z.infer<typeof createCaptureInboxItemSchema>;
export type UpdateCaptureInboxItemInput = z.infer<typeof updateCaptureInboxItemSchema>;
