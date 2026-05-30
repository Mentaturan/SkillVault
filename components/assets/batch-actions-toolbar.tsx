"use client";

import { Archive, Tag, Star, CalendarClock, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAssetSelect } from "@/components/assets/asset-select-provider";
import {
  BatchArchiveDialog,
  BatchRetagDialog,
  BatchRateDialog,
  BatchReviewDateDialog,
} from "@/components/assets/batch-action-dialogs";
import { useState } from "react";

type DialogType = "archive" | "retag" | "rate" | "review_date" | null;

export function BatchActionsToolbar({ allAssetIds }: { allAssetIds: string[] }) {
  const { selectedIds, clearSelection, selectAll } = useAssetSelect();
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);

  if (selectedIds.size === 0) return null;

  const selectedArray = Array.from(selectedIds);

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center gap-3 rounded-md border bg-muted/80 px-4 py-2 backdrop-blur-sm">
        <span className="text-sm font-medium">
          已选 {selectedIds.size} 项
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => selectAll(allAssetIds)}
        >
          全选
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearSelection}
        >
          <X className="mr-1 h-3 w-3" />
          取消选择
        </Button>
        <div className="mx-2 h-4 w-px bg-border" />
        <Button variant="outline" size="sm" onClick={() => setActiveDialog("archive")}>
          <Archive className="mr-1 h-3 w-3" />
          归档
        </Button>
        <Button variant="outline" size="sm" onClick={() => setActiveDialog("retag")}>
          <Tag className="mr-1 h-3 w-3" />
          重标
        </Button>
        <Button variant="outline" size="sm" onClick={() => setActiveDialog("rate")}>
          <Star className="mr-1 h-3 w-3" />
          评分
        </Button>
        <Button variant="outline" size="sm" onClick={() => setActiveDialog("review_date")}>
          <CalendarClock className="mr-1 h-3 w-3" />
          复查日期
        </Button>
      </div>

      <BatchArchiveDialog
        open={activeDialog === "archive"}
        onOpenChange={(open) => { if (!open) setActiveDialog(null); }}
        assetIds={selectedArray}
        onComplete={clearSelection}
      />
      <BatchRetagDialog
        open={activeDialog === "retag"}
        onOpenChange={(open) => { if (!open) setActiveDialog(null); }}
        assetIds={selectedArray}
        onComplete={clearSelection}
      />
      <BatchRateDialog
        open={activeDialog === "rate"}
        onOpenChange={(open) => { if (!open) setActiveDialog(null); }}
        assetIds={selectedArray}
        onComplete={clearSelection}
      />
      <BatchReviewDateDialog
        open={activeDialog === "review_date"}
        onOpenChange={(open) => { if (!open) setActiveDialog(null); }}
        assetIds={selectedArray}
        onComplete={clearSelection}
      />
    </>
  );
}
