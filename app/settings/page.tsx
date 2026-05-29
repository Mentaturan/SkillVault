import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_VERSION } from "@/lib/constants";
import { dbPath } from "@/db";
import { DiagnosticsPanel } from "@/components/settings/diagnostics-panel";
import { DeploymentTargetSettings } from "@/components/settings/deployment-target-settings";
import { getDeploymentTargets } from "@/server/services/deployment-service";

export default async function SettingsPage() {
  const deploymentTargets = await getDeploymentTargets();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">设置</h1>
        <p className="text-sm text-muted-foreground">应用信息与配置</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>应用信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">应用名称</span>
            <span>{APP_NAME}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">版本</span>
            <span>{APP_VERSION}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">简介</span>
            <span>本地优先的个人 AI 工作流资产管理器</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">数据库路径</span>
            <span className="font-mono text-xs">{dbPath}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>运行模式</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            {APP_NAME} 是一个仅运行在 localhost 的本地应用，不是 SaaS 服务。所有数据存储在本地 SQLite 数据库中，不会上传到云端。
          </p>
          <p>
            当前版本不支持登录、云同步、多用户或远程访问。重启本地服务器不会丢失数据。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>备份</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            导出当前本地库的完整备份 bundle，包含 Markdown 资产、版本历史、标签、集合、项目成员关系和校验信息。
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <a href="/api/backup/export">导出完整备份</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/restore">进入恢复页</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>部署目录</CardTitle>
        </CardHeader>
        <CardContent>
          <DeploymentTargetSettings initialTargets={deploymentTargets} />
        </CardContent>
      </Card>

      <DiagnosticsPanel />
    </div>
  );
}
