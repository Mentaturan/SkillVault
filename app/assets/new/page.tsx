import { AssetForm } from "@/components/assets/asset-form";

export default function NewAssetPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">新建资产</h1>
        <p className="text-sm text-muted-foreground">
          创建一个新的 AI 工作流资产
        </p>
      </div>
      <AssetForm />
    </div>
  );
}
