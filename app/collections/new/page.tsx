import { CollectionForm } from "@/components/collections/collection-form";

export default function NewCollectionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">新建集合</h1>
        <p className="text-sm text-muted-foreground">创建一个新的资产集合</p>
      </div>
      <CollectionForm />
    </div>
  );
}
