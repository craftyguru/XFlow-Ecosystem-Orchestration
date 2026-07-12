import { deterministicId, hasMarker, marker } from "../lib/fixture-markers.mjs";

export function result(adapter, action, table, row, extra = {}) {
  return {
    adapter,
    action,
    table,
    id: row?.id,
    label: row?.label ?? row?.slug ?? row?.name ?? row?.emailLabel,
    ...extra,
  };
}

export function requireMarked(row, label) {
  if (!row) throw new Error(`${label} missing`);
  if (!hasMarker(row)) throw new Error(`${label} lacks phase2f marker`);
  return row;
}

export function fixtureId(app, key) {
  return deterministicId(`phase2f_${app}`, key);
}

export { marker };
