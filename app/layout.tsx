import type { Metadata } from "next";

import "./globals.css";

import { APP_NAME } from "@/lib/constants";
import { AppLayout } from "@/components/layout/app-layout";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "本地优先的 AI 工作流资产管理器。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
