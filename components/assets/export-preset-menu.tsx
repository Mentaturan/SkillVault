"use client";

import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXPORT_PRESETS, EXPORT_PRESET_LABELS } from "@/lib/constants";

interface ExportPresetMenuProps {
  assetId: string;
  currentPreset: string;
}

export function ExportPresetMenu({
  assetId,
  currentPreset,
}: ExportPresetMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <Button variant="outline" size="sm" onClick={() => setOpen(!open)}>
        <Download className="h-4 w-4 mr-1" />
        导出
        <ChevronDown className="h-3 w-3 ml-1" />
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 min-w-[180px] rounded-md border bg-popover p-1 shadow-lg">
          {EXPORT_PRESETS.map((preset) => (
            <a
              key={preset}
              href={`/api/assets/${assetId}/export/${preset}`}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground text-left"
              onClick={() => setOpen(false)}
            >
              <span className="w-4 shrink-0">
                {currentPreset === preset && (
                  <Check className="h-4 w-4" />
                )}
              </span>
              {EXPORT_PRESET_LABELS[preset]}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
