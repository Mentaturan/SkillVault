"use server";

import { getDashboardData } from "@/server/queries/dashboard-queries";

export async function getDashboardAction() {
  return getDashboardData();
}
