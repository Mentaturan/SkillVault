"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  previewBatchArchiveAction,
  executeBatchArchiveAction,
  previewBatchRetagAction,
  executeBatchRetagAction,
  previewBatchRateAction,
  executeBatchRateAction,
  previewBatchReviewDateAction,
  executeBatchReviewDateAction,
} from "@/app/assets/maintenance/actions";
import { ASSET_STATUS_LABELS, RATING_MIN, RATING_MAX } from "@/lib/constants";

interface BatchArchiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetIds: string[];
  onComplete: () => void;
}

export function BatchArchiveDialog({ open, onOpenChange, assetIds, onComplete }: BatchArchiveDialogProps) {
  const [preview, setPreview] = useState<{ id: string; title: string; status: string }[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [executing, startExecute] = useTransition();
  const router = useRouter();

  function handleOpenChange(val: boolean) {
    if (!val) {
      setPreview(null);
      setLoading(false);
    }
    onOpenChange(val);
  }

  async function loadPreview() {
    setLoading(true);
    const result = await previewBatchArchiveAction(assetIds);
    if (result.success) {
      setPreview(result.items);
    }
    setLoading(false);
  }

  function handleConfirm() {
    startExecute(async () => {
      await executeBatchArchiveAction(assetIds);
      setPreview(null);
      onOpenChange(false);
      onComplete();
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>批量归档</AlertDialogTitle>
          <AlertDialogDescription>
            将 {assetIds.length} 个资产标记为已归档状态。
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!preview && (
          <Button onClick={loadPreview} disabled={loading} variant="outline" size="sm">
            {loading ? "加载中..." : "预览变更"}
          </Button>
        )}

        {preview && (
          <div className="space-y-2">
            <p className="text-sm font-medium">将归档以下资产：</p>
            <ul className="space-y-1 text-sm">
              {preview.map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded border px-2 py-1">
                  <span className="truncate">{item.title}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {ASSET_STATUS_LABELS[item.status as keyof typeof ASSET_STATUS_LABELS]} → 已归档
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!preview || executing}
          >
            {executing ? "执行中..." : "确认归档"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface BatchRetagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetIds: string[];
  onComplete: () => void;
}

export function BatchRetagDialog({ open, onOpenChange, assetIds, onComplete }: BatchRetagDialogProps) {
  const [addTags, setAddTags] = useState("");
  const [removeTags, setRemoveTags] = useState("");
  const [preview, setPreview] = useState<{ id: string; title: string; currentTags: string[]; afterTags: string[] }[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [executing, startExecute] = useTransition();
  const router = useRouter();

  function handleOpenChange(val: boolean) {
    if (!val) {
      setPreview(null);
      setAddTags("");
      setRemoveTags("");
      setLoading(false);
    }
    onOpenChange(val);
  }

  function parseTags(input: string): string[] {
    return input.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
  }

  async function loadPreview() {
    const addTagNames = parseTags(addTags);
    const removeTagNames = parseTags(removeTags);
    if (addTagNames.length === 0 && removeTagNames.length === 0) return;
    setLoading(true);
    const result = await previewBatchRetagAction(assetIds, addTagNames, removeTagNames);
    if (result.success) {
      setPreview(result.items);
    }
    setLoading(false);
  }

  function handleConfirm() {
    const addTagNames = parseTags(addTags);
    const removeTagNames = parseTags(removeTags);
    startExecute(async () => {
      await executeBatchRetagAction(assetIds, addTagNames, removeTagNames);
      setPreview(null);
      onOpenChange(false);
      onComplete();
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>批量重标</AlertDialogTitle>
          <AlertDialogDescription>
            为 {assetIds.length} 个资产添加或移除标签。
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>添加标签（逗号分隔）</Label>
            <Input
              value={addTags}
              onChange={(e) => setAddTags(e.target.value)}
              placeholder="tag1, tag2"
            />
          </div>
          <div className="space-y-1.5">
            <Label>移除标签（逗号分隔）</Label>
            <Input
              value={removeTags}
              onChange={(e) => setRemoveTags(e.target.value)}
              placeholder="tag3, tag4"
            />
          </div>
          <Button onClick={loadPreview} disabled={loading || (!addTags && !removeTags)} variant="outline" size="sm">
            {loading ? "加载中..." : "预览变更"}
          </Button>
        </div>

        {preview && (
          <div className="space-y-2">
            <p className="text-sm font-medium">标签变更预览：</p>
            <ul className="space-y-1 text-sm">
              {preview.map((item) => (
                <li key={item.id} className="rounded border px-2 py-1">
                  <span className="font-medium">{item.title}</span>
                  <div className="mt-0.5 text-muted-foreground">
                    <span>{item.currentTags.join(", ") || "无标签"}</span>
                    <span className="mx-1">→</span>
                    <span>{item.afterTags.join(", ") || "无标签"}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!preview || executing}
          >
            {executing ? "执行中..." : "确认重标"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface BatchRateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetIds: string[];
  onComplete: () => void;
}

export function BatchRateDialog({ open, onOpenChange, assetIds, onComplete }: BatchRateDialogProps) {
  const [rating, setRating] = useState<string>("3");
  const [preview, setPreview] = useState<{ id: string; title: string; currentRating: number | null; proposedRating: number }[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [executing, startExecute] = useTransition();
  const router = useRouter();

  function handleOpenChange(val: boolean) {
    if (!val) {
      setPreview(null);
      setRating("3");
      setLoading(false);
    }
    onOpenChange(val);
  }

  async function loadPreview() {
    const r = parseInt(rating, 10);
    if (isNaN(r) || r < RATING_MIN || r > RATING_MAX) return;
    setLoading(true);
    const result = await previewBatchRateAction(assetIds, r);
    if (result.success) {
      setPreview(result.items);
    }
    setLoading(false);
  }

  function handleConfirm() {
    const r = parseInt(rating, 10);
    startExecute(async () => {
      await executeBatchRateAction(assetIds, r);
      setPreview(null);
      onOpenChange(false);
      onComplete();
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>批量评分</AlertDialogTitle>
          <AlertDialogDescription>
            为 {assetIds.length} 个资产设置评分。
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>评分</Label>
            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: RATING_MAX - RATING_MIN + 1 }, (_, i) => RATING_MIN + i).map((v) => (
                  <SelectItem key={v} value={String(v)}>
                    {"★".repeat(v)}{"☆".repeat(RATING_MAX - v)} {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={loadPreview} disabled={loading} variant="outline" size="sm">
            {loading ? "加载中..." : "预览变更"}
          </Button>
        </div>

        {preview && (
          <div className="space-y-2">
            <p className="text-sm font-medium">评分变更预览：</p>
            <ul className="space-y-1 text-sm">
              {preview.map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded border px-2 py-1">
                  <span className="truncate">{item.title}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {item.currentRating ?? "未评分"} → {item.proposedRating}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!preview || executing}
          >
            {executing ? "执行中..." : "确认评分"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface BatchReviewDateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetIds: string[];
  onComplete: () => void;
}

export function BatchReviewDateDialog({ open, onOpenChange, assetIds, onComplete }: BatchReviewDateDialogProps) {
  const [dateValue, setDateValue] = useState("");
  const [clearDate, setClearDate] = useState(false);
  const [preview, setPreview] = useState<{ id: string; title: string; currentReviewDueAt: number | null; proposedReviewDueAt: number | null }[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [executing, startExecute] = useTransition();
  const router = useRouter();

  function handleOpenChange(val: boolean) {
    if (!val) {
      setPreview(null);
      setDateValue("");
      setClearDate(false);
      setLoading(false);
    }
    onOpenChange(val);
  }

  function getReviewDueAt(): number | null {
    if (clearDate) return null;
    if (!dateValue) return null;
    return new Date(dateValue).getTime();
  }

  async function loadPreview() {
    const reviewDueAt = getReviewDueAt();
    if (!clearDate && !dateValue) return;
    setLoading(true);
    const result = await previewBatchReviewDateAction(assetIds, reviewDueAt);
    if (result.success) {
      setPreview(result.items);
    }
    setLoading(false);
  }

  function handleConfirm() {
    const reviewDueAt = getReviewDueAt();
    startExecute(async () => {
      await executeBatchReviewDateAction(assetIds, reviewDueAt);
      setPreview(null);
      onOpenChange(false);
      onComplete();
      router.refresh();
    });
  }

  function formatDate(ts: number | null) {
    if (ts === null) return "未设置";
    return new Date(ts).toLocaleDateString("zh-CN");
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>批量设置复查日期</AlertDialogTitle>
          <AlertDialogDescription>
            为 {assetIds.length} 个资产设置复查到期日期。
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="clearDate"
              checked={clearDate}
              onCheckedChange={(checked) => setClearDate(checked === true)}
            />
            <label htmlFor="clearDate" className="text-sm leading-none">
              清除复查日期
            </label>
          </div>
          {!clearDate && (
            <div className="space-y-1.5">
              <Label>复查日期</Label>
              <Input
                type="date"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
              />
            </div>
          )}
          <Button onClick={loadPreview} disabled={loading || (!clearDate && !dateValue)} variant="outline" size="sm">
            {loading ? "加载中..." : "预览变更"}
          </Button>
        </div>

        {preview && (
          <div className="space-y-2">
            <p className="text-sm font-medium">复查日期变更预览：</p>
            <ul className="space-y-1 text-sm">
              {preview.map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded border px-2 py-1">
                  <span className="truncate">{item.title}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {formatDate(item.currentReviewDueAt)} → {formatDate(item.proposedReviewDueAt)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!preview || executing}
          >
            {executing ? "执行中..." : "确认设置"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
