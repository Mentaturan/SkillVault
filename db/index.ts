import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

import * as schema from "@/db/schema";

const dbPath = process.env.SKILLVAULT_DB_PATH ?? "./data/skillvault.sqlite";

mkdirSync(dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);

export const db = drizzle(sqlite, { schema });

const migrationsFolder = join(process.cwd(), "db/migrations");
migrate(db, { migrationsFolder });

export { dbPath, sqlite };
