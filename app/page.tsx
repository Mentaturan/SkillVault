import Link from "next/link";

import { APP_NAME, APP_VERSION } from "@/lib/constants";

export default function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
      <section className="space-y-3">
        <p className="text-sm text-muted-foreground">{APP_VERSION}</p>
        <h1 className="text-3xl font-semibold tracking-normal">{APP_NAME}</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          本地优先的 AI 工作流资产管理器，用来维护提示词、技能、规则、模板和工作流。
        </p>
      </section>

      <nav className="grid gap-3 sm:grid-cols-3">
        <Link className="rounded-md border p-4 text-sm hover:bg-muted" href="/assets">
          资产库
        </Link>
        <Link className="rounded-md border p-4 text-sm hover:bg-muted" href="/import">
          导入
        </Link>
        <Link className="rounded-md border p-4 text-sm hover:bg-muted" href="/settings">
          设置
        </Link>
      </nav>
    </main>
  );
}
