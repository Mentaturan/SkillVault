import { z } from "zod";
import {
  ASSET_SOURCES,
  ASSET_STATUSES,
  ASSET_TYPES,
  EXPORT_PRESETS,
  RATING_MAX,
  RATING_MIN,
  TARGET_TOOLS,
  VISIBILITIES,
} from "@/lib/constants";

export const createAssetSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(ASSET_TYPES),
  targetTool: z.enum(TARGET_TOOLS),
  exportPreset: z.enum(EXPORT_PRESETS),
  description: z.string().max(2000).optional().nullable(),
  scenario: z.string().max(2000).optional().nullable(),
  content: z.string().min(1),
  status: z.enum(ASSET_STATUSES).optional(),
  rating: z.number().int().min(RATING_MIN).max(RATING_MAX).optional().nullable(),
  visibility: z.enum(VISIBILITIES).optional(),
  source: z.enum(ASSET_SOURCES).optional(),
  sourceUrl: z.string().url().max(500).optional().nullable(),
  pinned: z.boolean().optional(),
  tagNames: z.array(z.string().min(1).max(50)).optional(),
});

export const updateAssetSchema = createAssetSchema.partial().extend({
  id: z.string().min(1),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;