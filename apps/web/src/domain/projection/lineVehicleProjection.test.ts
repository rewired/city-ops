import { describe, it, expect } from 'vitest';
import { projectLineVehicleNetwork } from './lineVehicleProjection';
import { createSimulationSecondOfDay } from '../simulation/simulationClock';
import { createLineFrequencyMinutes, createLineId, createNoServiceLineServiceByTimeBand, type Line } from '../types/line';
import { createRouteTravelTimeSeconds, type LineRouteBaseline } from '../types/routeBaseline';
import { createProjectedVehicleCount, type LinePlanningVehicleProjection } from '../types/linePlanningVehicleProjection';
import { createStopId } from '../types/stop';
import { createRouteDistanceMeters } from '../types/lineRoute';
import type { TimeBandId } from '../types/timeBand';

const mockLineId = createLineId('line-1');
const mockTimeBandId = 'morning-rush' as TimeBandId;

const mockLine: Line = {
  id: mockLineId,
  label: 'Line 1',
  stopIds: [createStopId('stop-1'), createStopId('stop-2')],
  topology: 'linear',
  servicePattern: 'one-way',
  routeSegments: [],
  frequencyByTimeBand: {
    ...createNoServiceLineServiceByTimeBand(),
    [mockTimeBandId]: { kind: 'frequency', headwayMinutes: createLineFrequencyMinutes(10) }
  }
};

const mockRouteBaseline: LineRouteBaseline = {
  lineId: mockLineId,
  status: 'routed',
  totalDistanceMeters: createRouteDistanceMeters(5000),
  totalTravelTimeSeconds: createRouteTravelTimeSeconds(600),
  warnings: [],
  segments: [
    {
      lineId: mockLineId,
      segmentIndex: 0,
      fromStopId: createStopId('stop-1'),
      toStopId: createStopId('stop-2'),
      distanceMeters: createRouteDistanceMeters(5000),
      travelTimeSeconds: createRouteTravelTimeSeconds(600),
      status: 'routed',
      warnings: [],
      geometry: [
        [10, 10],
        [20, 20]
      ]
    }
  ]
};

const mockPlanningProjection: LinePlanningVehicleProjection = {
  lineId: mockLineId,
  maxProjectedVehicles: createProjectedVehicleCount(3),
  totalConfiguredBands: 1,
  totalNoServiceBands: 0,
  totalUnconfiguredBands: 0,
  hasFallbackRouteWarning: false,
  bands: [
    {
      lineId: mockLineId,
      timeBandId: mockTimeBandId,
      serviceState: 'frequency',
      headwayMinutes: createLineFrequencyMinutes(10),
      status: 'ready',
      projectedVehicles: createProjectedVehicleCount(3),
      roundTripSeconds: createRouteTravelTimeSeconds(1500), // 600 * 2 + 5 * 60
      warnings: []
    }
  ]
};

