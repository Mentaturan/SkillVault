"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, ChevronDown, Check } from "lucide-react";
import {
  EXPORT_PRESETS,
  EXPORT_PRESET_LABELS,
  type ExportPreset,
} from "@/lib/constants";

interface BatchExportButtonProps {
  assetIds: string[];
}

export function BatchExportButton({ assetIds }: BatchExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<ExportPreset>("general_markdown");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (assetIds.length === 0) return null;

  const exportUrl = `/api/assets/batch-export?ids=${assetIds.join(",")}&preset=${selectedPreset}`;

  return (
    <div className="relative inline-flex" ref={ref}>
      <Button variant="outline" asChild>
        <a href={exportUrl}>
          <Download className="mr-2 h-4 w-4" />
          批量导出 ({assetIds.length})
        </a>
      </Button>
      <Button
        variant="outline"
        className="ml-px rounded-l-none border-l-0 px-2"
        onClick={() => setOpen((v) => !v)}
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-md border bg-popover p-1 shadow-lg">
          {EXPORT_PRESETS.map((preset) => (
            <button
              key={preset}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                setSelectedPreset(preset);
                setOpen(false);
              }}
            >
              <span className="w-4">
                {selectedPreset === preset && <Check className="h-4 w-4" />}
              </span>
              {EXPORT_PRESET_LABELS[preset]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
