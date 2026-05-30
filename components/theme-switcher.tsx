"use client";

import { useTheme } from "next-themes";
import { THEMES, THEME_LABELS, type Theme } from "@/lib/constants";
import { Sun, Moon, Palette, Sparkles } from "lucide-react";
import { useMounted } from "@/lib/hooks/use-mounted";

const THEME_ICONS: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  claude: Palette,
  glass: Sparkles,
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <Sun className="h-4 w-4" />
        <span>主题</span>
      </div>
    );
  }

  const currentTheme = (theme || "claude") as Theme;
  const currentIndex = THEMES.indexOf(currentTheme);
  const nextTheme = THEMES[(currentIndex + 1) % THEMES.length];
  const Icon = THEME_ICONS[currentTheme] || Sun;

  return (
    <button
      onClick={() => setTheme(nextTheme)}
      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      title={`切换到${THEME_LABELS[nextTheme]}主题`}
    >
      <Icon className="h-4 w-4" />
      <span>{THEME_LABELS[currentTheme]}</span>
    </button>
  );
}
