"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCollectionAction, updateCollectionAction } from "@/app/collections/actions";
import { useRouter } from "next/navigation";

interface CollectionFormProps {
  collectionId?: string;
  initialData?: { name: string; description: string; icon: string; color: string };
}

export function CollectionForm({ collectionId, initialData }: CollectionFormProps) {
  const router = useRouter();
  const isEdit = !!collectionId;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      if (isEdit) {
        const result = await updateCollectionAction(collectionId, formData);
        if (result.success) {
          router.push(`/collections/${collectionId}`);
          router.refresh();
        } else {
          setError(typeof result.error === "string" ? result.error : "更新集合失败");
        }
      } else {
        const result = await createCollectionAction(formData);
        if (result.success && result.collection) {
          router.push(`/collections/${result.collection.id}`);
        } else {
          setError(typeof result.error === "string" ? result.error : "创建集合失败");
        }
      }
    } catch {
      setError("发生了意外错误");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="name">名称</Label>
        <Input id="name" name="name" defaultValue={initialData?.name ?? ""} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">描述</Label>
        <Textarea id="description" name="description" defaultValue={initialData?.description ?? ""} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="icon">图标（单个 emoji）</Label>
          <Input id="icon" name="icon" defaultValue={initialData?.icon ?? ""} maxLength={10} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">颜色</Label>
          <Input id="color" name="color" defaultValue={initialData?.color ?? ""} placeholder="#3b82f6" maxLength={20} />
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? "保存中..." : isEdit ? "保存" : "创建"}
        </Button>
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.back()}>取消</Button>
      </div>
    </form>
  );
}
