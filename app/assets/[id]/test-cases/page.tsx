import { getTestCasesByAssetId } from "@/server/services/test-case-service";
import { getAssetById } from "@/server/services/asset-service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TestCaseListClient } from "@/components/test-cases/test-case-list-client";
import { ArrowLeft } from "lucide-react";

interface TestCasesPageProps {
  params: Promise<{ id: string }>;
}

export default async function TestCasesPage({ params }: TestCasesPageProps) {
  const { id } = await params;
  const asset = await getAssetById(id);
  if (!asset) notFound();

  const testCases = await getTestCasesByAssetId(id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/assets/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">测试用例 - {asset.title}</h1>
        </div>
      </div>

      <TestCaseListClient assetId={id} testCases={testCases} />
    </div>
  );
}
