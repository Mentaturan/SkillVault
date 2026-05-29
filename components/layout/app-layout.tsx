import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { NavLink } from "./nav-link";
import {
  LayoutDashboard,
  FileText,
  Import,
  FolderOpen,
  Settings,
  Plus,
} from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-10 flex w-64 flex-col border-r bg-background">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="text-lg font-semibold">
            {APP_NAME}
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <NavLink href="/" exact>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>
          <NavLink href="/assets">
            <FileText className="h-4 w-4" />
            Assets
          </NavLink>
          <NavLink href="/assets/new">
            <Plus className="h-4 w-4" />
            New Asset
          </NavLink>
          <NavLink href="/import">
            <Import className="h-4 w-4" />
            Import
          </NavLink>
          <NavLink href="/collections">
            <FolderOpen className="h-4 w-4" />
            Collections
          </NavLink>
          <NavLink href="/settings">
            <Settings className="h-4 w-4" />
            Settings
          </NavLink>
        </nav>
      </aside>
      <main className="flex-1 pl-64">
        <div className="mx-auto max-w-5xl p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
