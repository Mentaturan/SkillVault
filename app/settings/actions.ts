"use server";

import { getEntityCounts } from "@/server/queries/diagnostic-queries";

export async function getDiagnosticsAction() {
  return getEntityCounts();
}
