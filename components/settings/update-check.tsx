"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { APP_VERSION } from "@/lib/constants";
import { checkForUpdateAction } from "@/app/settings/actions";

export function UpdateCheck() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<Awaited<ReturnType<typeof checkForUpdateAction>> | null>(null);

  function handleCheck() {
    startTransition(async () => {
      const res = await checkForUpdateAction();
      setResult(res);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>版本更新</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">当前版本</span>
          <span>{APP_VERSION}</span>
        </div>
        <div>
          <Button onClick={handleCheck} disabled={isPending} size="sm">
            {isPending ? "检查中..." : "检查更新"}
          </Button>
        </div>
        {result && (
          <div>
            {result.error && (
              <p className="text-destructive">{result.error}</p>
            )}
            {result.latestVersion && !result.error && (
              <>
                {result.hasUpdate ? (
                  <div className="space-y-2">
                    <p>
                      发现新版本 v{result.latestVersion}
                    </p>
                    {result.downloadUrl && (
                      <Button asChild size="sm" variant="outline">
                        <a href={result.downloadUrl} target="_blank" rel="noopener noreferrer">
                          下载更新
                        </a>
                      </Button>
                    )}
                    {result.releaseNotes && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-muted-foreground text-xs">更新说明</summary>
                        <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">{result.releaseNotes}</p>
                      </details>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">已是最新版本</p>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
