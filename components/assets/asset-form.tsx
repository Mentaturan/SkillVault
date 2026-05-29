"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
} from "@/lib/constants";
import type { Asset, Tag } from "@/db/schema";

interface AssetFormProps {
  asset?: Asset & { assetTags?: { tag: Tag }[] };
  isEditing?: boolean;
}

export function AssetForm({ asset, isEditing = false }: AssetFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingTags =
    asset?.assetTags?.map((at) => at.tag.name).join(", ") ?? "";

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      const result =
        isEditing && asset
          ? await updateAssetAction(asset.id, formData)
          : await createAssetAction(formData);

      if (result.success) {
        router.push("/assets");
        router.refresh();
      } else {
        setError("Failed to save asset");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          name="title"
          defaultValue={asset?.title}
          required
          maxLength={200}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <Select
            name="type"
            defaultValue={asset?.type ?? DEFAULT_ASSET_VALUES.type}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSET_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetTool">Target Tool *</Label>
          <Select
            name="targetTool"
            defaultValue={
              asset?.targetTool ?? DEFAULT_ASSET_VALUES.targetTool
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TARGET_TOOLS.map((tool) => (
                <SelectItem key={tool} value={tool}>
                  {tool.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="exportPreset">Export Preset *</Label>
          <Select
            name="exportPreset"
            defaultValue={
              asset?.exportPreset ?? DEFAULT_ASSET_VALUES.exportPreset
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPORT_PRESETS.map((preset) => (
                <SelectItem key={preset} value={preset}>
                  {preset.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
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
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="visibility">Visibility</Label>
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
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
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
                  {s.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={asset?.description ?? ""}
          rows={3}
          maxLength={2000}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scenario">Scenario</Label>
        <Textarea
          id="scenario"
          name="scenario"
          defaultValue={asset?.scenario ?? ""}
          rows={3}
          maxLength={2000}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          name="content"
          defaultValue={asset?.content}
          required
          rows={10}
          className="font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tagNames">Tags (comma-separated)</Label>
        <Input
          id="tagNames"
          name="tagNames"
          defaultValue={existingTags}
          placeholder="tag1, tag2, tag3"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sourceUrl">Source URL</Label>
        <Input
          id="sourceUrl"
          name="sourceUrl"
          type="url"
          defaultValue={asset?.sourceUrl ?? ""}
          maxLength={500}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="pinned"
          name="pinned"
          value="true"
          defaultChecked={asset?.pinned ?? false}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="pinned">Pin this asset</Label>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : isEditing
              ? "Update Asset"
              : "Create Asset"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
