import { getAllCollections } from "@/server/services/collection-service";
import { CollectionCard } from "@/components/collections/collection-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function CollectionsPage() {
  const collections = await getAllCollections();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">集合</h1>
          <p className="text-sm text-muted-foreground">将资产组织到集合中</p>
        </div>
        <Button asChild>
          <Link href="/collections/new">
            <Plus className="mr-2 h-4 w-4" />
            新建集合
          </Link>
        </Button>
      </div>

      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">还没有集合</p>
          <Button asChild variant="link" className="mt-2">
            <Link href="/collections/new">创建第一个集合</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <CollectionCard
              key={c.id}
              id={c.id}
              name={c.name}
              description={c.description}
              icon={c.icon}
              color={c.color}
              assetCount={c.collectionAssets?.length ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
