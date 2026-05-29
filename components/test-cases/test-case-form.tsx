"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTestCaseAction } from "@/app/assets/[id]/test-cases/actions";
import { useRouter } from "next/navigation";

interface TestCaseFormProps {
  assetId: string;
}

export function TestCaseForm({ assetId }: TestCaseFormProps) {
  const router = useRouter();
  const [kind, setKind] = useState<string>("test_case");

  async function handleSubmit(formData: FormData) {
    formData.set("assetId", assetId);
    formData.set("kind", kind);
    await createTestCaseAction(formData);
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="kind">类型</Label>
        <select
          id="kind"
          name="kind"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="test_case">测试用例</option>
          <option value="run_log">运行日志</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">标题</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="input">输入</Label>
        <Textarea id="input" name="input" required className="min-h-[100px]" />
      </div>
      {kind === "test_case" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="expectedOutput">预期输出</Label>
            <Textarea id="expectedOutput" name="expectedOutput" className="min-h-[80px]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="evaluationCriteria">评估标准</Label>
            <Textarea id="evaluationCriteria" name="evaluationCriteria" className="min-h-[80px]" />
          </div>
        </>
      )}
      {kind === "run_log" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="actualOutput">实际输出</Label>
            <Textarea id="actualOutput" name="actualOutput" className="min-h-[80px]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="score">评分（0-10）</Label>
            <Input id="score" name="score" type="number" min={0} max={10} step={0.5} />
          </div>
        </>
      )}
      <div className="space-y-2">
        <Label htmlFor="note">备注</Label>
        <Textarea id="note" name="note" />
      </div>
      <Button type="submit">创建</Button>
    </form>
  );
}
