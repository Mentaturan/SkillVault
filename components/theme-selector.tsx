"use client";

import { useTheme } from "next-themes";
import { THEMES, THEME_LABELS, type Theme } from "@/lib/constants";
import { Sun, Moon, Palette, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMounted } from "@/lib/hooks/use-mounted";

const THEME_ICONS: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  claude: Palette,
  glass: Sparkles,
};

const THEME_PREVIEW_COLORS: Record<Theme, { bg: string; primary: string; text: string }> = {
  light: { bg: "#ffffff", primary: "#3b82f6", text: "#0a0a0a" },
  dark: { bg: "#0b1120", primary: "#3b82f6", text: "#f0f4ff" },
  claude: { bg: "#faf6f1", primary: "#c76b3a", text: "#141414" },
  glass: { bg: "#0f1524", primary: "#4d94ff", text: "#e8ecf4" },
};

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {THEMES.map((t) => (
          <div key={t} className="h-20 rounded-lg border animate-pulse bg-muted" />
        ))}
      </div>
    );
  }

  const currentTheme = (theme || "claude") as Theme;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {THEMES.map((t) => {
        const Icon = THEME_ICONS[t];
        const colors = THEME_PREVIEW_COLORS[t];
        const isActive = currentTheme === t;

        return (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border p-3 transition-all",
              isActive
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/50",
            )}
          >
            <div
              className="flex h-12 w-full items-center justify-center rounded-md"
              style={{ backgroundColor: colors.bg }}
            >
              <div className="flex items-center gap-1">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: colors.primary }}
                />
                <div
                  className="h-2 w-6 rounded-sm"
                  style={{ backgroundColor: colors.text, opacity: 0.3 }}
                />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{THEME_LABELS[t]}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
