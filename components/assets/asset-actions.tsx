"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  archiveAssetAction,
  deleteAssetAction,
  restoreAssetAction,
  rollbackAssetAction,
} from "@/app/assets/actions";
import { Archive, Trash2, RotateCcw } from "lucide-react";

interface ActionButtonProps {
  id: string;
}

export function ArchiveButton({ id }: ActionButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleArchive() {
    setIsLoading(true);
    const result = await archiveAssetAction(id);
    if (result.success) {
      router.refresh();
    }
    setIsLoading(false);
  }

  return (
    <>
      <Button variant="outline" onClick={() => setShowConfirm(true)} disabled={isLoading}>
        <Archive className="mr-2 h-4 w-4" />
        归档
      </Button>
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="归档资产"
        description="确定要归档这个资产吗？归档后可以恢复。"
        confirmLabel="归档"
        onConfirm={handleArchive}
      />
    </>
  );
}

export function DeleteButton({ id }: ActionButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    setIsLoading(true);
    const result = await deleteAssetAction(id);
    if (result.success) {
      router.refresh();
    }
    setIsLoading(false);
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setShowConfirm(true)} disabled={isLoading}>
        <Trash2 className="mr-2 h-4 w-4" />
        删除
      </Button>
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="删除资产"
        description="确定要删除这个资产吗？删除后可以恢复。"
        confirmLabel="删除"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
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

interface RollbackButtonProps extends ActionButtonProps {
  versionId: string;
  version: number;
  disabled?: boolean;
}

export function RollbackButton({
  id,
  versionId,
  version,
  disabled = false,
}: RollbackButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleRollback() {
    if (!confirm(`确定要回滚到版本 ${version} 吗？`)) return;
    setIsLoading(true);
    const result = await rollbackAssetAction(id, versionId);
    if (result.success) {
      router.refresh();
    }
    setIsLoading(false);
  }

  return (
    <Button
      variant="outline"
      onClick={handleRollback}
      disabled={disabled || isLoading}
    >
      <RotateCcw className="mr-2 h-4 w-4" />
      回滚
    </Button>
  );
}
