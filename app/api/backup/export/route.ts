import { NextResponse } from "next/server";

import { exportBackupBundle } from "@/server/services/backup-service";

export async function GET() {
  try {
    const { filename, json } = await exportBackupBundle();

    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "备份导出失败" },
      { status: 500 },
    );
  }
}
