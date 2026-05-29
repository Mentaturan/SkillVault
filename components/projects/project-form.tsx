"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search } from "lucide-react";
import { createProjectAction, updateProjectAction } from "@/app/projects/actions";

interface ProjectFormProps {
  project?: {
    id: string;
    name: string;
    description: string | null;
    path: string | null;
    icon: string | null;
    color: string | null;
  };
}

export function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<Array<{ path: string; name: string; type: string; size: number }> | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const action = project ? updateProjectAction : createProjectAction;
    const result = await action(formData);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/projects");
    router.refresh();
  }

  async function handleScan() {
    const pathInput = document.getElementById("path") as HTMLInputElement;
    const dirPath = pathInput?.value;
    if (!dirPath) return;

    setScanning(true);
    setScanResults(null);

    try {
      const res = await fetch(`/api/scan-directory?path=${encodeURIComponent(dirPath)}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setScanResults(data.files);
      }
    } catch {
      setError("扫描失败");
    } finally {
      setScanning(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {project && <input type="hidden" name="id" value={project.id} />}

      <div className="space-y-2">
        <Label htmlFor="name">名称 *</Label>
        <Input id="name" name="name" defaultValue={project?.name ?? ""} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">描述</Label>
        <Textarea id="description" name="description" defaultValue={project?.description ?? ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="path">项目路径</Label>
        <div className="flex gap-2">
          <Input id="path" name="path" defaultValue={project?.path ?? ""} placeholder="/path/to/project" />
          <Button type="button" variant="outline" onClick={handleScan} disabled={scanning}>
            <Search className="mr-1 h-4 w-4" />
            {scanning ? "扫描中..." : "扫描"}
          </Button>
        </div>
      </div>

      {scanResults && scanResults.length > 0 && (
        <div className="rounded-md border p-3 space-y-2">
          <p className="text-sm font-medium">检测到 {scanResults.length} 个 AI 配置文件：</p>
          <ul className="space-y-1">
            {scanResults.map((file) => (
              <li key={file.path} className="text-xs text-muted-foreground">
                {file.name} ({file.type}) — {file.size} bytes
              </li>
            ))}
          </ul>
        </div>
      )}

      {scanResults && scanResults.length === 0 && (
        <p className="text-sm text-muted-foreground">未检测到 AI 配置文件</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="icon">图标</Label>
          <Input id="icon" name="icon" defaultValue={project?.icon ?? ""} placeholder="📦" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">颜色</Label>
          <Input id="color" name="color" defaultValue={project?.color ?? ""} placeholder="#3b82f6" />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit">{project ? "保存" : "创建项目"}</Button>
    </form>
  );
}
