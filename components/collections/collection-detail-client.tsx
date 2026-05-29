"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AddAssetDialog } from "@/components/collections/add-asset-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { removeAssetFromCollectionAction, deleteCollectionAction, reorderCollectionAssetsAction } from "@/app/collections/actions";
import { ASSET_TYPE_LABELS } from "@/lib/constants";
import { ArrowUp, ArrowDown, X, Download, Trash2, Plus, ArrowLeft } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
}

interface CollectionAsset {
  assetId: string;
  orderIndex: number;
  asset: {
    id: string;
    title: string;
    type: string;
    status: string;
    assetTags?: Array<{ tag: { name: string } }>;
  };
}

interface AssetOption {
  id: string;
  title: string;
  type: string;
}

interface CollectionDetailClientProps {
  collection: Collection;
  collectionAssets: CollectionAsset[];
  availableAssets: AssetOption[];
}

export function CollectionDetailClient({ collection, collectionAssets, availableAssets }: CollectionDetailClientProps) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [items, setItems] = useState(collectionAssets);

  async function handleRemove(assetId: string) {
    await removeAssetFromCollectionAction(collection.id, assetId);
    setItems((prev) => prev.filter((i) => i.assetId !== assetId));
    router.refresh();
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    const assetOrders = newItems.map((item, i) => ({ assetId: item.assetId, orderIndex: i }));
    setItems(newItems);
    await reorderCollectionAssetsAction(collection.id, assetOrders);
  }

  async function handleMoveDown(index: number) {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    const assetOrders = newItems.map((item, i) => ({ assetId: item.assetId, orderIndex: i }));
    setItems(newItems);
    await reorderCollectionAssetsAction(collection.id, assetOrders);
  }

  async function handleDeleteCollection() {
    setIsDeleting(true);
    await deleteCollectionAction(collection.id);
    setIsDeleting(false);
    router.push("/collections");
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-2">
        <Link href="/collections">
          <ArrowLeft className="h-4 w-4" />
          返回集合列表
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{collection.icon} {collection.name}</h1>
          {collection.description && (
            <p className="text-sm text-muted-foreground">{collection.description}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="mr-2 h-4 w-4" />
            添加资产
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/api/collections/${collection.id}/export`}>
              <Download className="mr-2 h-4 w-4" />
              导出集合
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/collections/${collection.id}/edit`}>编辑</Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)} disabled={isDeleting}>
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">集合为空</p>
          <Button variant="link" className="mt-2" onClick={() => setShowAdd(true)}>
            添加第一个资产
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <Card key={item.assetId}>
              <CardContent className="flex items-center justify-between gap-2 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleMoveUp(index)} disabled={index === 0}>
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleMoveDown(index)} disabled={index === items.length - 1}>
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <Link href={`/assets/${item.asset.id}`} className="text-sm font-medium hover:underline truncate">
                    {item.asset.title}
                  </Link>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {ASSET_TYPE_LABELS[item.asset.type as keyof typeof ASSET_TYPE_LABELS] ?? item.asset.type}
                  </Badge>
                  {item.asset.assetTags && item.asset.assetTags.length > 0 && (
                    <>
                      {item.asset.assetTags.map((at) => (
                        <Badge key={at.tag.name} variant="outline" className="text-xs shrink-0">
                          {at.tag.name}
                        </Badge>
                      ))}
                    </>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemove(item.assetId)}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddAssetDialog
        collectionId={collection.id}
        assets={availableAssets}
        open={showAdd}
        onOpenChange={setShowAdd}
      />

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="删除集合"
        description={`确定要删除集合「${collection.name}」吗？集合内的资产不会被删除。`}
        confirmLabel="删除"
        variant="destructive"
        onConfirm={handleDeleteCollection}
      />
    </div>
  );
}
