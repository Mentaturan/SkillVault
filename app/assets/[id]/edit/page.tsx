import { notFound } from "next/navigation";
import { AssetForm } from "@/components/assets/asset-form";
import { getAssetById } from "@/server/services/asset-service";

interface EditAssetPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAssetPage({ params }: EditAssetPageProps) {
  const { id } = await params;
  const asset = await getAssetById(id);

  if (!asset) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Asset</h1>
        <p className="text-sm text-muted-foreground">
          Update asset: {asset.title}
        </p>
      </div>
      <AssetForm asset={asset} isEditing />
    </div>
  );
}
