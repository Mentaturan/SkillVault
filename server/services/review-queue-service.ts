import { findAllAssets } from "@/server/queries/asset-queries";

export interface ReviewQueueItem {
  asset: Awaited<ReturnType<typeof findAllAssets>>[number];
  status: "overdue" | "due_today" | "upcoming";
  dueInDays: number;
}

function startOfDay(timestamp: number) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export async function getReviewQueue() {
  const assets = await findAllAssets();
  const today = startOfDay(Date.now());
  const dayMs = 24 * 60 * 60 * 1000;

  const items: ReviewQueueItem[] = assets
    .filter((asset) => asset.reviewDueAt !== null)
    .map((asset) => {
      const dueAt = startOfDay(asset.reviewDueAt as number);
      const dueInDays = Math.floor((dueAt - today) / dayMs);
      const status: ReviewQueueItem["status"] =
        dueInDays < 0
          ? "overdue"
          : dueInDays === 0
            ? "due_today"
            : "upcoming";

      return {
        asset,
        dueInDays,
        status,
      };
    })
    .sort((left, right) => {
      if (left.asset.reviewDueAt !== right.asset.reviewDueAt) {
        return (left.asset.reviewDueAt ?? 0) - (right.asset.reviewDueAt ?? 0);
      }

      return right.asset.updatedAt - left.asset.updatedAt;
    });

  return {
    items,
    summary: {
      scheduledAssetCount: items.length,
      overdueCount: items.filter((item) => item.status === "overdue").length,
      dueTodayCount: items.filter((item) => item.status === "due_today").length,
      upcomingCount: items.filter((item) => item.status === "upcoming").length,
    },
  };
}
