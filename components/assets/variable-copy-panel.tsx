"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy } from "lucide-react";

import { recordAssetUseAction } from "@/app/assets/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMissingVariables, renderVariables } from "@/lib/variables";

interface VariableCopyPanelProps {
  assetId?: string;
  content: string;
  variables: string[];
}

export function VariableCopyPanel({
  assetId,
  content,
  variables,
}: VariableCopyPanelProps) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const missingVariables = useMemo(
    () => getMissingVariables(variables, values),
    [variables, values],
  );

  if (variables.length === 0) {
    return null;
  }

  async function handleCopy() {
    if (missingVariables.length > 0) {
      return;
    }

    try {
      await navigator.clipboard.writeText(renderVariables(content, values));
      if (assetId) {
        void recordAssetUseAction({ assetId, kind: "rendered_copy" }).then((result) => {
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
    <div className="space-y-3 rounded-md border bg-background p-4">
      <div>
        <h2 className="text-sm font-medium">变量填充复制</h2>
        <p className="text-sm text-muted-foreground">
          填写所有变量后复制渲染结果。
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {variables.map((name) => (
          <div key={name} className="space-y-1.5">
            <Label htmlFor={`variable-${name}`}>{name}</Label>
            <Input
              id={`variable-${name}`}
              value={values[name] ?? ""}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [name]: event.target.value,
                }))
              }
            />
          </div>
        ))}
      </div>

      {missingVariables.length > 0 && (
        <p className="text-sm text-destructive">
          缺少变量：{missingVariables.join(", ")}
        </p>
      )}

      <Button
        type="button"
        variant="secondary"
        onClick={handleCopy}
        disabled={missingVariables.length > 0}
      >
        {copyError ? (
          <Copy className="h-4 w-4" />
        ) : copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        {copyError ? "复制失败" : copied ? "已复制" : "复制渲染内容"}
      </Button>
    </div>
  );
}
