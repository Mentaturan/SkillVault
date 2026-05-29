"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, FileText } from "lucide-react";

interface MarkdownInputProps {
  onMarkdownChange: (markdown: string) => void;
}

export function MarkdownInput({ onMarkdownChange }: MarkdownInputProps) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleTextChange(value: string) {
    setText(value);
    setFileName(null);
    onMarkdownChange(value);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".md") && !file.name.endsWith(".markdown")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content);
      setFileName(file.name);
      onMarkdownChange(content);
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Markdown 内容</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            上传文件
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {fileName && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          {fileName}
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder="粘贴 Markdown 内容，或上传 .md 文件&#10;&#10;支持带 YAML frontmatter 的 Markdown：&#10;---&#10;title: 我的资产&#10;type: chat_prompt&#10;---&#10;&#10;资产正文内容..."
        className="min-h-[240px] w-full rounded-md border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
