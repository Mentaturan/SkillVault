import Link from "next/link";
import { notFound } from "next/navigation";

import type { ReactNode } from "react";

import { ConvertInboxItemForm } from "@/components/inbox/convert-inbox-item-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CAPTURE_INBOX_SOURCE_TYPE_LABELS,
  CAPTURE_INBOX_STATUS_LABELS,
} from "@/lib/constants";
import { getCaptureInboxItemById } from "@/server/services/capture-inbox-service";

export const dynamic = "force-dynamic";

function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ConvertInboxItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getCaptureInboxItemById(id);

  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">转换为资产</h1>
          <p className="text-sm text-muted-foreground">
            先复核原始材料，再手工整理真正要进入资产库的内容。
          </p>
        </div>
        <ButtonLink href="/inbox">返回 Inbox</ButtonLink>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">{item.title}</CardTitle>
              <Badge variant="secondary">
                {CAPTURE_INBOX_SOURCE_TYPE_LABELS[item.sourceType]}
              </Badge>
              <Badge variant="outline">
                {CAPTURE_INBOX_STATUS_LABELS[item.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>收集于：{formatTimestamp(item.createdAt)}</span>
              {item.sourceTimestamp ? (
                <span>来源时间：{formatTimestamp(item.sourceTimestamp)}</span>
              ) : null}
              {item.sourcePath ? <span>来源路径：{item.sourcePath}</span> : null}
            </div>
            <div className="rounded-md border bg-muted/30 p-4">
              <p className="whitespace-pre-wrap text-sm">{item.rawContent}</p>
            </div>
            {item.extractionNote ? (
              <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                说明：{item.extractionNote}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">复核后创建资产</CardTitle>
          </CardHeader>
          <CardContent>
            {item.convertedAsset ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  这条 Inbox 项已经转成资产，当前不再重复创建。
                </p>
                <Link
                  href={`/assets/${item.convertedAsset.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  查看资产：{item.convertedAsset.title}
                </Link>
              </div>
            ) : (
              <ConvertInboxItemForm item={item} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ButtonLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-muted"
    >
      {children}
    </Link>
  );
}
