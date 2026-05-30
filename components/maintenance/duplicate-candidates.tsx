"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ASSET_STATUS_LABELS, ASSET_TYPE_LABELS } from "@/lib/constants";
import type { DuplicateCandidate } from "@/server/services/maintenance-service";
import {
  archiveDuplicateAction,
  dismissDuplicateAction,
  getDuplicateCandidatesAction,
} from "@/app/assets/maintenance/actions";

export function DuplicateCandidates() {
  const [candidates, setCandidates] = useState<DuplicateCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => {
    getDuplicateCandidatesAction().then((result) => {
      if (result.success) {
        setCandidates(result.candidates);
      }
      setLoading(false);
    });
  }, []);

  const handleDismiss = useCallback(async (pair: DuplicateCandidate) => {
    const key = `${pair.asset1.id}-${pair.asset2.id}`;
    setActioning(key);
    const result = await dismissDuplicateAction({
      asset1Id: pair.asset1.id,
      asset2Id: pair.asset2.id,
    });
    if (result.success) {
      setCandidates((prev) =>
        prev.filter(
          (c) => !(c.asset1.id === pair.asset1.id && c.asset2.id === pair.asset2.id),
        ),
      );
    }
    setActioning(null);
  }, []);

  const handleArchive = useCallback(
    async (pair: DuplicateCandidate, archiveId: string, keptId: string) => {
      const key = `${pair.asset1.id}-${pair.asset2.id}`;
      setActioning(key);
      const result = await archiveDuplicateAction({
        assetIdToArchive: archiveId,
        keptAssetId: keptId,
      });
      if (result.success) {
        setCandidates((prev) =>
          prev.filter(
            (c) => !(c.asset1.id === pair.asset1.id && c.asset2.id === pair.asset2.id),
          ),
        );
      }
      setActioning(null);
    },
    [],
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          正在扫描重复候选…
        </CardContent>
      </Card>
    );
  }

  if (candidates.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          未发现重复候选。
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {candidates.map((pair) => {
        const key = `${pair.asset1.id}-${pair.asset2.id}`;
        const busy = actioning === key;
        return (
          <Card key={key}>
            <CardHeader className="gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">
                      <Link href={`/assets/${pair.asset1.id}`} className="hover:underline">
                        {pair.asset1.title}
                      </Link>
                    </CardTitle>
                    <Badge variant="secondary">
                      {ASSET_TYPE_LABELS[pair.asset1.type as keyof typeof ASSET_TYPE_LABELS]}
                    </Badge>
                    <Badge variant="outline">
                      {ASSET_STATUS_LABELS[pair.asset1.status as keyof typeof ASSET_STATUS_LABELS]}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>↕</span>
                    <CardTitle className="text-base">
                      <Link href={`/assets/${pair.asset2.id}`} className="hover:underline">
                        {pair.asset2.title}
                      </Link>
                    </CardTitle>
                    <Badge variant="secondary">
                      {ASSET_TYPE_LABELS[pair.asset2.type as keyof typeof ASSET_TYPE_LABELS]}
                    </Badge>
                    <Badge variant="outline">
                      {ASSET_STATUS_LABELS[pair.asset2.status as keyof typeof ASSET_STATUS_LABELS]}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={pair.confidence === "high" ? "destructive" : "outline"}>
                    {pair.reason === "content_hash" ? "内容哈希匹配" : "标题相似"}
                  </Badge>
                  <Badge variant="outline">
                    {pair.confidence === "high" ? "高置信" : "中置信"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => handleArchive(pair, pair.asset1.id, pair.asset2.id)}
                >
                  归档「{pair.asset1.title}」
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => handleArchive(pair, pair.asset2.id, pair.asset1.id)}
                >
                  归档「{pair.asset2.title}」
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => handleDismiss(pair)}
                >
                  非重复
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
