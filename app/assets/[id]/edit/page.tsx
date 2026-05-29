import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-2">
        <Link href={`/assets/${asset.id}`}>
          <ArrowLeft className="h-4 w-4" />
          返回资产详情
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-semibold">编辑资产</h1>
        <p className="text-sm text-muted-foreground">
          正在编辑：{asset.title}
        </p>
      </div>
      <AssetForm asset={asset} isEditing />
    </div>
  );
}
