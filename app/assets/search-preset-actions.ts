"use server";

import { z } from "zod";
import { saveSearchPreset, removeSearchPreset } from "@/server/services/search-preset-service";
import { revalidatePath } from "next/cache";

const savePresetSchema = z.object({
  name: z.string().min(1).max(50),
  filters: z.string().min(1),
});

export async function saveSearchPresetAction(name: string, filtersJson: string) {
  const result = savePresetSchema.safeParse({ name, filters: filtersJson });
  if (!result.success) {
    return { error: "Invalid input" };
  }
  try {
    const preset = await saveSearchPreset(name, JSON.parse(filtersJson));
    revalidatePath("/assets");
    return { preset };
  } catch {
    return { error: "Failed to save preset" };
  }
}

export async function deleteSearchPresetAction(id: string) {
  try {
    await removeSearchPreset(id);
    revalidatePath("/assets");
    return { success: true };
  } catch {
    return { error: "Failed to delete preset" };
  }
}
