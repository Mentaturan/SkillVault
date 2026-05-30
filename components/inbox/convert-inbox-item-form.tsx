"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { convertCaptureInboxItemToAssetAction } from "@/app/inbox/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ASSET_STATUSES,
  ASSET_STATUS_LABELS,
  ASSET_TYPES,
  ASSET_TYPE_LABELS,
  DEFAULT_ASSET_VALUES,
  EXPORT_PRESETS,
  EXPORT_PRESET_LABELS,
  TARGET_TOOLS,
  TARGET_TOOL_LABELS,
  VISIBILITIES,
  VISIBILITY_LABELS,
} from "@/lib/constants";
import type { CaptureInboxItem } from "@/db/schema";

type FieldErrors = Record<string, string[] | undefined>;

export function ConvertInboxItemForm({ item }: { item: CaptureInboxItem }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);

  function fieldError(name: string) {
    return fieldErrors[name]?.[0];
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setFieldErrors({});
    setError(null);

    try {
      const result = await convertCaptureInboxItemToAssetAction(item.id, formData);
      if (result.success && result.assetId) {
        router.push(`/assets/${result.assetId}`);
        router.refresh();
        return;
      }

      if (result.error && typeof result.error === "object") {
        setFieldErrors(result.error as FieldErrors);
        setError("请检查表单中的错误");
        return;
      }

      setError(typeof result.error === "string" ? result.error : "转换失败");
    } catch {
      setError("发生了意外错误");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {error ? (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="title">资产标题 *</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={200}
          defaultValue={item.title}
          aria-invalid={!!fieldError("title")}
        />
        {fieldError("title") ? (
          <p className="text-sm text-destructive">{fieldError("title")}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">类型 *</Label>
          <Select name="type" defaultValue={DEFAULT_ASSET_VALUES.type}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSET_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {ASSET_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetTool">目标工具 *</Label>
          <Select name="targetTool" defaultValue={DEFAULT_ASSET_VALUES.targetTool}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TARGET_TOOLS.map((tool) => (
                <SelectItem key={tool} value={tool}>
                  {TARGET_TOOL_LABELS[tool]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="exportPreset">导出预设 *</Label>
          <Select
            name="exportPreset"
            defaultValue={DEFAULT_ASSET_VALUES.exportPreset}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPORT_PRESETS.map((preset) => (
                <SelectItem key={preset} value={preset}>
                  {EXPORT_PRESET_LABELS[preset]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">状态</Label>
          <Select name="status" defaultValue={DEFAULT_ASSET_VALUES.status}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSET_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {ASSET_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="visibility">可见性</Label>
          <Select
            name="visibility"
            defaultValue={DEFAULT_ASSET_VALUES.visibility}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VISIBILITIES.map((visibility) => (
                <SelectItem key={visibility} value={visibility}>
                  {VISIBILITY_LABELS[visibility]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">描述</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          maxLength={2000}
          defaultValue={item.extractionNote ?? ""}
          placeholder="概述这条资产的用途，不默认复制原始材料。"
          aria-invalid={!!fieldError("description")}
        />
        {fieldError("description") ? (
          <p className="text-sm text-destructive">{fieldError("description")}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="scenario">使用场景</Label>
        <Textarea
          id="scenario"
          name="scenario"
          rows={3}
          maxLength={2000}
          placeholder="说明这条资产适合在什么场景下复用。"
          aria-invalid={!!fieldError("scenario")}
        />
        {fieldError("scenario") ? (
          <p className="text-sm text-destructive">{fieldError("scenario")}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">资产内容 *</Label>
        <Textarea
          id="content"
          name="content"
          required
          rows={12}
          placeholder="这里默认留空。只有你明确整理、摘录或改写后，内容才会进入正式资产。"
          aria-invalid={!!fieldError("content")}
        />
        {fieldError("content") ? (
          <p className="text-sm text-destructive">{fieldError("content")}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            原始材料仍保留在 Inbox，不会自动复制到资产正文。
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "转换中..." : "创建资产"}
        </Button>
      </div>
    </form>
  );
}
