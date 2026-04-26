import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { convertSelectedLineExportPayloadToSession } from './selectedLineExportSessionLoader';
import { validateSelectedLineExportPayload } from './selectedLineExportValidation';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = dirname(currentFilePath);
const fixturePath = resolve(currentDirPath, '../../../../../data/fixtures/selected-line-exports/hamburg-line-1.v3.json');

/**
 * Loose JSON-compatible helper type for intentional invalid-payload construction in tests.
 */
type MutableJsonObject = Record<string, unknown>;

/**
 * Reads the raw fixture file as an `unknown` candidate without any typed assumption.
 */
const readFixtureCandidate = (): unknown =>
  JSON.parse(readFileSync(fixturePath, 'utf-8'));

/**
 * Clones the fixture into a mutable JSON object for invalid-case test construction.
 * Guards with an isRecord-equivalent check before casting to the narrow helper type.
 */
const cloneFixtureObject = (): MutableJsonObject => {
  const candidate = readFixtureCandidate();
  if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) {
    throw new Error('Fixture root must be a JSON object for clone-based test setup.');
  }
  return structuredClone(candidate) as MutableJsonObject;
};

const getValidatedFixturePayload = () => {
  const candidate = readFixtureCandidate();
  const validationResult = validateSelectedLineExportPayload(candidate);
  expect(validationResult.ok).toBe(true);
  if (!validationResult.ok) {
    throw new Error('Expected committed fixture to validate.');
  }

  return validationResult.payload;
};

describe('convertSelectedLineExportPayloadToSession', () => {
  it('converts a validated payload into one completed line and mapped stops', () => {
    const conversionResult = convertSelectedLineExportPayloadToSession(getValidatedFixturePayload());

    expect(conversionResult.ok).toBe(true);
    if (!conversionResult.ok) {
      return;
    }

    expect(conversionResult.session.sessionLines).toHaveLength(1);
    expect(conversionResult.session.placedStops.length).toBeGreaterThan(0);
  });

  it('preserves explicit no-service plans during conversion', () => {
    const validatedPayload = getValidatedFixturePayload();
    const noServicePayload = {
      ...validatedPayload,
      line: {
        ...validatedPayload.line,
        frequencyByTimeBand: Object.fromEntries(
          Object.keys(validatedPayload.line.frequencyByTimeBand).map((timeBandId) => [timeBandId, { kind: 'no-service' }])
        ) as typeof validatedPayload.line.frequencyByTimeBand
      },
      metadata: {
        ...validatedPayload.metadata,
        includedTimeBandIds: Object.keys(validatedPayload.line.frequencyByTimeBand) as typeof validatedPayload.metadata.includedTimeBandIds
      }
    };

    const validationResult = validateSelectedLineExportPayload(noServicePayload);
    expect(validationResult.ok).toBe(true);
    if (!validationResult.ok) {
      return;
    }

    const conversionResult = convertSelectedLineExportPayloadToSession(validationResult.payload);
    expect(conversionResult.ok).toBe(true);
    if (!conversionResult.ok) {
      return;
    }

    expect(Object.values(conversionResult.session.sessionLines[0].frequencyByTimeBand).every((plan) => plan.kind === 'no-service')).toBe(true);
  });

  it('converts payload with missing routeSegments into empty session segments', () => {
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

    const validationResult = validateSelectedLineExportPayload(payload);
    expect(validationResult.ok).toBe(true);
    if (!validationResult.ok) {
      return;
    }

    const conversionResult = convertSelectedLineExportPayloadToSession(validationResult.payload);

    expect(conversionResult.ok).toBe(true);
    if (conversionResult.ok) {
      expect(conversionResult.session.sessionLines[0].routeSegments).toEqual([]);
    }
  });
});
