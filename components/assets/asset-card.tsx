import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pin } from "lucide-react";
import type { Asset, Tag } from "@/db/schema";

interface AssetCardProps {
  asset: Asset & {
    assetTags?: { tag: Tag }[];
  };
}

export function AssetCard({ asset }: AssetCardProps) {
  const tags = asset.assetTags?.map((at) => at.tag) ?? [];

  return (
    <Link href={`/assets/${asset.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="line-clamp-2 text-base">{asset.title}</CardTitle>
            {asset.pinned && <Pin className="h-4 w-4 shrink-0 text-primary" />}
          </div>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary">{asset.type}</Badge>
            <Badge variant="outline">{asset.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {asset.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {asset.description}
            </p>
          )}
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
