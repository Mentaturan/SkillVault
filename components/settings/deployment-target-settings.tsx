"use client";

import { useState, useTransition } from "react";

import { saveDeploymentTargetsAction } from "@/app/settings/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DeploymentTargetView } from "@/lib/deployment/types";

interface DeploymentTargetSettingsProps {
  initialTargets: DeploymentTargetView[];
}

export function DeploymentTargetSettings({
  initialTargets,
}: DeploymentTargetSettingsProps) {
  const [targets, setTargets] = useState(initialTargets);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateTarget(
    targetId: string,
    updates: Partial<Pick<DeploymentTargetView, "path" | "enabled">>,
  ) {
    setTargets((current) =>
      current.map((target) =>
        target.id === targetId ? { ...target, ...updates } : target,
      ),
    );
  }

  function handleSave() {
    setError(null);
    setSaved(null);

    startTransition(async () => {
      try {
        const nextTargets = await saveDeploymentTargetsAction(
          targets.map((target) => ({
            key: target.key,
            path: target.path,
            enabled: target.enabled,
          })),
        );
        setTargets(nextTargets);
        setSaved("部署目录已保存");
      } catch (actionError) {
        setError(
          actionError instanceof Error ? actionError.message : "保存部署目录失败",
        );
      }
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        当前先提供每类工具一个部署目录，通用目录也先实现为单目标配置，后续如有需要再扩展为多通用目标。
      </p>

      <div className="space-y-4">
        {targets.map((target) => (
          <div key={target.id} className="rounded-md border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{target.label}</p>
                <p className="text-sm text-muted-foreground">
                  {target.description}
                </p>
              </div>
              <Label className="flex items-center gap-2 text-sm font-normal">
                <Checkbox
                  checked={target.enabled}
                  onCheckedChange={(checked) =>
                    updateTarget(target.id, { enabled: checked === true })
                  }
                />
                启用
              </Label>
            </div>

            <div className="mt-3 space-y-2">
              <Label htmlFor={`deployment-path-${target.id}`}>部署目录</Label>
              <Input
                id={`deployment-path-${target.id}`}
                value={target.path}
                onChange={(event) =>
                  updateTarget(target.id, { path: event.target.value })
                }
                placeholder={target.placeholder}
                className="font-mono text-xs"
              />
            </div>
          </div>
        ))}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {saved ? <p className="text-sm text-green-600">{saved}</p> : null}

      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? "保存中..." : "保存部署目录"}
      </Button>
    </div>
  );
}
