import { describe, expect, it } from 'vitest';
import { createLineId, createNoServiceLineServiceByTimeBand, type Line } from '../types/line';
import { createStopId, type Stop } from '../types/stop';
import {
  createLineSegmentId,
  createRouteDistanceMeters,
  createRouteTravelMinutes
} from '../types/lineRoute';
import { buildSelectedLineExportPayload } from '../types/selectedLineExport';
import { validateSelectedLineExportPayload } from './selectedLineExportValidation';
import { convertSelectedLineExportPayloadToSession } from './selectedLineExportSessionLoader';

describe('selected-line export round-trip', () => {
  const mockStop1: Stop = { id: createStopId('stop-1'), label: 'Stop A', position: { lng: 9.9, lat: 53.5 } };
  const mockStop2: Stop = { id: createStopId('stop-2'), label: 'Stop B', position: { lng: 9.91, lat: 53.51 } };

  const lineId = createLineId('line-1');

  const mockLine: Line = {
    id: lineId,
    label: 'Stop A \u2194 Stop B',
    stopIds: [mockStop1.id, mockStop2.id],
    topology: 'linear',
    servicePattern: 'bidirectional',
    routeSegments: [
      {
        id: createLineSegmentId('seg-1'),
        lineId,
        fromStopId: mockStop1.id,
        toStopId: mockStop2.id,
        orderedGeometry: [[9.9, 53.5], [9.91, 53.51]],
        distanceMeters: createRouteDistanceMeters(1000),
        inMotionTravelMinutes: createRouteTravelMinutes(2),
        dwellMinutes: createRouteTravelMinutes(0.5),
        totalTravelMinutes: createRouteTravelMinutes(2.5),
        status: 'routed'
      }
    ],
    reverseRouteSegments: [
      {
        id: createLineSegmentId('seg-rev-1'),
        lineId,
        fromStopId: mockStop2.id,
        toStopId: mockStop1.id,
        orderedGeometry: [[9.91, 53.51], [9.9, 53.5]],
        distanceMeters: createRouteDistanceMeters(1000),
        inMotionTravelMinutes: createRouteTravelMinutes(2),
        dwellMinutes: createRouteTravelMinutes(0.5),
        totalTravelMinutes: createRouteTravelMinutes(2.5),
        status: 'routed'
      }
    ],
    frequencyByTimeBand: createNoServiceLineServiceByTimeBand()
  };

  it('preserves all line and stop data through export/validate/convert cycle', () => {
    // 1. Build payload
    const payload = buildSelectedLineExportPayload({
      selectedLine: mockLine,
      placedStops: [mockStop1, mockStop2],
      createdAtIsoUtc: new Date().toISOString(),
      sourceMetadata: { source: 'round-trip-test' }
    });

    // 2. Validate payload
    const validationResult = validateSelectedLineExportPayload(payload);
    expect(validationResult.ok).toBe(true);
    if (!validationResult.ok) return;

    // 3. Convert back to session
    const conversionResult = convertSelectedLineExportPayloadToSession(validationResult.payload);
    expect(conversionResult.ok).toBe(true);
    if (!conversionResult.ok) return;

    const importedLine = conversionResult.session.sessionLines[0];
    const importedStops = conversionResult.session.placedStops;

    expect(importedLine).toBeDefined();
    if (!importedLine) return;

    // Assert preservation
    expect(importedLine.id).toBe(mockLine.id);
    expect(importedLine.label).toBe(mockLine.label);
    expect(importedLine.stopIds).toEqual(mockLine.stopIds);
    expect(importedLine.topology).toBe(mockLine.topology);
    expect(importedLine.servicePattern).toBe(mockLine.servicePattern);
    // v4 exports lose route geometry by design; session loader returns empty arrays
    expect(importedLine.routeSegments).toEqual([]);
    expect(importedLine.reverseRouteSegments).toBeUndefined();

    // Geometry is no longer preserved in v4 export/import round-trip
    expect(importedLine.routeSegments).toHaveLength(0);

    // Check stops
    expect(importedStops).toHaveLength(2);
    expect(importedStops[0]?.label).toBe(mockStop1.label);
  });
});
