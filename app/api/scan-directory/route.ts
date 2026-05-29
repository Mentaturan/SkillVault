import { NextRequest, NextResponse } from "next/server";
import { readdirSync, statSync, existsSync } from "fs";
import { join } from "path";

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

export async function GET(request: NextRequest) {
  const dirPath = request.nextUrl.searchParams.get("path");

  if (!dirPath) {
    return NextResponse.json({ error: "未提供目录路径" }, { status: 400 });
  }

  if (!existsSync(dirPath) || !statSync(dirPath).isDirectory()) {
    return NextResponse.json({ error: "目录不存在或不可读" }, { status: 404 });
  }

  try {
    const files: Array<{ path: string; name: string; type: string; size: number }> = [];

    const topEntries = readdirSync(dirPath);
    for (const entry of topEntries) {
      const fullPath = join(dirPath, entry);
      try {
        const stat = statSync(fullPath);
        if (!stat.isFile()) continue;
        const type = detectFileType(entry);
        if (type) {
          files.push({ path: fullPath, name: entry, type, size: stat.size });
        }
      } catch {
        continue;
      }
    }

    const cursorRulesDir = join(dirPath, ".cursor", "rules");
    if (existsSync(cursorRulesDir) && statSync(cursorRulesDir).isDirectory()) {
      const cursorEntries = readdirSync(cursorRulesDir);
      for (const entry of cursorEntries) {
        const fullPath = join(cursorRulesDir, entry);
        try {
          const stat = statSync(fullPath);
          if (!stat.isFile()) continue;
          const type = detectFileType(entry);
          if (type) {
            files.push({ path: fullPath, name: `.cursor/rules/${entry}`, type, size: stat.size });
          }
        } catch {
          continue;
        }
      }
    }

    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "扫描失败" },
      { status: 500 },
    );
  }
}
