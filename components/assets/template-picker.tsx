"use client";

import { useEffect, useRef } from "react";
import { X, FileText, Sparkles, MessageSquare, Image, GitBranch, ClipboardCheck, ListChecks, Reply } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BUILTIN_TEMPLATES, type BuiltinTemplate } from "@/lib/templates/builtin-templates";
import { ASSET_TYPE_LABELS, type AssetType } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface TemplatePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (template: BuiltinTemplate) => void;
}

const TYPE_ICONS: Record<AssetType, React.ElementType> = {
  agent_skill: Sparkles,
  system_rule: FileText,
  chat_prompt: MessageSquare,
  image_prompt: Image,
  workflow: GitBranch,
  sop: ClipboardCheck,
  checklist: ListChecks,
  reply_template: Reply,
  reference: FileText,
};

const TYPE_BADGE_VARIANTS: Record<AssetType, "default" | "secondary" | "outline"> = {
  agent_skill: "default",
  system_rule: "secondary",
  chat_prompt: "default",
  image_prompt: "secondary",
  workflow: "outline",
  sop: "outline",
  checklist: "outline",
  reply_template: "secondary",
  reference: "outline",
};

export function TemplatePicker({ open, onOpenChange, onSelect }: TemplatePickerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const templatesByType = BUILTIN_TEMPLATES.reduce<Record<AssetType, BuiltinTemplate[]>>((acc, t) => {
    if (!acc[t.type]) acc[t.type] = [];
    acc[t.type].push(t);
    return acc;
  }, {} as Record<AssetType, BuiltinTemplate[]>);

  return (
    <div className="fixed inset-0 z-50">
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/80 animate-in fade-in-0"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 border bg-background p-6 shadow-lg animate-in fade-in-0 zoom-in-95 sm:rounded-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">从模板创建</h2>
            <p className="text-sm text-muted-foreground">选择一个内置模板快速开始</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {Object.entries(templatesByType).map(([type, templates]) => {
            const Icon = TYPE_ICONS[type as AssetType];
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{ASSET_TYPE_LABELS[type as AssetType]}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => {
                        onSelect(template);
                        onOpenChange(false);
                      }}
                      className={cn(
                        "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
                        "hover:bg-accent hover:border-accent-foreground/20",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      )}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className="font-medium text-sm">{template.name}</span>
                        <Badge variant={TYPE_BADGE_VARIANTS[template.type]} className="text-[10px] px-1.5 py-0">
                          {ASSET_TYPE_LABELS[template.type]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
