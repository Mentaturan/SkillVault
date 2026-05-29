import { dbPath, sqlite } from "@/db";
import { getEntityCounts } from "@/server/queries/diagnostic-queries";
import { getMigrationState, readLastBackupMetadata } from "@/server/services/backup-service";

export async function getDiagnosticsSnapshot() {
  const [counts, lastBackup] = await Promise.all([
    getEntityCounts(),
    Promise.resolve(readLastBackupMetadata()),
  ]);

  const integrityMessages = sqlite
    .prepare("PRAGMA integrity_check")
    .pluck()
    .all() as string[];
  const integrityOk =
    integrityMessages.length === 1 && integrityMessages[0]?.toLowerCase() === "ok";
  const migrationState = getMigrationState();

  return {
    databasePath: dbPath,
    counts,
    migrationState,
    integrity: {
      ok: integrityOk,
      messages: integrityMessages,
    },
    lastBackup,
  };
}
