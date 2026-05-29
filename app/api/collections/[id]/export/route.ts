import { NextResponse } from "next/server";
import { getCollectionById } from "@/server/services/collection-service";
import { exportAssetToMarkdown } from "@/server/services/markdown-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const collection = await getCollectionById(id);

    if (!collection) {
      return NextResponse.json({ error: "集合不存在" }, { status: 404 });
    }

    const assetIds = collection.collectionAssets?.map((ca) => ca.assetId) ?? [];

    if (assetIds.length === 0) {
      return NextResponse.json({ error: "集合为空" }, { status: 400 });
    }

    if (assetIds.length === 1) {
      const { markdown, filename } = await exportAssetToMarkdown(assetIds[0]);
      return new NextResponse(markdown, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        },
      });
    }

    const results = await Promise.all(assetIds.map((aid) => exportAssetToMarkdown(aid)));

    const boundary = "===SKILLVAULT_ASSET_BOUNDARY===";
    const parts = results.map(
      (r) => `--${boundary}\nFilename: ${r.filename}\n\n${r.markdown}\n`,
    );
    const body = parts.join("") + `--${boundary}--\n`;

    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(collection.name)}-export-${Date.now()}.txt"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "导出失败" },
      { status: 500 },
    );
  }
}
