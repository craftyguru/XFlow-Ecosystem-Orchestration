import { randomUUID } from "node:crypto";
import { hasMarker } from "./fixture-markers.mjs";

export class MemoryFixtureStore {
  constructor(seed = {}) {
    this.tables = new Map();
    for (const [table, rows] of Object.entries(seed)) {
      this.tables.set(table, rows.map((row) => ({ ...row })));
    }
    this.initialCounts = this.counts();
  }

  table(name) {
    if (!this.tables.has(name)) this.tables.set(name, []);
    return this.tables.get(name);
  }

  counts() {
    const out = {};
    for (const [table, rows] of this.tables.entries()) out[table] = rows.length;
    return out;
  }

  findOne(table, predicate) {
    const rows = this.table(table).filter(predicate);
    if (rows.length > 1) {
      throw new Error(`ambiguous fixture lookup in ${table}: ${rows.length} rows`);
    }
    return rows[0] ?? null;
  }

  findMany(table, predicate) {
    return this.table(table).filter(predicate);
  }

  createOrReuse({ table, lookup, create, verifyMarker = true }) {
    const existing = this.findOne(table, lookup);
    if (existing) {
      if (verifyMarker && !hasMarker(existing)) {
        throw new Error(`refusing to reuse unmarked row in ${table}`);
      }
      return { action: "reused", row: existing };
    }
    const row = { id: randomUUID(), ...create() };
    if (verifyMarker && !hasMarker(row)) {
      throw new Error(`refusing to create unmarked row in ${table}`);
    }
    this.table(table).push(row);
    return { action: "created", row };
  }

  updateWhere(table, predicate, update) {
    let updated = 0;
    for (const row of this.table(table)) {
      if (!predicate(row)) continue;
      Object.assign(row, update(row));
      updated += 1;
    }
    return updated;
  }

  deleteMarked(table, ids) {
    const idSet = new Set(ids);
    const before = this.table(table);
    const kept = [];
    let deleted = 0;
    for (const row of before) {
      if (!idSet.has(row.id)) {
        kept.push(row);
        continue;
      }
      if (!hasMarker(row)) throw new Error(`refusing to delete unmarked row ${row.id} from ${table}`);
      deleted += 1;
    }
    this.tables.set(table, kept);
    return deleted;
  }
}

export function summarizeActions(results) {
  const summary = { created: 0, reused: 0, verified: 0, deleted: 0, refused: 0, missing: 0 };
  for (const result of results.flat(Infinity)) {
    if (!result || typeof result !== "object") continue;
    if (result.action && summary[result.action] != null) summary[result.action] += result.count ?? 1;
    if (result.status && summary[result.status] != null) summary[result.status] += 1;
  }
  return summary;
}
