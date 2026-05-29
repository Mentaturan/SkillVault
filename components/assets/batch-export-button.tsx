"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface BatchExportButtonProps {
  assetIds: string[];
}

export function BatchExportButton({ assetIds }: BatchExportButtonProps) {
  if (assetIds.length === 0) return null;

  const exportUrl = `/api/assets/batch-export?ids=${assetIds.join(",")}`;

  return (
    <Button variant="outline" asChild>
      <a href={exportUrl}>
        <Download className="mr-2 h-4 w-4" />
        批量导出 ({assetIds.length})
      </a>
    </Button>
  );
}
