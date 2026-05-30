"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAssetAction, updateAssetAction } from "@/app/assets/actions";
import {
  ASSET_TYPES,
  TARGET_TOOLS,
  EXPORT_PRESETS,
  ASSET_STATUSES,
  ASSET_SOURCES,
  VISIBILITIES,
  DEFAULT_ASSET_VALUES,
  ASSET_SOURCE_LABELS,
  ASSET_STATUS_LABELS,
  ASSET_TYPE_LABELS,
  EXPORT_PRESET_LABELS,
  TARGET_TOOL_LABELS,
  VISIBILITY_LABELS,
} from "@/lib/constants";
import type { Asset, Tag } from "@/db/schema";

type FieldErrors = Record<string, string[] | undefined>;

interface InitialValues {
  title?: string;
  type?: string;
  targetTool?: string;
  exportPreset?: string;
  description?: string;
  scenario?: string;
  content?: string;
}

function formatDateInputValue(timestamp?: number | null) {
  if (!timestamp) {
    return "";
  }

  return new Date(timestamp).toISOString().slice(0, 10);
}

interface AssetFormProps {
  asset?: Asset & { assetTags?: { tag: Tag }[] };
  isEditing?: boolean;
  initialValues?: InitialValues;
}

export function AssetForm({ asset, isEditing = false, initialValues }: AssetFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const existingTags =
    asset?.assetTags?.map((at) => at.tag.name).join(", ") ?? "";

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const result =
        isEditing && asset
          ? await updateAssetAction(asset.id, formData)
          : await createAssetAction(formData);

      if (result.success) {
        router.push("/assets");
        router.refresh();
      } else {
        setError(
          typeof result.error === "string"
            ? result.error
            : "保存资产失败",
        );
      }
    } catch {
      setError("发生了意外错误");
    } finally {
      setIsSubmitting(false);
    }
  }

  function fieldError(name: string): string | undefined {
    const messages = fieldErrors[name];
    return messages?.[0];
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">标题 *</Label>
        <Input
          id="title"
          name="title"
          defaultValue={asset?.title ?? initialValues?.title}
          required
          maxLength={200}
          aria-invalid={!!fieldError("title")}
        />
        {fieldError("title") && (
          <p className="text-sm text-destructive">{fieldError("title")}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">类型 *</Label>
          <Select
            name="type"
            defaultValue={asset?.type ?? initialValues?.type ?? DEFAULT_ASSET_VALUES.type}
          >
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
          {fieldError("type") && (
            <p className="text-sm text-destructive">{fieldError("type")}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetTool">目标工具 *</Label>
          <Select
            name="targetTool"
            defaultValue={
              asset?.targetTool ?? initialValues?.targetTool ?? DEFAULT_ASSET_VALUES.targetTool
            }
          >
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
          {fieldError("targetTool") && (
            <p className="text-sm text-destructive">{fieldError("targetTool")}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="exportPreset">导出预设 *</Label>
          <Select
            name="exportPreset"
            defaultValue={
              asset?.exportPreset ?? initialValues?.exportPreset ?? DEFAULT_ASSET_VALUES.exportPreset
            }
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
          {fieldError("exportPreset") && (
            <p className="text-sm text-destructive">{fieldError("exportPreset")}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">状态</Label>
          <Select
            name="status"
            defaultValue={asset?.status ?? DEFAULT_ASSET_VALUES.status}
          >
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

        <div className="space-y-2">
          <Label htmlFor="visibility">可见性</Label>
          <Select
            name="visibility"
            defaultValue={
              asset?.visibility ?? DEFAULT_ASSET_VALUES.visibility
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VISIBILITIES.map((v) => (
                <SelectItem key={v} value={v}>
                  {VISIBILITY_LABELS[v]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="source">来源</Label>
          <Select
            name="source"
            defaultValue={asset?.source ?? DEFAULT_ASSET_VALUES.source}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSET_SOURCES.map((s) => (
                <SelectItem key={s} value={s}>
                  {ASSET_SOURCE_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reviewDueAt">复查截止日</Label>
          <Input
            id="reviewDueAt"
            name="reviewDueAt"
            type="date"
            defaultValue={formatDateInputValue(asset?.reviewDueAt)}
          />
          {fieldError("reviewDueAt") && (
            <p className="text-sm text-destructive">{fieldError("reviewDueAt")}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">描述</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={asset?.description ?? initialValues?.description ?? ""}
          rows={3}
          maxLength={2000}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scenario">使用场景</Label>
        <Textarea
          id="scenario"
          name="scenario"
          defaultValue={asset?.scenario ?? initialValues?.scenario ?? ""}
          rows={3}
          maxLength={2000}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">内容 *</Label>
        <Textarea
          id="content"
          name="content"
          defaultValue={asset?.content ?? initialValues?.content}
          required
          rows={10}
          className="font-mono"
          aria-invalid={!!fieldError("content")}
        />
        {fieldError("content") && (
          <p className="text-sm text-destructive">{fieldError("content")}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tagNames">标签（用逗号分隔）</Label>
        <Input
          id="tagNames"
          name="tagNames"
          defaultValue={existingTags}
          placeholder="标签1, 标签2, 标签3"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sourceUrl">来源链接</Label>
        <Input
          id="sourceUrl"
          name="sourceUrl"
          type="url"
          defaultValue={asset?.sourceUrl ?? ""}
          maxLength={500}
          aria-invalid={!!fieldError("sourceUrl")}
        />
        {fieldError("sourceUrl") && (
          <p className="text-sm text-destructive">{fieldError("sourceUrl")}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="pinned"
          name="pinned"
          value="true"
          defaultChecked={asset?.pinned ?? false}
        />
        <Label htmlFor="pinned">置顶这个资产</Label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting
            ? "保存中..."
            : isEditing
              ? "更新资产"
              : "创建资产"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
          取消
        </Button>
      </div>
    </form>
  );
}
