import { AssetForm } from "@/components/assets/asset-form";

export default function NewAssetPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New Asset</h1>
        <p className="text-sm text-muted-foreground">
          Create a new AI workflow asset
        </p>
      </div>
      <AssetForm />
    </div>
  );
}
