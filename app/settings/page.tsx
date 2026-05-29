import { APP_VERSION } from "@/lib/constants";

export default function SettingsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-normal">设置</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        当前版本：{APP_VERSION}。设置内容将在第 6 阶段实现。
      </p>
    </main>
  );
}
