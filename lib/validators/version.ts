import { z } from "zod";

export const createVersionSchema = z.object({
  assetId: z.string().min(1),
  titleSnapshot: z.string().min(1),
  contentSnapshot: z.string().min(1),
  contentHash: z.string().min(1),
  changeNote: z.string().max(500).optional().nullable(),
});

export type CreateVersionInput = z.infer<typeof createVersionSchema>;