import type { LineId } from '../types/line';
import {
  createBaselineRouteTravelTiming,
  createLineSegmentId,
  createRouteDistanceMeters,
  type LineRouteSegment,
  type RouteGeometryCoordinate
} from '../types/lineRoute';
import type { Stop, StopId } from '../types/stop';

import { calculateGreatCircleDistanceMeters } from '../../lib/geometry';

/**
 * Explicit closure semantics for fallback segment generation.
 * - `open`: only consecutive stop pairs are routed.
 * - `closed`: adds a final segment from the last stop to the first stop when not already explicitly repeated.
 */
export type FallbackLineClosureMode = 'open' | 'closed';

/**
 * Input contract for deterministic fallback route segment generation from an ordered stop sequence.
 */
export interface BuildFallbackLineRouteSegmentsInput {
  readonly lineId: LineId;
  readonly orderedStopIds: readonly StopId[];
  readonly placedStops: readonly Stop[];
  readonly closureMode?: FallbackLineClosureMode;
}

const toStopLookup = (placedStops: readonly Stop[]): ReadonlyMap<StopId, Stop> =>
  new Map(placedStops.map((stop) => [stop.id, stop]));

const toGeometryCoordinate = (stop: Stop): RouteGeometryCoordinate => [stop.position.lng, stop.position.lat];

const shouldAppendClosureSegment = (orderedStopIds: readonly StopId[], closureMode: FallbackLineClosureMode): boolean => {
  if (closureMode !== 'closed' || orderedStopIds.length < 2) {
    return false;
  }

  return orderedStopIds[0] !== orderedStopIds[orderedStopIds.length - 1];
};

/**
 * Builds a single deterministic fallback route segment between two stops.
 *
 * @param lineId - The ID of the line the segment belongs to.
 * @param segmentIndex - The 0-based index of the segment in the line sequence.
 * @param fromStop - The origin stop.
 * @param toStop - The destination stop.
 * @returns A canonical line route segment with `fallback-routed` status.
 */
export const buildFallbackSingleRouteSegment = (
  lineId: LineId,
  segmentIndex: number,
  fromStop: Stop,
  toStop: Stop
): LineRouteSegment => {
  const fromCoordinate = toGeometryCoordinate(fromStop);
  const toCoordinate = toGeometryCoordinate(toStop);
  const orderedGeometry: readonly RouteGeometryCoordinate[] = [fromCoordinate, toCoordinate];
  const distanceMeters = createRouteDistanceMeters(calculateGreatCircleDistanceMeters(fromCoordinate, toCoordinate));
  const travelTiming = createBaselineRouteTravelTiming(distanceMeters);

  return {
    id: createLineSegmentId(`${lineId}-segment-${segmentIndex + 1}`),
    lineId,
    fromStopId: fromStop.id,
    toStopId: toStop.id,
    orderedGeometry,
    distanceMeters,
    inMotionTravelMinutes: travelTiming.inMotionTravelMinutes,
    dwellMinutes: travelTiming.dwellMinutes,
    totalTravelMinutes: travelTiming.totalTravelMinutes,
    status: 'fallback-routed'
  };
};

/**
 * Builds deterministic fallback route segments from ordered stops.
 *
 * Validation invariants:
 * - at least two ordered stops are required
 * - every ordered stop id must resolve to a placed stop with coordinates
 *
 * Segment semantics:
 * - one segment is created per consecutive stop pair
 * - an explicit closure segment is added only when closure mode is `closed` and first stop is not already repeated at the end
 * - each segment receives a deterministic id derived from line id and ordered segment index
 * - geometry is a two-point fallback path from stop coordinates
 * - distance and travel times are computed from canonical routing helpers
 * - route status is always `fallback-routed`
 */
export const buildFallbackLineRouteSegments = ({
  lineId,
  orderedStopIds,
  placedStops,
  closureMode = 'open'
}: BuildFallbackLineRouteSegmentsInput): readonly LineRouteSegment[] => {
  if (orderedStopIds.length < 2) {
    throw new Error('Fallback routing requires at least two ordered stops.');
  }

  const orderedStopIdsWithClosure = shouldAppendClosureSegment(orderedStopIds, closureMode)
    ? [...orderedStopIds, orderedStopIds[0]]
    : [...orderedStopIds];
  const stopLookup = toStopLookup(placedStops);

  const segments: LineRouteSegment[] = [];

  for (let segmentIndex = 0; segmentIndex < orderedStopIdsWithClosure.length - 1; segmentIndex += 1) {
    const fromStopId = orderedStopIdsWithClosure[segmentIndex];
    const toStopId = orderedStopIdsWithClosure[segmentIndex + 1];

    if (!fromStopId || !toStopId) {
      throw new Error('Fallback routing encountered a missing ordered stop id.');
    }

    const fromStop = stopLookup.get(fromStopId);
    const toStop = stopLookup.get(toStopId);

    if (!fromStop || !toStop) {
      throw new Error('Fallback routing could not resolve all ordered stop ids to placed stops.');
    }

    segments.push(buildFallbackSingleRouteSegment(lineId, segmentIndex, fromStop, toStop));
  }

  return segments;
};
