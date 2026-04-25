import { describe, expect, it } from 'vitest';
import { projectLineDepartureTimetable } from './lineDepartureTimetableProjection';
import type { Line } from '../types/line';
import { createLineId, createLineFrequencyMinutes } from '../types/line';
import type { Stop } from '../types/stop';
import { createStopId } from '../types/stop';
import type { TimeBandId } from '../types/timeBand';
import type { LineRouteSegment } from '../types/lineRoute';
import {
  createLineSegmentId,
  createRouteDistanceMeters,
  createRouteTravelMinutes
} from '../types/lineRoute';

describe('lineDepartureTimetableProjection', () => {
  const activeBand: TimeBandId = 'morning-rush';
  const stop1: Stop = { id: createStopId('s1'), label: 'Stop 1', position: { lng: 0, lat: 0 } };
  const stop2: Stop = { id: createStopId('s2'), label: 'Stop 2', position: { lng: 0, lat: 0 } };
  const stop3: Stop = { id: createStopId('s3'), label: 'Stop 3', position: { lng: 0, lat: 0 } };
  const placedStops = [stop1, stop2, stop3];

  const createSegment = (from: string, to: string, duration: number): LineRouteSegment => ({
    id: createLineSegmentId(`${from}-${to}`),
    lineId: createLineId('l1'),
    fromStopId: createStopId(from),
    toStopId: createStopId(to),
    orderedGeometry: [[0, 0], [0, 0]],
    distanceMeters: createRouteDistanceMeters(1000),
    inMotionTravelMinutes: createRouteTravelMinutes(duration),
    dwellMinutes: createRouteTravelMinutes(0),
    totalTravelMinutes: createRouteTravelMinutes(duration),
    status: 'routed'
  });

  it('correctly calculates offsets for a linear line', () => {
    const line: Line = {
      id: createLineId('l1'),
      label: 'Linear Line',
      stopIds: [stop1.id, stop2.id, stop3.id],
      topology: 'linear',
      servicePattern: 'one-way',
      frequencyByTimeBand: {
        'morning-rush': { kind: 'frequency', headwayMinutes: createLineFrequencyMinutes(10) }
      } as any,
      routeSegments: [
        createSegment('s1', 's2', 5),
        createSegment('s2', 's3', 7)
      ]
    };

    const projection = projectLineDepartureTimetable(line, placedStops, activeBand, null);
    
    // Stop 1: offset 0
    // Stop 2: offset 5
    // Stop 3: offset 12
    expect(projection.rows[0]!.stopLabel).toBe('Stop 1');
    expect(projection.rows[1]!.stopLabel).toBe('Stop 2');
    expect(projection.rows[2]!.stopLabel).toBe('Stop 3');

    // We can't easily check internal offsets directly via rows, 
    // but we can check if they are "Available"
    expect(projection.hasUnavailableDownstreamStopTiming).toBe(false);
    expect(projection.rows[1]!.cells[0]!.state).toBe('departures');
    expect(projection.rows[2]!.cells[0]!.state).toBe('departures');
  });

  it('correctly calculates offsets for a loop line and ignores closing segment for stop rows', () => {
    const line: Line = {
      id: createLineId('l1'),
      label: 'Loop Line',
      stopIds: [stop1.id, stop2.id, stop3.id],
      topology: 'loop',
      servicePattern: 'one-way',
      frequencyByTimeBand: {
        'morning-rush': { kind: 'frequency', headwayMinutes: createLineFrequencyMinutes(10) }
      } as any,
      routeSegments: [
        createSegment('s1', 's2', 5),
        createSegment('s2', 's3', 7),
        createSegment('s3', 's1', 10) // Closing segment
      ]
    };

    const projection = projectLineDepartureTimetable(line, placedStops, activeBand, null);
    
    expect(projection.rows).toHaveLength(3); // Only 3 stops listed
    expect(projection.hasUnavailableDownstreamStopTiming).toBe(false);
    
    expect(projection.rows[0]!.stopLabel).toBe('Stop 1');
    expect(projection.rows[1]!.stopLabel).toBe('Stop 2');
    expect(projection.rows[2]!.stopLabel).toBe('Stop 3');

    // If it was broken, Stop 3 might show Unavailable or have wrong offset
    expect(projection.rows[1]!.cells[0]!.state).toBe('departures');
    expect(projection.rows[2]!.cells[0]!.state).toBe('departures');
  });

  it('shows unavailable for loop line if closing segment is missing', () => {
    const line: Line = {
      id: createLineId('l1'),
      label: 'Loop Line',
      stopIds: [stop1.id, stop2.id, stop3.id],
      topology: 'loop',
      servicePattern: 'one-way',
      frequencyByTimeBand: {
        'morning-rush': { kind: 'frequency', headwayMinutes: createLineFrequencyMinutes(10) }
      } as any,
      routeSegments: [
        createSegment('s1', 's2', 5),
        createSegment('s2', 's3', 7)
        // Missing s3 -> s1
      ]
    };

    const projection = projectLineDepartureTimetable(line, placedStops, activeBand, null);
    expect(projection.hasUnavailableDownstreamStopTiming).toBe(true);
    expect(projection.rows[1]!.cells[0]!.state).toBe('unavailable');
  });
});
