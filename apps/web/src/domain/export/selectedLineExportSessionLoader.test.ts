import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { convertSelectedLineExportPayloadToSession } from './selectedLineExportSessionLoader';
import { validateSelectedLineExportPayload } from './selectedLineExportValidation';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = dirname(currentFilePath);
const getFixturePath = (version: 'v3' | 'v4'): string => 
  resolve(currentDirPath, `../../../../../data/fixtures/selected-line-exports/hamburg-line-1.${version}.json`);

/**
 * Loose JSON-compatible helper type for intentional invalid-payload construction in tests.
 */
type MutableJsonObject = Record<string, unknown>;

/**
 * Reads the raw fixture file as an `unknown` candidate without any typed assumption.
 */
const readFixtureCandidate = (version: 'v3' | 'v4' = 'v3'): unknown =>
  JSON.parse(readFileSync(getFixturePath(version), 'utf-8'));

/**
 * Clones the fixture into a mutable JSON object for invalid-case test construction.
 * Guards with an isRecord-equivalent check before casting to the narrow helper type.
 */
const cloneFixtureObject = (version: 'v3' | 'v4' = 'v3'): MutableJsonObject => {
  const candidate = readFixtureCandidate(version);
  if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) {
    throw new Error('Fixture root must be a JSON object for clone-based test setup.');
  }
  return structuredClone(candidate) as MutableJsonObject;
};

const getValidatedFixturePayload = (version: 'v3' | 'v4' = 'v3') => {
  const candidate = readFixtureCandidate(version);
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

  it('converts payload with missing routeSegments (v3 legacy empty geometry) into empty session segments', () => {
    const payload = cloneFixtureObject('v3');
    const line = payload['line'] as MutableJsonObject;
    delete line['routeSegments'];
    const metadata = payload['metadata'] as MutableJsonObject;
    metadata['routeSegmentCount'] = 0;

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

  it('converts v4 slim payload into empty session segments', () => {
    const validatedPayload = getValidatedFixturePayload('v4');
    const conversionResult = convertSelectedLineExportPayloadToSession(validatedPayload);

    expect(conversionResult.ok).toBe(true);
    if (conversionResult.ok) {
      expect(conversionResult.session.sessionLines[0].routeSegments).toEqual([]);
    }
  });
});
