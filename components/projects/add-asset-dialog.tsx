"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { addAssetToProjectAction } from "@/app/projects/actions";
import { useRouter } from "next/navigation";

interface AssetOption {
  id: string;
  title: string;
  type: string;
}

interface AddAssetDialogProps {
  projectId: string;
  assets: AssetOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAssetDialog({ projectId, assets, open, onOpenChange }: AddAssetDialogProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  async function handleAdd() {
    if (!selectedId) return;
    setIsAdding(true);
    const fd = new FormData();
    fd.set("projectId", projectId);
    fd.set("assetId", selectedId);
    await addAssetToProjectAction(fd);
    setIsAdding(false);
    setSelectedId(null);
    onOpenChange(false);
    router.refresh();
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>添加资产到项目</AlertDialogTitle>
          <AlertDialogDescription>
            选择要添加的资产
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="max-h-60 overflow-y-auto space-y-1">
          {assets.length === 0 ? (
            <p className="text-sm text-muted-foreground">没有可添加的资产</p>
          ) : (
            assets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                className={`w-full text-left rounded-md px-3 py-2 text-sm hover:bg-muted ${
                  selectedId === asset.id ? "bg-primary/10 border border-primary" : "border border-transparent"
                }`}
                onClick={() => setSelectedId(asset.id)}
              >
                {asset.title}
              </button>
            ))
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setSelectedId(null)}>取消</AlertDialogCancel>
          <AlertDialogAction onClick={handleAdd} disabled={!selectedId || isAdding}>
            添加
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
