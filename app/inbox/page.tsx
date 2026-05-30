import Link from "next/link";

import { CaptureInboxForm } from "@/components/inbox/capture-inbox-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CAPTURE_INBOX_SOURCE_TYPE_LABELS,
  CAPTURE_INBOX_STATUS_LABELS,
} from "@/lib/constants";
import { getCaptureInboxItems } from "@/server/services/capture-inbox-service";

export const dynamic = "force-dynamic";

function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function InboxPage() {
  const items = await getCaptureInboxItems();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Capture Inbox</h1>
        <p className="text-sm text-muted-foreground">
          先收集原始材料，再决定哪些内容值得整理成正式资产。
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">手动粘贴</CardTitle>
          </CardHeader>
          <CardContent>
            <CaptureInboxForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">最近 Inbox 项</CardTitle>
              <Badge variant="secondary">{items.length} 条</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                还没有收集内容，先在左侧粘贴第一条材料。
              </p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="rounded-md border p-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-medium">{item.title}</h2>
                        <Badge variant="secondary">
                          {CAPTURE_INBOX_SOURCE_TYPE_LABELS[item.sourceType]}
                        </Badge>
                        <Badge variant="outline">
                          {CAPTURE_INBOX_STATUS_LABELS[item.status]}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>收集于：{formatTimestamp(item.createdAt)}</span>
                        {item.sourceTimestamp ? (
                          <span>来源时间：{formatTimestamp(item.sourceTimestamp)}</span>
                        ) : null}
                        {item.sourcePath ? <span>来源路径：{item.sourcePath}</span> : null}
                      </div>
                      <p className="line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">
                        {item.rawContent}
                      </p>
                      {item.extractionNote ? (
                        <p className="rounded bg-muted px-3 py-2 text-xs text-muted-foreground">
                          说明：{item.extractionNote}
                        </p>
                      ) : null}
                      <div className="flex flex-wrap items-center gap-3">
                        {item.convertedAsset ? (
                          <Link
                            href={`/assets/${item.convertedAsset.id}`}
                            className="text-sm text-primary hover:underline"
                          >
                            已关联资产：{item.convertedAsset.title}
                          </Link>
                        ) : (
                          <Link
                            href={`/inbox/${item.id}/convert`}
                            className="text-sm text-primary hover:underline"
                          >
                            复核并转为资产
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
