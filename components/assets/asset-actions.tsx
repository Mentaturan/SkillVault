"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  archiveAssetAction,
  deleteAssetAction,
  restoreAssetAction,
} from "@/app/assets/actions";
import { Archive, Trash2, RotateCcw } from "lucide-react";

interface ActionButtonProps {
  id: string;
}

export function ArchiveButton({ id }: ActionButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleArchive() {
    if (!confirm("确定要归档这个资产吗？")) return;
    setIsLoading(true);
    const result = await archiveAssetAction(id);
    if (result.success) {
      router.refresh();
    }
    setIsLoading(false);
  }

  return (
    <Button variant="outline" onClick={handleArchive} disabled={isLoading}>
      <Archive className="mr-2 h-4 w-4" />
      归档
    </Button>
  );
}

export function DeleteButton({ id }: ActionButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("确定要删除这个资产吗？")) return;
    setIsLoading(true);
    const result = await deleteAssetAction(id);
    if (result.success) {
      router.refresh();
    }
    setIsLoading(false);
  }

  return (
    <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
      <Trash2 className="mr-2 h-4 w-4" />
      删除
    </Button>
  );
}

export function RestoreButton({ id }: ActionButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleRestore() {
    setIsLoading(true);
    const result = await restoreAssetAction(id);
    if (result.success) {
      router.refresh();
    }
    setIsLoading(false);
  }

  return (
    <Button variant="outline" onClick={handleRestore} disabled={isLoading}>
      <RotateCcw className="mr-2 h-4 w-4" />
      恢复
    </Button>
  );
}
