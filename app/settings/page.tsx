import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME, APP_VERSION } from "@/lib/constants";
import { dbPath } from "@/db";

export default function SettingsPage() {
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
    </div>
  );
}
