import { getCollectionById } from "@/server/services/collection-service";
import { getAssets } from "@/server/services/asset-service";
import { notFound } from "next/navigation";
import { CollectionDetailClient } from "@/components/collections/collection-detail-client";

export default async function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const collection = await getCollectionById(id);
  if (!collection) notFound();

  const allAssets = await getAssets();
  const existingAssetIds = new Set(collection.collectionAssets?.map((ca) => ca.assetId) ?? []);
  const availableAssets = allAssets
    .filter((a) => !existingAssetIds.has(a.id))
    .map((a) => ({ id: a.id, title: a.title, type: a.type }));

  const collectionAssets = collection.collectionAssets?.map((ca) => ({
    assetId: ca.assetId,
    orderIndex: ca.orderIndex,
    asset: ca.asset,
  })) ?? [];

  return (
    <CollectionDetailClient
      collection={collection}
      collectionAssets={collectionAssets}
      availableAssets={availableAssets}
    />
  );
}
