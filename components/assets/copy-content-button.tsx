"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy } from "lucide-react";

import { recordAssetUseAction } from "@/app/assets/actions";
import { Button } from "@/components/ui/button";

interface CopyContentButtonProps {
  assetId?: string;
  content: string;
  label?: string;
  copiedLabel?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "icon";
}

export function CopyContentButton({
  assetId,
  content,
  label = "复制原文",
  copiedLabel = "已复制",
  variant = "outline",
  size = "sm",
}: CopyContentButtonProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      if (assetId) {
        void recordAssetUseAction({ assetId, kind: "raw_copy" }).then((result) => {
          if (result.success) {
            router.refresh();
          }
        });
      }
      setCopyError(false);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopyError(true);
      window.setTimeout(() => setCopyError(false), 2000);
    }
  }

  return (
    <Button type="button" variant={variant} size={size} onClick={handleCopy}>
      {copyError ? (
        <Copy className="h-4 w-4" />
      ) : copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {copyError ? "复制失败" : copied ? copiedLabel : label}
    </Button>
  );
}
