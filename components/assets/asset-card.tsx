import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyContentButton } from "@/components/assets/copy-content-button";
import { Pin, Download } from "lucide-react";
import type { Asset, Tag } from "@/db/schema";
import { ASSET_STATUS_LABELS, ASSET_TYPE_LABELS } from "@/lib/constants";

interface AssetCardProps {
  asset: Asset & {
    assetTags?: { tag: Tag }[];
  };
}

export function AssetCard({ asset }: AssetCardProps) {
  const tags = asset.assetTags?.map((at) => at.tag) ?? [];

  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-base">
            <Link href={`/assets/${asset.id}`} className="hover:underline">
              {asset.title}
            </Link>
          </CardTitle>
          {asset.pinned && <Pin className="h-4 w-4 shrink-0 text-primary" />}
        </div>
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary">{ASSET_TYPE_LABELS[asset.type]}</Badge>
          <Badge variant="outline">{ASSET_STATUS_LABELS[asset.status]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {asset.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {asset.description}
          </p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <Link
            href={`/assets/${asset.id}`}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            查看
          </Link>
          <div className="flex gap-1">
            <Link
              href={`/api/assets/${asset.id}/export`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              title="导出 Markdown"
            >
              <Download className="h-4 w-4" />
            </Link>
            <CopyContentButton content={asset.content} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
