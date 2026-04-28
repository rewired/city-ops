import {
  LINE_BUILD_PLACEHOLDER_LABEL_PREFIX,
  MINIMUM_STOPS_REQUIRED_TO_COMPLETE_LINE
} from '../domain/constants/lineBuilding';
import { completeLineRouting } from '../domain/routing/completeLineRouting';
import type { RoutingAdapter } from '../domain/routing/RoutingAdapter';
import type { Line, LineServicePattern, LineTopology } from '../domain/types/line';
import { createLineId, createNoServiceLineServiceByTimeBand } from '../domain/types/line';
import type { Stop, StopId } from '../domain/types/stop';
import { generateLineLabel, generateUniqueLineLabel } from '../domain/line/lineLabeling';

/**
 * Input arguments for preparing a completed draft line.
 */
export interface PrepareCompletedDraftLineInput {
  /** The ordered sequence of stop IDs in the draft line. */
  readonly draftStopIds: readonly StopId[];
  /** All placed stops available in the session. */
  readonly placedStops: readonly Stop[];
  /** All existing completed lines in the session. */
  readonly existingLines: readonly Line[];
  /** The chosen line topology (e.g., bidirectional, round-robin). */
  readonly topology: LineTopology;
  /** The chosen service pattern (e.g., all-stops, express). */
  readonly servicePattern: LineServicePattern;
  /** The routing adapter used to compute travel times and paths between stops. */
  readonly routingAdapter: RoutingAdapter;
}

/**
 * Prepares a completed Line from a snapshotted map-workspace draft.
 * This handles deriving the line ID, calculating route paths, generating labels,
 * and initializing service patterns.
 *
 * @param input The structured parameters required to orchestrate line creation.
 * @returns A promise resolving to the fully constructed canonical Line.
 * @throws {Error} If the draft line does not contain the minimum number of stops required.
 */
export async function prepareCompletedDraftLine(input: PrepareCompletedDraftLineInput): Promise<Line> {
  const {
    draftStopIds,
    placedStops,
    existingLines,
    topology,
    servicePattern,
    routingAdapter
  } = input;

  if (draftStopIds.length < MINIMUM_STOPS_REQUIRED_TO_COMPLETE_LINE) {
    throw new Error(
      `Cannot complete line: at least ${MINIMUM_STOPS_REQUIRED_TO_COMPLETE_LINE} stops are required, but got ${draftStopIds.length}.`
    );
  }

  // 1. Snapshot draft, ordinal, and placed stops to ensure async safety
  const snapshottedStopIds = [...draftStopIds];
  const snapshottedOrdinal = existingLines.length + 1;
  const snapshottedPlacedStops = [...placedStops];
  const nextCreatedLineId = createLineId(`line-${snapshottedOrdinal}`);

  // 2. Resolve route segments (async, street-routed if available)
  const routingResult = await completeLineRouting({
    lineId: nextCreatedLineId,
    orderedStopIds: snapshottedStopIds,
    placedStops: snapshottedPlacedStops,
    topology,
    servicePattern,
    routingAdapter
  });

  // 3. Generate deterministic line label from stop labels
  const lineStops = snapshottedStopIds
    .map(id => snapshottedPlacedStops.find(s => s.id === id))
    .filter((s): s is Stop => !!s);
  
  const baseLabel = generateLineLabel(lineStops, topology, servicePattern) 
    ?? `${LINE_BUILD_PLACEHOLDER_LABEL_PREFIX} ${snapshottedOrdinal}`;
  
  const finalLabel = generateUniqueLineLabel({
    baseLabel,
    existingLines
  });

  // 4. Construct the canonical Line
  const createdLine: Line = {
    id: nextCreatedLineId,
    label: finalLabel,
    stopIds: snapshottedStopIds,
    topology,
    servicePattern,
    routeSegments: routingResult.routeSegments,
    reverseRouteSegments: routingResult.reverseRouteSegments,
    frequencyByTimeBand: createNoServiceLineServiceByTimeBand()
  };

  return createdLine;
}
