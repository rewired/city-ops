import {
  TIME_BAND_DEFINITIONS,
  TIME_BAND_DISPLAY_LABELS,
  formatTimeBandWindow,
  resolveTimeBandIdForMinuteOfDay
} from '../constants/timeBands';
import type { RouteBaselineAggregateMetrics } from './useNetworkPlanningProjections';
import type { Line, LineServiceBandPlan } from '../types/line';
import type { LineRouteSegment } from '../types/lineRoute';
import type {
  ActiveServiceBandSummary,
  LineDepartureTimetableCell,
  LineDepartureTimetableNotice,
  LineDepartureTimetableProjection,
  LineDepartureTimetableRow,
  RouteTimingStatus,
  TimetableRouteBaselineSummary
} from '../types/lineDepartureTimetableProjection';
import type { Stop } from '../types/stop';
import { createMinuteOfDay, type TimeBandId } from '../types/timeBand';
import type { LineRouteBaseline } from '../types/routeBaseline';

const HOURS_PER_DAY = 24;
const ROUTE_TIMING_STATUS_LABELS: Readonly<Record<string, string>> = {
  'not-routed': 'Not routed',
  routed: 'Routed',
  'fallback-routed': 'Fallback routed',
  'routing-failed': 'Routing failed',
  partial: 'Partial routing',
  unresolved: 'Unresolved'
};

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR;

const toMinuteWithinHour = (minuteOfDay: number): number => minuteOfDay % MINUTES_PER_HOUR;

