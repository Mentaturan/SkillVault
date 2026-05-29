"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { APP_NAME, APP_VERSION, ASSET_TYPE_LABELS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardAction } from "@/app/dashboard/actions";
import { FileText, FolderOpen, Briefcase, Clock } from "lucide-react";

interface DashboardData {
  assetCount: number;
  collectionCount: number;
  projectCount: number;
  recentAssets: Array<{
    id: string;
    title: string;
    type: string;
    updatedAt: number;
    status: string;
  }>;
}

function formatTimestamp(ts: number) {
  return new Date(ts).toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    getDashboardAction().then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">{APP_VERSION}</p>
        <h1 className="text-2xl font-semibold">{APP_NAME}</h1>
        <p className="text-sm text-muted-foreground">
          本地优先的 AI 工作流资产管理器
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">资产总数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.assetCount ?? "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">集合总数</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.collectionCount ?? "—"}</div>
          </CardContent>
        </Card>
        <Link href="/projects">
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">项目总数</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.projectCount ?? "—"}</div>
            </CardContent>
          </Card>
        </Link>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">快捷入口</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex gap-2">
            <Link href="/assets/new" className="text-sm text-primary hover:underline">
              新建资产
            </Link>
            <Link href="/import" className="text-sm text-primary hover:underline">
              导入
            </Link>
            <Link href="/collections" className="text-sm text-primary hover:underline">
              集合
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">最近更新</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recentAssets.length ? (
            <div className="space-y-3">
              {data.recentAssets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/assets/${asset.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {asset.title}
                    </Link>
                    <Badge variant="secondary" className="text-xs">
                      {ASSET_TYPE_LABELS[asset.type as keyof typeof ASSET_TYPE_LABELS] ?? asset.type}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(asset.updatedAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {data ? "暂无资产" : "加载中..."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
