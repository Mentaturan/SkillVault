"use server";

import { getDashboardData } from "@/server/queries/dashboard-queries";

export async function getDashboardAction() {
  try {
    const data = await getDashboardData();
    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "获取仪表盘数据失败" };
  }
}
