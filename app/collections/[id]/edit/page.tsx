import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollectionForm } from "@/components/collections/collection-form";
import { getCollectionById } from "@/server/services/collection-service";

export default async function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const collection = await getCollectionById(id);
  if (!collection) notFound();

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-2">
        <Link href={`/collections/${collection.id}`}>
          <ArrowLeft className="h-4 w-4" />
          返回集合详情
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-semibold">编辑集合</h1>
        <p className="text-sm text-muted-foreground">
          正在编辑：{collection.name}
        </p>
      </div>
      <CollectionForm
        collectionId={collection.id}
        initialData={{
          name: collection.name,
          description: collection.description ?? "",
          icon: collection.icon ?? "",
          color: collection.color ?? "",
        }}
      />
    </div>
  );
}
