"use client";

import { useRef, useState } from "react";

import { createCaptureInboxItemAction } from "@/app/inbox/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FieldErrors = Record<string, string[] | undefined>;

export function CaptureInboxForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function fieldError(name: string) {
    return fieldErrors[name]?.[0];
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setFieldErrors({});
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await createCaptureInboxItemAction(formData);
      if (result.success) {
        formRef.current?.reset();
        setSuccessMessage("已写入 capture inbox。");
        return;
      }

      if (!result.success) {
        setError(result.error ?? "保存失败");
        return;
      }
    } catch {
      setError("发生了意外错误");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-5">
      {error ? (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      {successMessage ? (
        <div className="rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="title">标题 *</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={200}
          placeholder="例如：Codex 里反复使用的重构提示词"
          aria-invalid={!!fieldError("title")}
        />
        {fieldError("title") ? (
          <p className="text-sm text-destructive">{fieldError("title")}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="rawContent">原始内容 *</Label>
        <Textarea
          id="rawContent"
          name="rawContent"
          required
          rows={12}
          maxLength={50000}
          placeholder="把对话片段、草稿提示词、临时规则或工作流直接粘贴到这里。"
          aria-invalid={!!fieldError("rawContent")}
        />
        {fieldError("rawContent") ? (
          <p className="text-sm text-destructive">{fieldError("rawContent")}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            当前只保存原始材料，不会自动生成资产。
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sourcePath">来源路径</Label>
          <Input
            id="sourcePath"
            name="sourcePath"
            maxLength={1000}
            placeholder="/absolute/path/to/local/file"
            aria-invalid={!!fieldError("sourcePath")}
          />
          {fieldError("sourcePath") ? (
            <p className="text-sm text-destructive">{fieldError("sourcePath")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sourceTimestamp">来源时间</Label>
          <Input
            id="sourceTimestamp"
            name="sourceTimestamp"
            type="datetime-local"
            aria-invalid={!!fieldError("sourceTimestamp")}
          />
          {fieldError("sourceTimestamp") ? (
            <p className="text-sm text-destructive">
              {fieldError("sourceTimestamp")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="extractionNote">提取说明</Label>
        <Textarea
          id="extractionNote"
          name="extractionNote"
          rows={3}
          maxLength={2000}
          placeholder="记录为什么值得保留，或后续准备怎么整理。"
          aria-invalid={!!fieldError("extractionNote")}
        />
        {fieldError("extractionNote") ? (
          <p className="text-sm text-destructive">{fieldError("extractionNote")}</p>
        ) : null}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "保存中..." : "保存到 Inbox"}
        </Button>
      </div>
    </form>
  );
}