const normalizeMinute = (minuteOfDay: number): number => ((minuteOfDay % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;

const formatDepartureMinute = (minuteOfDay: number): string =>
  String(Math.round(minuteOfDay) % MINUTES_PER_HOUR).padStart(2, '0');

const resolveBandMinutes = (
  startMinuteOfDay: number,
  endMinuteOfDay: number
): readonly number[] => {
  const minutes: number[] = [];

  if (startMinuteOfDay < endMinuteOfDay) {
    for (let minute = startMinuteOfDay; minute < endMinuteOfDay; minute += 1) {
      minutes.push(minute);
    }
    return minutes;
  }

  for (let minute = startMinuteOfDay; minute < MINUTES_PER_DAY; minute += 1) {
    minutes.push(minute);
  }
  for (let minute = 0; minute < endMinuteOfDay; minute += 1) {
    minutes.push(minute);
  }

  return minutes;
};

const addFrequencyBandDepartures = (
  departuresByMinute: boolean[],
  bandStartMinute: number,
  bandEndMinute: number,
  headwayMinutes: number
): void => {
  const bandMinutes = resolveBandMinutes(bandStartMinute, bandEndMinute);
  if (bandMinutes.length === 0) {
    return;
  }

  const firstMinute = bandMinutes[0];
  if (firstMinute === undefined) {
    return;
  }

  for (
    let departureMinute = firstMinute;
    departureMinute < firstMinute + bandMinutes.length;
    departureMinute += headwayMinutes
  ) {
    departuresByMinute[normalizeMinute(departureMinute)] = true;
  }
};

const projectOriginDepartures = (
  frequencyByTimeBand: Line['frequencyByTimeBand']
): { readonly originMinutes: readonly number[]; readonly hasUnconfiguredBands: boolean } => {
  const departuresByMinute = Array.from({ length: MINUTES_PER_DAY }, () => false);
  let hasUnconfiguredBands = false;

  for (const definition of TIME_BAND_DEFINITIONS) {
    const bandPlan = frequencyByTimeBand[definition.id] as LineServiceBandPlan | undefined;
    if (!bandPlan) {
      hasUnconfiguredBands = true;
      continue;
    }

    if (bandPlan.kind !== 'frequency') {
      continue;
    }

    addFrequencyBandDepartures(
      departuresByMinute,
      definition.startMinuteOfDay,
      definition.endMinuteOfDay,
      bandPlan.headwayMinutes
    );
  }

  const originMinutes: number[] = [];
  for (let minuteOfDay = 0; minuteOfDay < MINUTES_PER_DAY; minuteOfDay += 1) {
    if (departuresByMinute[minuteOfDay]) {
      originMinutes.push(minuteOfDay);
    }
  }

  return {
    originMinutes,
    hasUnconfiguredBands
  };
};

const resolveStopLabels = (line: Line, placedStops: readonly Stop[]): readonly string[] => {
  const stopLabelById = new Map(placedStops.map((stop) => [stop.id, stop.label]));
  return line.stopIds.map((stopId) => stopLabelById.get(stopId) ?? stopId);
};

const resolveStopOffsets = (line: Line): readonly number[] | null => {
  if (line.stopIds.length === 0) {
    return [];
  }

  const isLoop = line.topology === 'loop';
  const expectedSegmentCount = isLoop ? line.stopIds.length : Math.max(0, line.stopIds.length - 1);

  if (line.routeSegments.length !== expectedSegmentCount) {
    return null;
  }

  const offsets: number[] = [0];
  let cumulativeMinutes = 0;

  // For both linear and loop, we only need offsets for the N listed stops.
  // stop[0] is at 0.
  // stop[1] is after segment 0.
  // ...
  // stop[N-1] is after segment N-2.
  // In a loop, segment N-1 closes the loop back to stop[0] and is not used for stop row offsets.
  for (let index = 0; index < line.stopIds.length - 1; index += 1) {
    const segment = line.routeSegments[index];
    const expectedFrom = line.stopIds[index];
    const expectedTo = line.stopIds[index + 1];

    if (!segment || segment.fromStopId !== expectedFrom || segment.toStopId !== expectedTo) {
      return null;
    }

    cumulativeMinutes += segment.totalTravelMinutes;
    offsets.push(cumulativeMinutes);
  }

  return offsets;
};

const projectRowCells = (
  originMinutes: readonly number[],
  offsetMinutes: number,
  options: {
    readonly hasUnavailableTiming: boolean;
    readonly hasUnconfiguredBands: boolean;
  }
): readonly LineDepartureTimetableCell[] =>
  TIME_BAND_DEFINITIONS.map((definition) => {
    if (options.hasUnavailableTiming) {
      return {
        timeBandId: definition.id,
        departureMinuteLabels: [],
        state: 'unavailable',
        note: 'Stop timing unavailable'
      } satisfies LineDepartureTimetableCell;
    }

    const bandMinuteLabels = new Set<string>();
    
    for (const originMinute of originMinutes) {
      const shiftedMinute = normalizeMinute(originMinute + offsetMinutes);
      const roundedShiftedMinute = Math.round(shiftedMinute);
      const normalizedRounded = normalizeMinute(roundedShiftedMinute);
      const bandId = resolveTimeBandIdForMinuteOfDay(createMinuteOfDay(normalizedRounded), TIME_BAND_DEFINITIONS);
      if (bandId === definition.id) {
        bandMinuteLabels.add(formatDepartureMinute(shiftedMinute));
      }
    }

    const sortedLabels = [...bandMinuteLabels].sort((a, b) => Number(a) - Number(b));

    if (sortedLabels.length > 0) {
      return {
        timeBandId: definition.id,
        departureMinuteLabels: sortedLabels,
        state: 'departures',
        note: null
      } satisfies LineDepartureTimetableCell;
    }

    if (options.hasUnconfiguredBands) {
      return {
        timeBandId: definition.id,
        departureMinuteLabels: [],
        state: 'unconfigured',
        note: 'Service configuration needed'
      } satisfies LineDepartureTimetableCell;
    }

    return {
      timeBandId: definition.id,
      departureMinuteLabels: [],
      state: 'no-service',
      note: null
    } satisfies LineDepartureTimetableCell;
  });

const resolveActiveBandSummary = (
  line: Line,
  activeTimeBandId: TimeBandId
): ActiveServiceBandSummary => {
  const activeDefinition = TIME_BAND_DEFINITIONS.find((definition) => definition.id === activeTimeBandId);
  if (!activeDefinition) {
    throw new Error(`Missing canonical time-band definition for ${activeTimeBandId}.`);
  }

  const activeBandPlan = line.frequencyByTimeBand[activeTimeBandId] as LineServiceBandPlan | undefined;
  const activeServiceLabel = !activeBandPlan
    ? 'configuration needed'
    : activeBandPlan.kind === 'frequency'
      ? `every ${activeBandPlan.headwayMinutes} min`
      : 'no service';

  return {
    activeTimeBandId,
    activeTimeBandLabel: TIME_BAND_DISPLAY_LABELS[activeTimeBandId],
    activeWindowLabel: formatTimeBandWindow(activeDefinition),
    activeServiceLabel
  };
};

const projectRouteBaselineSummary = (
  baseline: LineRouteBaseline | null
): TimetableRouteBaselineSummary | null => {
  if (!baseline) {
    return null;
  }

  return {
    segmentCount: baseline.segments.length,
    totalLineMinutes: baseline.totalTravelTimeSeconds / 60,
    routingStatusLabel: ROUTE_TIMING_STATUS_LABELS[baseline.status] ?? 'Unknown',
    fallbackWarning: baseline.warnings.some((w) => w.type === 'fallback-routing' || w.type === 'partial-unresolved')
      ? 'Fallback routing is active for at least one segment. Downstream times are baseline estimates.'
      : null
  };
};

/**
 * Projects a full 24-hour stop-by-hour departures matrix for one selected line.
 */
export const projectLineDepartureTimetable = (
  line: Line,
  placedStops: readonly Stop[],
  activeTimeBandId: TimeBandId,
  selectedLineRouteBaseline: LineRouteBaseline | null
): LineDepartureTimetableProjection => {
  const stopLabels = resolveStopLabels(line, placedStops);
  const stopOffsets = resolveStopOffsets(line);
  const originDepartureProjection = projectOriginDepartures(line.frequencyByTimeBand);
  const hasUnavailableDownstreamStopTiming = stopOffsets === null && line.stopIds.length > 1;

  const rows: LineDepartureTimetableRow[] = stopLabels.map((stopLabel, index) => {
    const isOrigin = index === 0;
    const offsetMinutes = stopOffsets?.[index] ?? 0;

    return {
      stopLabel,
      cells: projectRowCells(originDepartureProjection.originMinutes, offsetMinutes, {
        hasUnavailableTiming: hasUnavailableDownstreamStopTiming && !isOrigin,
        hasUnconfiguredBands: originDepartureProjection.hasUnconfiguredBands
      })
    };
  });

  const bandColumns = TIME_BAND_DEFINITIONS.map((definition) => ({
    id: definition.id,
    label: definition.label,
    windowLabel: formatTimeBandWindow(definition)
  }));

  const notices: LineDepartureTimetableNotice[] = [];
  if (originDepartureProjection.hasUnconfiguredBands) {
    notices.push({ message: 'At least one service band is unconfigured. Configure service to populate departures.' });
  }
  if (hasUnavailableDownstreamStopTiming) {
    notices.push({
      message:
        'Stop-level downstream departure times are unavailable because segment-level route timing is incomplete. Origin departures are shown.'
    });
  }

  return {
    lineLabel: line.label,
    activeServiceSummary: resolveActiveBandSummary(line, activeTimeBandId),
    bandColumns,
    rows,
    routeBaselineSummary: projectRouteBaselineSummary(selectedLineRouteBaseline),
    notices,
    hasUnavailableDownstreamStopTiming
  };
};
