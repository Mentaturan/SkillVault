import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAssetById } from "@/server/services/asset-service";
import { getVersionsByAssetId } from "@/server/services/version-service";
import {
  ArchiveButton,
  DeleteButton,
  RestoreButton,
} from "@/components/assets/asset-actions";
import { Edit, History, Pin } from "lucide-react";

interface AssetDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const { id } = await params;
  const asset = await getAssetById(id);

  if (!asset) {
    notFound();
  }

  const versions = await getVersionsByAssetId(asset.id);
  const assetTags = asset.assetTags as Array<{ tag: { id: string; name: string } }> | undefined;
  const tags = assetTags?.map((at) => at.tag) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{asset.title}</h1>
            {asset.pinned && <Pin className="h-5 w-5 text-primary" />}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>{asset.type}</Badge>
            <Badge variant="outline">{asset.status}</Badge>
            <Badge variant="secondary">{asset.targetTool}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/assets/${asset.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          {asset.status !== "archived" && (
            <ArchiveButton id={asset.id} />
          )}
          {!asset.deletedAt && (
            <DeleteButton id={asset.id} />
          )}
          {asset.deletedAt && (
            <RestoreButton id={asset.id} />
          )}
        </div>
      </div>

      {asset.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{asset.description}</p>
          </CardContent>
        </Card>
      )}

      {asset.scenario && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Scenario</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{asset.scenario}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Content</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
            {asset.content}
          </pre>
        </CardContent>
      </Card>

      {tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Versions</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/assets/${asset.id}/versions`}>
                <History className="mr-2 h-4 w-4" />
                View History
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {versions.length} version{versions.length !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Export Preset</dt>
              <dd>{asset.exportPreset}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Visibility</dt>
              <dd>{asset.visibility}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Source</dt>
              <dd>{asset.source}</dd>
            </div>
            {asset.sourceUrl && (
              <div>
                <dt className="text-muted-foreground">Source URL</dt>
                <dd>
                  <a
                    href={asset.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    {asset.sourceUrl}
                  </a>
                </dd>
              </div>
            )}
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{new Date(asset.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Updated</dt>
              <dd>{new Date(asset.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
