import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

function readFlag(name: string) {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

async function main() {
  const bundlePath = readFlag("--bundle");
  if (!bundlePath) {
    throw new Error("缺少 --bundle /absolute/path/to/skillvault-backup.json");
  }

  if (!existsSync(bundlePath)) {
    throw new Error(`备份文件不存在：${bundlePath}`);
  }

  const tempDbPath = join(tmpdir(), `skillvault-restore-smoke-${Date.now()}.sqlite`);
  const env = {
    ...process.env,
    SKILLVAULT_DB_PATH: tempDbPath,
  };

  execFileSync("npm", ["run", "db:migrate"], {
    cwd: process.cwd(),
    env,
    stdio: "pipe",
  });

  process.env.SKILLVAULT_DB_PATH = tempDbPath;

  const raw = readFileSync(bundlePath, "utf8");
  const { restoreBackupBundle } = await import("../server/services/restore-service");
  const { getEntityCounts } = await import("../server/queries/diagnostic-queries");

  const result = await restoreBackupBundle(raw, "overwrite");
  if ("error" in result) {
    throw new Error(result.error);
  }

  const counts = await getEntityCounts();

  console.log(
    JSON.stringify(
      {
        tempDbPath,
        restore: result.result,
        counts,
      },
      null,
      2,
    ),
  );

  rmSync(tempDbPath, { force: true });
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
