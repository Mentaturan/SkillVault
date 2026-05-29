"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TestCaseForm } from "@/components/test-cases/test-case-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteTestCaseAction } from "@/app/assets/[id]/test-cases/actions";
import { Plus, Trash2 } from "lucide-react";

interface TestCase {
  id: string;
  kind: string;
  title: string;
  input: string;
  expectedOutput: string | null;
  actualOutput: string | null;
  evaluationCriteria: string | null;
  score: number | null;
  note: string | null;
  createdAt: number;
}

interface TestCaseListClientProps {
  assetId: string;
  testCases: TestCase[];
}

export function TestCaseListClient({ assetId, testCases }: TestCaseListClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleDelete() {
    if (!deleteId) return;
    await deleteTestCaseAction(deleteId, assetId);
    setDeleteId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={() => setShowForm(!showForm)}>
        <Plus className="mr-2 h-4 w-4" />
        {showForm ? "收起表单" : "新建测试用例"}
      </Button>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">新建</CardTitle>
          </CardHeader>
          <CardContent>
            <TestCaseForm assetId={assetId} />
          </CardContent>
        </Card>
      )}

      {testCases.length === 0 ? (
        <p className="text-sm text-muted-foreground">暂无测试用例或运行日志。</p>
      ) : (
        <div className="space-y-3">
          {testCases.map((tc) => (
            <Card key={tc.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm">{tc.title}</CardTitle>
                  <Badge variant={tc.kind === "test_case" ? "default" : "secondary"} className="text-xs">
                    {tc.kind === "test_case" ? "测试用例" : "运行日志"}
                  </Badge>
                  {tc.score !== null && (
                    <Badge variant="outline" className="text-xs">
                      评分: {tc.score}
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(tc.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">输入：</span>
                  <pre className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-2 text-xs">
                    {tc.input}
                  </pre>
                </div>
                {tc.expectedOutput && (
                  <div>
                    <span className="text-muted-foreground">预期输出：</span>
                    <pre className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-2 text-xs">
                      {tc.expectedOutput}
                    </pre>
                  </div>
                )}
                {tc.actualOutput && (
                  <div>
                    <span className="text-muted-foreground">实际输出：</span>
                    <pre className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-2 text-xs">
                      {tc.actualOutput}
                    </pre>
                  </div>
                )}
                {tc.evaluationCriteria && (
                  <div>
                    <span className="text-muted-foreground">评估标准：</span>
                    <p>{tc.evaluationCriteria}</p>
                  </div>
                )}
                {tc.note && (
                  <div>
                    <span className="text-muted-foreground">备注：</span>
                    <p>{tc.note}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="删除测试用例"
        description="确定要删除这个测试用例吗？"
        confirmLabel="删除"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