describe('projectLineVehicleNetwork', () => {
  it('returns no vehicles if service is unset', () => {
    const routeBaselinesByLineId = new Map([[mockLineId, mockRouteBaseline]]);
    const planning: LinePlanningVehicleProjection = {
      ...mockPlanningProjection,
      bands: [{
        ...mockPlanningProjection.bands[0]!,
        serviceState: 'unset',
        status: 'unconfigured'
      }]
    };
    const result = projectLineVehicleNetwork(
      [mockLine],
      routeBaselinesByLineId,
      [planning],
      createSimulationSecondOfDay(420 * 60),
      mockTimeBandId
    );

    expect(result.lines[0]?.vehicles).toHaveLength(0);
    expect(result.summary.totalProjectedVehicleCount).toBe(0);
  });

  it('distributes vehicles evenly and uses stable slot-based ids', () => {
    const routeBaselinesByLineId = new Map([[mockLineId, mockRouteBaseline]]);
    const result = projectLineVehicleNetwork(
      [mockLine],
      routeBaselinesByLineId,
      [mockPlanningProjection],
      createSimulationSecondOfDay(420 * 60),
      mockTimeBandId
    );

    expect(result.lines[0]?.vehicles).toHaveLength(3);
    const vehicles = result.lines[0]!.vehicles;
    
    // Stable slot-based IDs
    expect(vehicles[0]?.id).toBe(`${mockLineId}:vehicle-0`);
    expect(vehicles[1]?.id).toBe(`${mockLineId}:vehicle-1`);
    expect(vehicles[2]?.id).toBe(`${mockLineId}:vehicle-2`);
    
    // Summary
    expect(result.summary.totalProjectedVehicleCount).toBe(3);
  });

  it('moves vehicles smoothly when continuous second increases within the same minute', () => {
    const routeBaselinesByLineId = new Map([[mockLineId, mockRouteBaseline]]);
    
    // Projection at 07:00:00 (420 * 60 seconds)
    const resultT1 = projectLineVehicleNetwork(
      [mockLine],
      routeBaselinesByLineId,
      [mockPlanningProjection],
      createSimulationSecondOfDay(420 * 60),
      mockTimeBandId
    );

    // Projection at 07:00:15 (420 * 60 + 15 seconds)
    const resultT2 = projectLineVehicleNetwork(
      [mockLine],
      routeBaselinesByLineId,
      [mockPlanningProjection],
      createSimulationSecondOfDay(420 * 60 + 15),
      mockTimeBandId
    );

    const v1_T1 = resultT1.lines[0]!.vehicles[0]!;
    const v1_T2 = resultT2.lines[0]!.vehicles[0]!;

    expect(v1_T1.id).toBe(v1_T2.id); // Stable ID
    expect(v1_T1.coordinate).not.toEqual(v1_T2.coordinate); // Coordinate changed
    expect(v1_T1.routeProgressRatio).toBeLessThan(v1_T2.routeProgressRatio); // Progressed
  });

  it('keeps ids stable across time-band transitions if slot count is overlapping', () => {
    const nextTimeBandId = 'midday' as TimeBandId;
    const multiBandPlanning: LinePlanningVehicleProjection = {
      ...mockPlanningProjection,
      bands: [
        ...mockPlanningProjection.bands,
        {
          ...mockPlanningProjection.bands[0]!,
          timeBandId: nextTimeBandId,
          projectedVehicles: createProjectedVehicleCount(2) // Decreased count
        }
      ]
    };

    const routeBaselinesByLineId = new Map([[mockLineId, mockRouteBaseline]]);

    // T1: morning-rush (3 vehicles)
    const resultT1 = projectLineVehicleNetwork(
      [mockLine],
      routeBaselinesByLineId,
      [multiBandPlanning],
      createSimulationSecondOfDay(539 * 60 + 59), // end of morning-rush
      mockTimeBandId
    );

    // T2: midday (2 vehicles)
    const resultT2 = projectLineVehicleNetwork(
      [mockLine],
      routeBaselinesByLineId,
      [multiBandPlanning],
      createSimulationSecondOfDay(540 * 60), // start of midday
      nextTimeBandId
    );

    expect(resultT1.lines[0]!.vehicles).toHaveLength(3);
    expect(resultT2.lines[0]!.vehicles).toHaveLength(2);

    // Overlapping slots keep their IDs
    expect(resultT1.lines[0]!.vehicles[0]!.id).toBe(resultT2.lines[0]!.vehicles[0]!.id);
    expect(resultT1.lines[0]!.vehicles[1]!.id).toBe(resultT2.lines[0]!.vehicles[1]!.id);
  });

  it('marks vehicles as degraded if the route baseline is fallback-routed', () => {
    const fallbackBaseline: LineRouteBaseline = {
      ...mockRouteBaseline,
      status: 'fallback-routed'
    };
    const routeBaselinesByLineId = new Map([[mockLineId, fallbackBaseline]]);
    const result = projectLineVehicleNetwork(
      [mockLine],
      routeBaselinesByLineId,
      [mockPlanningProjection],
      createSimulationSecondOfDay(420 * 60),
      mockTimeBandId
    );

    const vehicles = result.lines[0]!.vehicles;
    expect(vehicles[0]?.status).toBe('degraded-projected');
    expect(vehicles[0]?.degradedNote).toContain('fallback routing');
    expect(result.summary.totalDegradedProjectedVehicleCount).toBe(3);
  });

  it('handles empty geometry robustly by marking status unavailable', () => {
    const emptyBaseline: LineRouteBaseline = {
      ...mockRouteBaseline,
      segments: [{
        ...mockRouteBaseline.segments[0]!,
        geometry: [] // Invalid geometry length
      }]
    };
    const routeBaselinesByLineId = new Map([[mockLineId, emptyBaseline]]);
    const result = projectLineVehicleNetwork(
      [mockLine],
      routeBaselinesByLineId,
      [mockPlanningProjection],
      createSimulationSecondOfDay(420 * 60),
      mockTimeBandId
    );

    const vehicles = result.lines[0]!.vehicles;
    expect(vehicles[0]?.status).toBe('unavailable');
    expect(vehicles[0]?.coordinate).toBeNull();
  });
});
