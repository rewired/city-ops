import { describe, expect, test } from 'vitest';
import { parseScenarioRegistryPayload } from './scenarioRegistry';

describe('scenarioRegistry parser', () => {
  const validRegistryPayload = {
    schemaVersion: 1,
    generatedAt: '2026-04-27T22:00:00.000Z',
    scenarios: [
      {
        scenarioId: 'test-scenario',
        title: 'Test Scenario',
        description: 'A scenario brief for testing.',
        areaId: 'test-area',
        status: 'ready',
        missingRequirements: [],
        scenario: {
          schemaVersion: 1,
          scenarioId: 'test-scenario',
          title: 'Test Scenario',
          description: 'A scenario brief for testing.',
          areaId: 'test-area',
          requiredAssets: {
            routing: {
              areaId: 'test-area',
              engine: 'osrm',
              profile: 'car',
              algorithm: 'mld'
            },
            stopCandidates: {
              areaId: 'test-area'
            }
          },
          initialViewport: { lng: 10, lat: 53, zoom: 11 },
          playableBounds: { west: 9, south: 52, east: 11, north: 54 },
          startingBudget: 1000,
          simulationStart: { weekday: 'monday', time: '05:00' },
          demandProfileId: 'test-demand',
          objectives: [{ objectiveId: 'obj-1', label: 'Reach goal' }]
        }
      }
    ]
  };

  test('parses correct scenarios successfully', () => {
    const parsed = parseScenarioRegistryPayload(validRegistryPayload);
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.scenarios.length).toBe(1);
    const first = parsed.scenarios[0]!;
    expect(first.scenarioId).toBe('test-scenario');
    expect(first.scenario.startingBudget).toBe(1000);

  });

  test('throws when payload is not an object', () => {
    expect(() => parseScenarioRegistryPayload(null)).toThrow('Scenario registry payload must be a valid JSON object.');
    expect(() => parseScenarioRegistryPayload('string')).toThrow('Scenario registry payload must be a valid JSON object.');
  });

  test('throws when schemaVersion is missing or not numeric', () => {
    const invalid = { ...validRegistryPayload, schemaVersion: '1' };
    expect(() => parseScenarioRegistryPayload(invalid)).toThrow('Registry payload missing numeric schemaVersion.');
  });

  test('throws when generatedAt is missing or not string', () => {
    const invalid = { ...validRegistryPayload, generatedAt: 123 };
    expect(() => parseScenarioRegistryPayload(invalid)).toThrow('Registry payload missing string generatedAt.');
  });

  test('throws when scenarios array is absent', () => {
    const invalid = { ...validRegistryPayload, scenarios: undefined };
    expect(() => parseScenarioRegistryPayload(invalid)).toThrow('Registry payload missing scenarios array.');
  });

  test('throws on invalid readiness status', () => {
    const invalid = JSON.parse(JSON.stringify(validRegistryPayload));
    invalid.scenarios[0].status = 'unknown-state';
    expect(() => parseScenarioRegistryPayload(invalid)).toThrow('holds invalid status state.');
  });

  test('throws on missing viewport data', () => {
    const invalid = JSON.parse(JSON.stringify(validRegistryPayload));
    delete invalid.scenarios[0].scenario.initialViewport;
    expect(() => parseScenarioRegistryPayload(invalid)).toThrow('missing initialViewport metadata.');
  });
});
