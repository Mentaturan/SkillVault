"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Briefcase,
  Plus,
  Import,
  Settings,
  Menu,
  X,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS: Array<{ href: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }> = [
  { href: "/", label: "仪表盘", icon: LayoutDashboard, exact: true },
  { href: "/assets", label: "资产库", icon: FileText },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/collections", label: "集合", icon: FolderOpen },
  { href: "/projects", label: "项目", icon: Briefcase },
  { href: "/assets/new", label: "新建资产", icon: Plus },
  { href: "/import", label: "导入", icon: Import },
  { href: "/settings", label: "设置", icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="text-lg font-semibold" onClick={onNavigate}>
          {APP_NAME}
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-background md:flex">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link href="/" className="text-lg font-semibold" onClick={() => setMobileOpen(false)}>
            {APP_NAME}
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </nav>
      </aside>

      <div className="flex flex-1 flex-col md:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center border-b bg-background/95 px-4 backdrop-blur md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="ml-3 text-sm font-medium">{APP_NAME}</span>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
