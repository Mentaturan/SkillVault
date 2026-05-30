import { sqlite } from "@/db";

export function initFtsTable() {
  sqlite.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS asset_fts USING fts5(
      title, description, scenario, content, tags
    );
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS asset_fts_map(
      asset_id TEXT PRIMARY KEY,
      fts_rowid INTEGER NOT NULL
    );
  `);

  const mapCount = sqlite.prepare("SELECT COUNT(*) AS cnt FROM asset_fts_map").get() as { cnt: number };
  if (mapCount.cnt === 0) {
    populateFtsFromExistingData();
  }
}

function populateFtsFromExistingData() {
  const rows = sqlite.prepare(`
    SELECT a.id, a.title, COALESCE(a.description, '') AS description,
           COALESCE(a.scenario, '') AS scenario, a.content,
           GROUP_CONCAT(t.name, ' ') AS tag_names
    FROM assets a
    LEFT JOIN asset_tags at ON at.asset_id = a.id
    LEFT JOIN tags t ON t.id = at.tag_id
    GROUP BY a.id
  `).all() as Array<{
    id: string;
    title: string;
    description: string;
    scenario: string;
    content: string;
    tag_names: string | null;
  }>;

  const insertFts = sqlite.prepare(`
    INSERT INTO asset_fts(title, description, scenario, content, tags)
    VALUES(?, ?, ?, ?, ?)
  `);

  const insertMap = sqlite.prepare(`
    INSERT INTO asset_fts_map(asset_id, fts_rowid)
    VALUES(?, last_insert_rowid())
  `);

  const transaction = sqlite.transaction(() => {
    for (const row of rows) {
      insertFts.run(
        row.title,
        row.description,
        row.scenario,
        row.content,
        row.tag_names ?? "",
      );
      insertMap.run(row.id);
    }
  });

  transaction();
}

export function syncAssetFts(assetId: string) {
  const asset = sqlite.prepare(`
    SELECT a.id, a.title, COALESCE(a.description, '') AS description,
           COALESCE(a.scenario, '') AS scenario, a.content,
           GROUP_CONCAT(t.name, ' ') AS tag_names
    FROM assets a
    LEFT JOIN asset_tags at ON at.asset_id = a.id
    LEFT JOIN tags t ON t.id = at.tag_id
    WHERE a.id = ?
    GROUP BY a.id
  `).get(assetId) as {
    id: string;
    title: string;
    description: string;
    scenario: string;
    content: string;
    tag_names: string | null;
  } | undefined;

  if (!asset) {
    removeAssetFts(assetId);
    return;
  }

  const existing = sqlite.prepare(
    "SELECT fts_rowid FROM asset_fts_map WHERE asset_id = ?"
  ).get(assetId) as { fts_rowid: number } | undefined;

  if (existing) {
    sqlite.prepare(`
      UPDATE asset_fts SET title = ?, description = ?, scenario = ?, content = ?, tags = ?
      WHERE rowid = ?
    `).run(
      asset.title,
      asset.description,
      asset.scenario,
      asset.content,
      asset.tag_names ?? "",
      existing.fts_rowid,
    );
  } else {
    sqlite.prepare(`
      INSERT INTO asset_fts(title, description, scenario, content, tags)
      VALUES(?, ?, ?, ?, ?)
    `).run(
      asset.title,
      asset.description,
      asset.scenario,
      asset.content,
      asset.tag_names ?? "",
    );

    sqlite.prepare(`
      INSERT OR IGNORE INTO asset_fts_map(asset_id, fts_rowid)
      VALUES(?, last_insert_rowid())
    `).run(assetId);
  }
}

export function removeAssetFts(assetId: string) {
  const existing = sqlite.prepare(
    "SELECT fts_rowid FROM asset_fts_map WHERE asset_id = ?"
  ).get(assetId) as { fts_rowid: number } | undefined;

  if (existing) {
    sqlite.prepare("DELETE FROM asset_fts WHERE rowid = ?").run(existing.fts_rowid);
    sqlite.prepare("DELETE FROM asset_fts_map WHERE asset_id = ?").run(assetId);
  }
}

export function rebuildFtsIndex() {
  sqlite.exec("DELETE FROM asset_fts");
  sqlite.exec("DELETE FROM asset_fts_map");
  populateFtsFromExistingData();
}

export function searchFts(searchTerm: string): Array<{ assetId: string; rank: number }> {
  try {
    const escaped = searchTerm.replace(/"/g, '""');
    const query = `"${escaped}"`;

    const results = sqlite.prepare(`
      SELECT m.asset_id, f.rank
      FROM asset_fts f
      INNER JOIN asset_fts_map m ON f.rowid = m.fts_rowid
      WHERE asset_fts MATCH ?
      ORDER BY f.rank
    `).all(query) as Array<{ asset_id: string; rank: number }>;

    return results.map((r) => ({ assetId: r.asset_id, rank: r.rank }));
  } catch {
    return [];
  }
}
