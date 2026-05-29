"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMissingVariables, renderVariables } from "@/lib/variables";

interface VariableCopyPanelProps {
  content: string;
  variables: string[];
}

export function VariableCopyPanel({ content, variables }: VariableCopyPanelProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
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

    await navigator.clipboard.writeText(renderVariables(content, values));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
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
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "已复制" : "复制渲染内容"}
      </Button>
    </div>
  );
}
