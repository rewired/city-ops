import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { validateSelectedLineExportPayload } from './selectedLineExportValidation';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = dirname(currentFilePath);
const fixturePath = resolve(currentDirPath, '../../../../../data/fixtures/selected-line-exports/hamburg-line-1.v3.json');

/**
 * Loose JSON-compatible helper type for intentional invalid-payload construction in tests.
 * Used only to mutate fixture clones in negative-case test assertions.
 */
type MutableJsonObject = Record<string, unknown>;

/**
 * Reads the raw fixture file as an `unknown` candidate for use in validation tests.
 * Does not cast to any typed shape — the validator under test is responsible for
 * narrowing the result.
 */
const readFixtureCandidate = (): unknown =>
  JSON.parse(readFileSync(fixturePath, 'utf-8'));

/**
 * Clones the fixture into a mutable JSON object helper type for invalid-case construction.
 * Guards with `isRecord` before casting to the narrow helper type.
 */
const cloneFixtureObject = (): MutableJsonObject => {
  const candidate = readFixtureCandidate();
  if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) {
    throw new Error('Fixture root must be a JSON object for clone-based test setup.');
  }
  return structuredClone(candidate) as MutableJsonObject;
};

const expectIssue = (payload: unknown, expectedCode: string): void => {
  const result = validateSelectedLineExportPayload(payload);

  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.issues.map((issue) => issue.code)).toContain(expectedCode);
  }
};

