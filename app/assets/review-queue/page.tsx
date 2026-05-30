import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ASSET_STATUS_LABELS, ASSET_TYPE_LABELS } from "@/lib/constants";
import { getReviewQueue } from "@/server/services/review-queue-service";

export const dynamic = "force-dynamic";

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function dueLabel(status: "overdue" | "due_today" | "upcoming", dueInDays: number) {
  switch (status) {
    case "overdue":
      return `已逾期 ${Math.abs(dueInDays)} 天`;
    case "due_today":
      return "今天到期";
    default:
      return `${dueInDays} 天后到期`;
  }
}

export default async function ReviewQueuePage() {
  const queue = await getReviewQueue();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">复查队列</h1>
          <p className="text-sm text-muted-foreground">
            查看设置了复查截止日的资产，并优先处理已到期项。
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/assets">返回资产库</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">已排复查</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{queue.summary.scheduledAssetCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">已逾期</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{queue.summary.overdueCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">今天到期</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{queue.summary.dueTodayCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">后续待复查</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{queue.summary.upcomingCount}</div>
          </CardContent>
        </Card>
      </div>

      {queue.items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            当前没有设置复查截止日的资产。
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {queue.items.map((item) => (
            <Card key={item.asset.id}>
              <CardHeader className="gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">
                        <Link href={`/assets/${item.asset.id}`} className="hover:underline">
                          {item.asset.title}
                        </Link>
                      </CardTitle>
                      <Badge variant="secondary">
                        {ASSET_TYPE_LABELS[item.asset.type]}
                      </Badge>
                      <Badge variant="outline">
                        {ASSET_STATUS_LABELS[item.asset.status]}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>复查日期：{formatDate(item.asset.reviewDueAt as number)}</span>
                      <span>最近更新：{formatDate(item.asset.updatedAt)}</span>
                    </div>
                  </div>
                  <Badge variant={item.status === "overdue" ? "destructive" : "outline"}>
                    {dueLabel(item.status, item.dueInDays)}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
