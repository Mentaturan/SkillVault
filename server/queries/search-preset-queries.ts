import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { searchPresets } from "@/db/schema";
import type { NewSearchPreset } from "@/db/schema";

export async function findAllSearchPresets() {
  return db.select().from(searchPresets).orderBy(desc(searchPresets.createdAt));
}

export async function findSearchPresetById(id: string) {
  const [preset] = await db.select().from(searchPresets).where(eq(searchPresets.id, id));
  return preset ?? null;
}

export async function createSearchPreset(data: NewSearchPreset) {
  const [preset] = await db.insert(searchPresets).values(data).returning();
  return preset;
}

export async function deleteSearchPreset(id: string) {
  const [preset] = await db.delete(searchPresets).where(eq(searchPresets.id, id)).returning();
  return preset;
}
