"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { KEYBOARD_SHORTCUTS } from "@/lib/constants";

export function KeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMeta = e.metaKey || e.ctrlKey;

      if (isMeta && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("q") as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      if (isMeta && e.key === "n") {
        e.preventDefault();
        router.push("/assets/new");
        return;
      }

      if (e.key === "Escape") {
        const searchInput = document.getElementById("q") as HTMLInputElement | null;
        if (searchInput && document.activeElement === searchInput) {
          searchInput.value = "";
          searchInput.blur();
          searchInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
        if (showHelp) setShowHelp(false);
        return;
      }

      if (isMeta && e.key === "/") {
        e.preventDefault();
        setShowHelp((prev) => !prev);
        return;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router, showHelp]);

  return (
    <AlertDialog open={showHelp} onOpenChange={setShowHelp}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>快捷键</AlertDialogTitle>
          <AlertDialogDescription>
            使用以下快捷键提高效率
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          {Object.values(KEYBOARD_SHORTCUTS).map((shortcut) => (
            <div key={shortcut.key} className="flex items-center justify-between text-sm">
              <span>{shortcut.label}</span>
              <kbd className="rounded border bg-muted px-2 py-0.5 text-xs font-mono">
                {shortcut.meta ? "⌘/" : ""}{shortcut.key === "Escape" ? "Esc" : shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
        <AlertDialogFooter>
          <AlertDialogAction>关闭</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
