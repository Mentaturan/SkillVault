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
    if (!confirm("Are you sure you want to archive this asset?")) return;
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
      Archive
    </Button>
  );
}

export function DeleteButton({ id }: ActionButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this asset?")) return;
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
      Delete
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
      Restore
    </Button>
  );
}
