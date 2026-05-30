import { z } from "zod";

export const ASSET_USE_KINDS = ["raw_copy", "rendered_copy"] as const;

export const recordAssetUseSchema = z.object({
  assetId: z.string().min(1),
  kind: z.enum(ASSET_USE_KINDS),
});

export type RecordAssetUseInput = z.infer<typeof recordAssetUseSchema>;