describe('validateSelectedLineExportPayload fixture contract', () => {
  it('validates committed hamburg-line-1 fixture successfully', () => {
    const candidate = readFixtureCandidate();

    const result = validateSelectedLineExportPayload(candidate);

    expect(result.ok).toBe(true);
  });

  it('fails on unknown schema version', () => {
    const payload = cloneFixtureObject();
    payload['schemaVersion'] = 'cityops-selected-line-export-v999';

    expectIssue(payload, 'invalid-schema-version');
  });

  it('fails on unknown export kind', () => {
    const payload = cloneFixtureObject();
    payload['exportKind'] = 'multi-line';

    expectIssue(payload, 'invalid-export-kind');
  });

  it('fails when an ordered stop is missing from exported stops', () => {
    const payload = cloneFixtureObject();
    const stops = payload['stops'];
    if (!Array.isArray(stops)) {
      throw new Error('Fixture stops must be an array.');
    }
    payload['stops'] = stops.filter((stop: unknown) => {
      if (typeof stop === 'object' && stop !== null && 'id' in stop) {
        return (stop as Record<string, unknown>)['id'] !== 'stop-7';
      }
      return true;
    });
    const metadata = payload['metadata'];
    if (typeof metadata === 'object' && metadata !== null) {
      (metadata as MutableJsonObject)['stopCount'] = (payload['stops'] as unknown[]).length;
    }

    expectIssue(payload, 'stop-reference-mismatch');
  });

  it('fails when an exported stop is unreferenced by ordered stops', () => {
    const payload = cloneFixtureObject();
    const stops = payload['stops'];
    if (!Array.isArray(stops)) {
      throw new Error('Fixture stops must be an array.');
    }
    payload['stops'] = [
      ...stops,
      {
        id: 'stop-extra',
        position: { lng: 9.95, lat: 53.55 },
        label: 'Extra Stop'
      }
    ];
    const metadata = payload['metadata'];
    if (typeof metadata === 'object' && metadata !== null) {
      (metadata as MutableJsonObject)['stopCount'] = (payload['stops'] as unknown[]).length;
    }

    expectIssue(payload, 'stop-reference-mismatch');
  });

  it('fails when route segment count is below ordered stop chain minimum', () => {
    const payload = cloneFixtureObject();
    const line = payload['line'];
    if (typeof line !== 'object' || line === null) {
      throw new Error('Fixture line must be an object.');
    }
    const lineMut = line as MutableJsonObject;
    const segments = lineMut['routeSegments'];
    if (!Array.isArray(segments)) {
      throw new Error('Fixture routeSegments must be an array.');
    }
    lineMut['routeSegments'] = segments.slice(0, -1);
    const metadata = payload['metadata'];
    if (typeof metadata === 'object' && metadata !== null) {
      (metadata as MutableJsonObject)['routeSegmentCount'] = (lineMut['routeSegments'] as unknown[]).length;
    }

    expectIssue(payload, 'route-segment-count-mismatch');
  });

  it('fails on route segment adjacency mismatch', () => {
    const payload = cloneFixtureObject();
    const stops = payload['stops'];
    if (!Array.isArray(stops)) {
      throw new Error('Fixture stops must be an array.');
    }
    const stop3 = stops.find((stop: unknown) => {
      if (typeof stop === 'object' && stop !== null && 'id' in stop) {
        return (stop as Record<string, unknown>)['id'] === 'stop-3';
      }
      return false;
    });
    expect(stop3).toBeDefined();
    if (stop3 === undefined || typeof stop3 !== 'object' || stop3 === null) {
      return;
    }
    const stop3Rec = stop3 as Record<string, unknown>;
    const stop3Position = stop3Rec['position'];
    if (typeof stop3Position !== 'object' || stop3Position === null) {
      throw new Error('stop-3 position must be an object.');
    }
    const { lng, lat } = stop3Position as { lng: number; lat: number };

    const line = payload['line'];
    if (typeof line !== 'object' || line === null) {
      throw new Error('Fixture line must be an object.');
    }
    const lineMut = line as MutableJsonObject;
    const segments = lineMut['routeSegments'];
    if (!Array.isArray(segments) || segments.length === 0) {
      throw new Error('Fixture routeSegments must be a non-empty array.');
    }
    const firstSeg = segments[0];
    if (typeof firstSeg !== 'object' || firstSeg === null) {
      throw new Error('First route segment must be an object.');
    }
    const firstSegRec = firstSeg as Record<string, unknown>;
    const origGeom = firstSegRec['orderedGeometry'];
    if (!Array.isArray(origGeom) || origGeom.length === 0) {
      throw new Error('First segment orderedGeometry must be a non-empty array.');
    }
    segments[0] = {
      ...firstSegRec,
      toStopId: 'stop-3',
      orderedGeometry: [origGeom[0], [lng, lat]]
    };
    lineMut['routeSegments'] = segments;

    expectIssue(payload, 'route-segment-adjacency-mismatch');
  });

  it('fails on route segment line id mismatch', () => {
    const payload = cloneFixtureObject();
    const line = payload['line'];
    if (typeof line !== 'object' || line === null) {
      throw new Error('Fixture line must be an object.');
    }
    const lineMut = line as MutableJsonObject;
    const segments = lineMut['routeSegments'];
    if (!Array.isArray(segments) || segments.length === 0) {
      throw new Error('Fixture routeSegments must be a non-empty array.');
    }
    const firstSeg = segments[0];
    if (typeof firstSeg !== 'object' || firstSeg === null) {
      throw new Error('First route segment must be an object.');
    }
    segments[0] = { ...(firstSeg as Record<string, unknown>), lineId: 'line-2' };
    lineMut['routeSegments'] = segments;

    expectIssue(payload, 'route-segment-line-id-mismatch');
  });

  it('fails on invalid coordinate range', () => {
    const payload = cloneFixtureObject();
    const stops = payload['stops'];
    if (!Array.isArray(stops) || stops.length === 0) {
      throw new Error('Fixture stops must be a non-empty array.');
    }
    const firstStop = stops[0];
    if (typeof firstStop !== 'object' || firstStop === null) {
      throw new Error('First stop must be an object.');
    }
    stops[0] = { ...(firstStop as Record<string, unknown>), position: { lng: 190, lat: 53.5 } };
    payload['stops'] = stops;

    expectIssue(payload, 'invalid-stop-position');
  });

  it('fails on invalid total travel time', () => {
    const payload = cloneFixtureObject();
    const line = payload['line'];
    if (typeof line !== 'object' || line === null) {
      throw new Error('Fixture line must be an object.');
    }
    const lineMut = line as MutableJsonObject;
    const segments = lineMut['routeSegments'];
    if (!Array.isArray(segments) || segments.length === 0) {
      throw new Error('Fixture routeSegments must be a non-empty array.');
    }
    const firstSeg = segments[0];
    if (typeof firstSeg !== 'object' || firstSeg === null) {
      throw new Error('First route segment must be an object.');
    }
    const firstSegRec = firstSeg as Record<string, unknown>;
    segments[0] = {
      ...firstSegRec,
      totalTravelMinutes: firstSegRec['inMotionTravelMinutes']
    };
    lineMut['routeSegments'] = segments;

    expectIssue(payload, 'route-segment-total-travel-minutes-mismatch');
  });

  it('fails on metadata stop count mismatch', () => {
    const payload = cloneFixtureObject();
    const metadata = payload['metadata'];
    if (typeof metadata !== 'object' || metadata === null) {
      throw new Error('Fixture metadata must be an object.');
    }
    const metaMut = metadata as MutableJsonObject;
    const current = metaMut['stopCount'];
    if (typeof current !== 'number') {
      throw new Error('Fixture metadata.stopCount must be a number.');
    }
    metaMut['stopCount'] = current + 1;

    expectIssue(payload, 'invalid-metadata-counts');
  });

  it('fails on metadata route segment count mismatch', () => {
    const payload = cloneFixtureObject();
    const metadata = payload['metadata'];
    if (typeof metadata !== 'object' || metadata === null) {
      throw new Error('Fixture metadata must be an object.');
    }
    const metaMut = metadata as MutableJsonObject;
    const current = metaMut['routeSegmentCount'];
    if (typeof current !== 'number') {
      throw new Error('Fixture metadata.routeSegmentCount must be a number.');
    }
    metaMut['routeSegmentCount'] = current + 1;

    expectIssue(payload, 'invalid-metadata-counts');
  });

  it('accepts includedTimeBandIds that match configured service plans in canonical order', () => {
    const candidate = readFixtureCandidate();

    const result = validateSelectedLineExportPayload(candidate);

    expect(result.ok).toBe(true);
  });

  it('requires canonical includedTimeBandIds when all service plans are no-service', () => {
    const payload = cloneFixtureObject();
    const line = payload['line'];
    if (typeof line !== 'object' || line === null) {
      throw new Error('Fixture line must be an object.');
    }
    (line as MutableJsonObject)['frequencyByTimeBand'] = {
      'morning-rush': { kind: 'no-service' },
      'late-morning': { kind: 'no-service' },
      midday: { kind: 'no-service' },
      afternoon: { kind: 'no-service' },
      'evening-rush': { kind: 'no-service' },
      evening: { kind: 'no-service' },
      night: { kind: 'no-service' }
    };
    const metadata = payload['metadata'];
    if (typeof metadata !== 'object' || metadata === null) {
      throw new Error('Fixture metadata must be an object.');
    }
    (metadata as MutableJsonObject)['includedTimeBandIds'] = [
      'morning-rush',
      'late-morning',
      'midday',
      'afternoon',
      'evening-rush',
      'evening',
      'night'
    ];

    const result = validateSelectedLineExportPayload(payload);

    expect(result.ok).toBe(true);
  });

  it('allows no-service plans and counts them as configured in includedTimeBandIds', () => {
    const payload = cloneFixtureObject();
    const line = payload['line'];
    if (typeof line !== 'object' || line === null) {
      throw new Error('Fixture line must be an object.');
    }
    const lineMut = line as MutableJsonObject;
    const existingFreq = lineMut['frequencyByTimeBand'];
    if (typeof existingFreq !== 'object' || existingFreq === null) {
      throw new Error('Fixture frequencyByTimeBand must be an object.');
    }
    lineMut['frequencyByTimeBand'] = {
      ...(existingFreq as Record<string, unknown>),
      evening: { kind: 'no-service' },
      night: { kind: 'no-service' }
    };
    const metadata = payload['metadata'];
    if (typeof metadata !== 'object' || metadata === null) {
      throw new Error('Fixture metadata must be an object.');
    }
    (metadata as MutableJsonObject)['includedTimeBandIds'] = [
      'morning-rush',
      'late-morning',
      'midday',
      'afternoon',
      'evening-rush',
      'evening',
      'night'
    ];

    const result = validateSelectedLineExportPayload(payload);

    expect(result.ok).toBe(true);
  });

  it('fails when frequency plan headwayMinutes is not positive', () => {
    const payload = cloneFixtureObject();
    const line = payload['line'];
    if (typeof line !== 'object' || line === null) {
      throw new Error('Fixture line must be an object.');
    }
    const lineMut = line as MutableJsonObject;
    const existingFreq = lineMut['frequencyByTimeBand'];
    if (typeof existingFreq !== 'object' || existingFreq === null) {
      throw new Error('Fixture frequencyByTimeBand must be an object.');
    }
    lineMut['frequencyByTimeBand'] = {
      ...(existingFreq as Record<string, unknown>),
      midday: { kind: 'frequency', headwayMinutes: 0 }
    };

    expectIssue(payload, 'invalid-frequency-value');
  });

  it('accepts payload with missing routeSegments as derived cache intent', () => {
    const payload = cloneFixtureObject();
    const line = payload['line'];
    if (typeof line !== 'object' || line === null) {
      throw new Error('Fixture line must be an object.');
    }
    const lineMut = line as MutableJsonObject;
    delete lineMut['routeSegments'];
    const metadata = payload['metadata'];
    if (typeof metadata !== 'object' || metadata === null) {
      throw new Error('Fixture metadata must be an object.');
    }
    (metadata as MutableJsonObject)['routeSegmentCount'] = 0;

    const result = validateSelectedLineExportPayload(payload);

    expect(result.ok).toBe(true);
  });
});
