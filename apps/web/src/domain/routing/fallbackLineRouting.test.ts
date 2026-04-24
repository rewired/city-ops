import { describe, expect, it } from 'vitest';

import { createLineId } from '../types/line';
import { createStopId, type Stop } from '../types/stop';
import { buildFallbackLineRouteSegments } from './fallbackLineRouting';

const lineId = createLineId('line-1');

const createTestStop = (rawStopId: string, lng: number, lat: number): Stop => ({
  id: createStopId(rawStopId),
  position: { lng, lat },
  label: rawStopId
});

const stopA = createTestStop('stop-a', 9.99, 53.55);
const stopB = createTestStop('stop-b', 10.0, 53.56);
const stopC = createTestStop('stop-c', 10.01, 53.57);

const placedStops: readonly Stop[] = [stopA, stopB, stopC];

describe('buildFallbackLineRouteSegments', () => {
  it('creates one segment for a two-stop line', () => {
    const segments = buildFallbackLineRouteSegments({
      lineId,
      orderedStopIds: [stopA.id, stopB.id],
      placedStops
    });

    expect(segments).toHaveLength(1);
    expect(segments[0]).toMatchObject({
      lineId,
      fromStopId: stopA.id,
      toStopId: stopB.id,
      status: 'fallback-routed'
    });
  });

  it('creates ordered multi-segment output for a three-stop line', () => {
    const segments = buildFallbackLineRouteSegments({
      lineId,
      orderedStopIds: [stopA.id, stopB.id, stopC.id],
      placedStops
    });

    expect(segments).toHaveLength(2);
    expect(segments.map((segment) => [segment.fromStopId, segment.toStopId])).toEqual([
      [stopA.id, stopB.id],
      [stopB.id, stopC.id]
    ]);
  });

  it('returns deterministic segment ids and order for identical inputs', () => {
    const firstResult = buildFallbackLineRouteSegments({
      lineId,
      orderedStopIds: [stopA.id, stopB.id, stopC.id],
      placedStops
    });
    const secondResult = buildFallbackLineRouteSegments({
      lineId,
      orderedStopIds: [stopA.id, stopB.id, stopC.id],
      placedStops
    });

    expect(firstResult.map((segment) => segment.id)).toEqual(secondResult.map((segment) => segment.id));
    expect(firstResult).toEqual(secondResult);
    expect(firstResult.map((segment) => segment.id)).toEqual([
      `${lineId}-segment-1`,
      `${lineId}-segment-2`
    ]);
  });

  it('supports total distance and travel-time aggregation over all segments', () => {
    const segments = buildFallbackLineRouteSegments({
      lineId,
      orderedStopIds: [stopA.id, stopB.id, stopC.id],
      placedStops
    });

    const totalDistanceMeters = segments.reduce((total, segment) => total + segment.distanceMeters, 0);
    const totalInMotionMinutes = segments.reduce((total, segment) => total + segment.inMotionTravelMinutes, 0);
    const totalDwellMinutes = segments.reduce((total, segment) => total + segment.dwellMinutes, 0);
    const totalTravelMinutes = segments.reduce((total, segment) => total + segment.totalTravelMinutes, 0);

    expect(totalDistanceMeters).toBeGreaterThan(0);
    expect(totalInMotionMinutes).toBeGreaterThan(0);
    expect(totalDwellMinutes).toBeGreaterThan(0);
    expect(totalTravelMinutes).toBeCloseTo(totalInMotionMinutes + totalDwellMinutes, 10);
  });

  it('preserves fallback status for every generated segment', () => {
    const segments = buildFallbackLineRouteSegments({
      lineId,
      orderedStopIds: [stopA.id, stopB.id, stopC.id],
      placedStops
    });

    expect(segments.every((segment) => segment.status === 'fallback-routed')).toBe(true);
  });

  it('fails explicitly for insufficient ordered stop sequences', () => {
    expect(() =>
      buildFallbackLineRouteSegments({
        lineId,
        orderedStopIds: [stopA.id],
        placedStops
      })
    ).toThrowError('Fallback routing requires at least two ordered stops.');
  });
});
