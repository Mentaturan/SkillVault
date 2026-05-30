"use server";

import { revalidatePath } from "next/cache";

import { createCaptureInboxItemSchema } from "@/lib/validators/capture-inbox";
import { createNewCaptureInboxItem } from "@/server/services/capture-inbox-service";

function parseSourceTimestamp(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? undefined : timestamp;
}

function parseFormData(formData: FormData) {
  return {
    title: formData.get("title") as string,
    rawContent: formData.get("rawContent") as string,
    sourceType: "manual" as const,
    sourcePath: (formData.get("sourcePath") as string) || undefined,
    sourceTimestamp: parseSourceTimestamp(formData.get("sourceTimestamp")),
    extractionNote: (formData.get("extractionNote") as string) || undefined,
  };
}

export async function createCaptureInboxItemAction(formData: FormData) {
  try {
    const parsed = createCaptureInboxItemSchema.safeParse(parseFormData(formData));
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors };
    }

    const item = await createNewCaptureInboxItem(parsed.data);
    revalidatePath("/inbox");

    return { success: true, item };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "创建 capture inbox 项失败",
    };
  }
}
