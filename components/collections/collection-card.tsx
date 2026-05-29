"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteCollectionAction } from "@/app/collections/actions";
import { useRouter } from "next/navigation";

interface CollectionCardProps {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  assetCount: number;
}

export function CollectionCard({ id, name, description, icon, color, assetCount }: CollectionCardProps) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    await deleteCollectionAction(id);
    setIsDeleting(false);
    setShowDelete(false);
    router.refresh();
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            {icon ? <span>{icon}</span> : <FolderOpen className="h-4 w-4" style={{ color: color || undefined }} />}
            <Link href={`/collections/${id}`} className="hover:underline">
              <CardTitle className="text-sm">{name}</CardTitle>
            </Link>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowDelete(true)} disabled={isDeleting}>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </CardHeader>
        <CardContent>
          {description && <p className="text-sm text-muted-foreground mb-2">{description}</p>}
          <p className="text-xs text-muted-foreground">{assetCount} 个资产</p>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="删除集合"
        description={`确定要删除集合「${name}」吗？集合内的资产不会被删除。`}
        confirmLabel="删除"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}
