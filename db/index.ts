import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import * as schema from "@/db/schema";

const dbPath = process.env.SKILLVAULT_DB_PATH ?? "./data/skillvault.sqlite";

mkdirSync(dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);

export const db = drizzle(sqlite, { schema });
export { dbPath };
