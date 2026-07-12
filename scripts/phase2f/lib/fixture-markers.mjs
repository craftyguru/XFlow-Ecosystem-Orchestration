import { FIXTURE_MARKER } from "./provisioner-core.mjs";

export function marker(extra = {}) {
  return {
    ...FIXTURE_MARKER,
    markerVersion: 1,
    ...extra,
  };
}

export function hasMarker(row, expected = {}) {
  const metadata = row?.fixtureMetadata ?? row?.metadata ?? row?.rawProofJson ?? {};
  return Boolean(
    metadata &&
      metadata.phase === FIXTURE_MARKER.phase &&
      metadata.label === FIXTURE_MARKER.label &&
      metadata.environment === FIXTURE_MARKER.environment &&
      metadata.isTest === true &&
      Object.entries(expected).every(([key, value]) => metadata[key] === value),
  );
}

export function deterministicId(prefix, key) {
  return `${prefix}_${String(key).replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").toLowerCase()}`;
}
