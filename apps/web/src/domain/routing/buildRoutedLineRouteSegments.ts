import { toLineRouteGeometry } from './lineRouteGeometryMapping';
import { DEFAULT_ROUTE_DWELL_MINUTES_PER_SEGMENT } from '../constants/routing';
import type { LineId } from '../types/line';
import {
  createLineSegmentId,
  createRouteDistanceMeters,
  createRouteTravelMinutes,
  type LineRouteSegment,
  type RouteGeometryCoordinate
} from '../types/lineRoute';
import type { Stop, StopId } from '../types/stop';
import {
  buildFallbackSingleRouteSegment,
  type FallbackLineClosureMode
} from './fallbackLineRouting';
import type { ResolvedRouteSegment, RoutingAdapter } from './RoutingAdapter';

/**
 * Input for building routed line route segments.
 */
export interface BuildRoutedLineRouteSegmentsInput {
  readonly lineId: LineId;
  readonly orderedStopIds: readonly StopId[];
  readonly placedStops: readonly Stop[];
  readonly routingAdapter: RoutingAdapter;
  readonly closureMode?: FallbackLineClosureMode;
}

/**
 * Result of building routed line route segments.
 */
export interface BuildRoutedLineRouteSegmentsResult {
  readonly routeSegments: readonly LineRouteSegment[];
  readonly routedSegmentCount: number;
  readonly fallbackSegmentCount: number;
}

/**
 * Maps a successful adapter route segment to a canonical line route segment.
 *
 * @param lineId - The ID of the line.
 * @param segmentIndex - The 0-based index of the segment.
 * @param fromStopId - The origin stop ID.
 * @param toStopId - The destination stop ID.
 * @param resolved - The resolved route segment from the adapter.
 * @returns A canonical line route segment with `routed` status.
 */
export const mapResolvedRouteSegmentToLineRouteSegment = (
  lineId: LineId,
  segmentIndex: number,
  fromStopId: StopId,
  toStopId: StopId,
  resolved: ResolvedRouteSegment
): LineRouteSegment => {
  const inMotionTravelMinutes = createRouteTravelMinutes(resolved.durationSeconds / 60);
  const dwellMinutes = createRouteTravelMinutes(DEFAULT_ROUTE_DWELL_MINUTES_PER_SEGMENT);
  const totalTravelMinutes = createRouteTravelMinutes(inMotionTravelMinutes + dwellMinutes);

  return {
    id: createLineSegmentId(`${lineId}-segment-${segmentIndex + 1}`),
    lineId,
    fromStopId,
    toStopId,
    orderedGeometry: toLineRouteGeometry(resolved.geometry.coordinates),
    distanceMeters: createRouteDistanceMeters(resolved.distanceMeters),
    inMotionTravelMinutes,
    dwellMinutes,
    totalTravelMinutes,
    status: 'routed'
  };
};

/**
 * Attempts to build routed line route segments using an external routing adapter.
 * Falls back to deterministic fallback segments for any segment that fails to route.
 *
 * @param input - The line configuration and routing adapter.
 * @returns A result containing the built segments and counts of routed vs fallback segments.
 */
export async function buildRoutedLineRouteSegments(
  input: BuildRoutedLineRouteSegmentsInput
): Promise<BuildRoutedLineRouteSegmentsResult> {
  const { lineId, orderedStopIds, placedStops, routingAdapter, closureMode = 'open' } = input;

  if (orderedStopIds.length < 2) {
    throw new Error('Routing requires at least two ordered stops.');
  }

  const stopLookup = new Map(placedStops.map((s) => [s.id, s]));

  // Handle closure if requested (circular line)
  const shouldClose = closureMode === 'closed' && 
    orderedStopIds.length >= 2 && 
    orderedStopIds[0] !== orderedStopIds[orderedStopIds.length - 1];

  const effectiveStopIds = shouldClose 
    ? [...orderedStopIds, orderedStopIds[0]] 
    : orderedStopIds;

  const routeSegments: LineRouteSegment[] = [];
  let routedSegmentCount = 0;
  let fallbackSegmentCount = 0;

  for (let i = 0; i < effectiveStopIds.length - 1; i++) {
    const fromStopId = effectiveStopIds[i];
    const toStopId = effectiveStopIds[i + 1];

    if (!fromStopId || !toStopId) {
      throw new Error('Routing encountered a missing stop ID in the sequence.');
    }

    const fromStop = stopLookup.get(fromStopId);
    const toStop = stopLookup.get(toStopId);

    if (!fromStop || !toStop) {
      throw new Error(`Routing could not resolve stop IDs: ${fromStopId} -> ${toStopId}`);
    }

    const result = await routingAdapter.resolveSegment({
      originLng: fromStop.position.lng,
      originLat: fromStop.position.lat,
      destinationLng: toStop.position.lng,
      destinationLat: toStop.position.lat,
    });

    if (result.type === 'resolved') {
      routeSegments.push(mapResolvedRouteSegmentToLineRouteSegment(lineId, i, fromStopId, toStopId, result));
      routedSegmentCount++;
    } else {
      routeSegments.push(buildFallbackSingleRouteSegment(lineId, i, fromStop, toStop));
      fallbackSegmentCount++;
    }
  }

  return {
    routeSegments,
    routedSegmentCount,
    fallbackSegmentCount,
  };
}
