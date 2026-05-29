import { NextResponse } from "next/server";
import { EXPORT_PRESETS } from "@/lib/constants";
import type { ExportPreset } from "@/lib/constants";
import { renderAssetWithPreset, getExportFilenameWithPreset } from "@/lib/markdown";
import { findAssetById } from "@/server/queries/asset-queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; preset: string }> },
) {
  try {
    const { id, preset: presetParam } = await params;

    if (!EXPORT_PRESETS.includes(presetParam as ExportPreset)) {
      return NextResponse.json(
        { error: "无效的导出预设" },
        { status: 400 },
      );
    }

    const asset = await findAssetById(id);
    if (!asset) {
      return NextResponse.json(
        { error: "资产不存在" },
        { status: 404 },
      );
    }

    const preset = presetParam as ExportPreset;
    const markdown = renderAssetWithPreset(asset, preset);
    const filename = getExportFilenameWithPreset(asset, preset);

    return new NextResponse(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "导出失败" },
      { status: 500 },
    );
  }
}
