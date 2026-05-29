import { NextRequest, NextResponse } from "next/server";
import { exportAssetToMarkdown } from "@/server/services/markdown-service";

export async function GET(request: NextRequest) {
  try {
    const ids = request.nextUrl.searchParams.get("ids")?.split(",").filter(Boolean) ?? [];

    if (ids.length === 0) {
      return NextResponse.json({ error: "未选择资产" }, { status: 400 });
    }

    if (ids.length === 1) {
      const { markdown, filename } = await exportAssetToMarkdown(ids[0]);
      return new NextResponse(markdown, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        },
      });
    }

    const results = await Promise.all(ids.map((id) => exportAssetToMarkdown(id)));

    const boundary = "===SKILLVAULT_ASSET_BOUNDARY===";
    const parts = results.map(
      (r) => `--${boundary}\nFilename: ${r.filename}\n\n${r.markdown}\n`,
    );
    const body = parts.join("") + `--${boundary}--\n`;

    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="skillvault-export-${Date.now()}.txt"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "导出失败" },
      { status: 500 },
    );
  }
}
