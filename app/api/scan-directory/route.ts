import { NextRequest, NextResponse } from "next/server";
import { readdir, stat } from "node:fs/promises";
import { join, resolve, relative, posix } from "node:path";

const AI_CONFIG_PATTERNS: Array<{ filename: string; type: string }> = [
  { filename: "AGENTS.md", type: "agents_md" },
  { filename: "CLAUDE.md", type: "claude_md" },
];

function detectFileType(filename: string): string | null {
  for (const pattern of AI_CONFIG_PATTERNS) {
    if (filename === pattern.filename) return pattern.type;
  }
  if (filename.endsWith(".SKILL.md")) return "codex_skill_md";
  if (filename.endsWith(".mdc")) return "cursor_rules";
  return null;
}

function isSafePath(inputPath: string): boolean {
  const resolved = resolve(inputPath);
  if (resolved.includes("..")) return false;
  if (!posix.isAbsolute(resolved) && !resolved.startsWith("/")) return false;
  return true;
}

export async function GET(request: NextRequest) {
  const dirPath = request.nextUrl.searchParams.get("path");

  if (!dirPath) {
    return NextResponse.json({ error: "未提供目录路径" }, { status: 400 });
  }

  if (!isSafePath(dirPath)) {
    return NextResponse.json({ error: "目录路径不合法" }, { status: 400 });
  }

  const resolvedRoot = resolve(dirPath);

  try {
    const dirStat = await stat(resolvedRoot);
    if (!dirStat.isDirectory()) {
      return NextResponse.json({ error: "目录不存在或不可读" }, { status: 404 });
    }
  } catch {
    return NextResponse.json({ error: "目录不存在或不可读" }, { status: 404 });
  }

  try {
    const files: Array<{ path: string; name: string; type: string; size: number }> = [];

    const topEntries = await readdir(resolvedRoot);
    for (const entry of topEntries) {
      const fullPath = join(resolvedRoot, entry);
      try {
        const fileStat = await stat(fullPath);
        if (!fileStat.isFile()) continue;
        const type = detectFileType(entry);
        if (type) {
          files.push({ path: relative(resolvedRoot, fullPath), name: entry, type, size: fileStat.size });
        }
      } catch {
        continue;
      }
    }

    const cursorRulesDir = join(resolvedRoot, ".cursor", "rules");
    try {
      const cursorDirStat = await stat(cursorRulesDir);
      if (cursorDirStat.isDirectory()) {
        const cursorEntries = await readdir(cursorRulesDir);
        for (const entry of cursorEntries) {
          const fullPath = join(cursorRulesDir, entry);
          try {
            const fileStat = await stat(fullPath);
            if (!fileStat.isFile()) continue;
            const type = detectFileType(entry);
            if (type) {
              files.push({ path: relative(resolvedRoot, fullPath), name: `.cursor/rules/${entry}`, type, size: fileStat.size });
            }
          } catch {
            continue;
          }
        }
      }
    } catch {
    }

    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "扫描失败" },
      { status: 500 },
    );
  }
}
