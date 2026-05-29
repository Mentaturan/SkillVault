"use client";

import { useState } from "react";
import { LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssetForm } from "@/components/assets/asset-form";
import { TemplatePicker } from "@/components/assets/template-picker";
import type { BuiltinTemplate } from "@/lib/templates/builtin-templates";

interface TemplateInitialValues {
  title: string;
  type: string;
  targetTool: string;
  exportPreset: string;
  description: string;
  scenario: string;
  content: string;
}

export default function NewAssetPage() {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [initialValues, setInitialValues] = useState<TemplateInitialValues | undefined>();
  const [formKey, setFormKey] = useState(0);

  function handleSelect(template: BuiltinTemplate) {
    setInitialValues({
      title: template.name,
      type: template.type,
      targetTool: template.targetTool,
      exportPreset: template.exportPreset,
      description: template.description,
      scenario: template.scenario,
      content: template.content,
    });
    setFormKey((k) => k + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">新建资产</h1>
          <p className="text-sm text-muted-foreground">
            创建一个新的 AI 工作流资产
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
          <LayoutTemplate className="mr-2 h-4 w-4" />
          从模板创建
        </Button>
      </div>
      <AssetForm key={formKey} initialValues={initialValues} />
      <TemplatePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleSelect}
      />
    </div>
  );
}
