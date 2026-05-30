import { z } from "zod";
import {
  ASSET_TYPES,
  TARGET_TOOLS,
  EXPORT_PRESETS,
  ASSET_STATUSES,
  VISIBILITIES,
  ASSET_SOURCES,
} from "@/lib/constants";

export const ExchangeManifest = z.object({
  version: z.literal(1),
  exportedAt: z.number().int().nonnegative(),
  asset: z.object({
    syncId: z.string().min(1),
    slug: z.string().min(1),
    title: z.string().min(1),
    type: z.enum(ASSET_TYPES),
    targetTool: z.enum(TARGET_TOOLS),
    exportPreset: z.enum(EXPORT_PRESETS),
    description: z.string().nullable().optional(),
    scenario: z.string().nullable().optional(),
    status: z.enum(ASSET_STATUSES),
    visibility: z.enum(VISIBILITIES),
    source: z.enum(ASSET_SOURCES),
    sourceUrl: z.string().nullable().optional(),
    sourceRef: z.string().nullable().optional(),
    sourcePath: z.string().nullable().optional(),
    sourceImportedAt: z.number().int().nonnegative().nullable().optional(),
    sourceChecksum: z.string().nullable().optional(),
    pinned: z.boolean().optional(),
    rating: z.number().int().nullable().optional(),
    tags: z.array(z.string()).optional(),
    contentHash: z.string().min(1),
  }),
  supportFiles: z.array(z.object({
    name: z.string().min(1),
    size: z.number().int().nonnegative(),
  })).optional(),
});

export type ExchangeManifestType = z.infer<typeof ExchangeManifest>;
