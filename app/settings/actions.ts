"use server";

import { getDiagnosticsSnapshot } from "@/server/services/diagnostics-service";

export async function getDiagnosticsAction() {
  return getDiagnosticsSnapshot();
}
