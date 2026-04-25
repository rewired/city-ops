import type { TimeBandId } from './timeBand';

/** Supported per-cell timetable rendering states for stop/hour departure values. */
export type TimetableCellState = 'departures' | 'no-service' | 'unavailable' | 'unconfigured';

/** One time-band cell for one stop row. */
export interface LineDepartureTimetableCell {
  /** Canonical time band id for this cell. */
  readonly timeBandId: TimeBandId;
  /** Ordered formatted minute values (e.g. '05', '10') for departures in this band. */
  readonly departureMinuteLabels: readonly string[];
  /** Player-facing rendering state for this stop/band cell. */
  readonly state: TimetableCellState;
  /** Optional concise explanation when the cell has no departures. */
  readonly note: string | null;
}

/** One stop row in the departures matrix. */
export interface LineDepartureTimetableRow {
  /** Stop identifier label shown in the first timetable column. */
  readonly stopLabel: string;
  /** Ordered time-band cells matching the canonical column definitions. */
  readonly cells: readonly LineDepartureTimetableCell[];
}

/** Compact service-state summary for the currently active canonical time band. */
export interface ActiveServiceBandSummary {
  /** Active time-band id resolved from simulation state. */
  readonly activeTimeBandId: TimeBandId;
  /** Display label for the active canonical time band. */
  readonly activeTimeBandLabel: string;
  /** Display window (`HH:MM–HH:MM`) for the active canonical time band. */
  readonly activeWindowLabel: string;
  /** Player-facing service state summary for the active time band. */
  readonly activeServiceLabel: string;
}

/** Compact route baseline support block for timetable rendering. */
export interface TimetableRouteBaselineSummary {
  /** Route segment count from selected-line baseline data. */
  readonly segmentCount: number;
  /** Total selected-line route runtime in minutes. */
  readonly totalLineMinutes: number;
  /** Compact route timing/routing status label. */
  readonly routingStatusLabel: string;
  /** Optional fallback warning shown when baseline includes fallback-routed segments. */
  readonly fallbackWarning: string | null;
}

/** Projection-wide notice surfaced only when player-facing clarification is required. */
export interface LineDepartureTimetableNotice {
  /** Compact notice string for the departures modal note area. */
  readonly message: string;
}

/** Deterministic timetable matrix projection consumed by the Departures dialog. */
export interface LineDepartureTimetableProjection {
  /** Selected line display label. */
  readonly lineLabel: string;
  /** Active service band summary from current simulation state. */
  readonly activeServiceSummary: ActiveServiceBandSummary;
  /** Ordered timetable column headers derived from canonical definitions. */
  readonly bandColumns: readonly {
    readonly id: TimeBandId;
    readonly label: string;
    readonly windowLabel: string;
  }[];
  /** Ordered timetable rows, one per selected-line stop. */
  readonly rows: readonly LineDepartureTimetableRow[];
  /** Route baseline summary shown when route data is available. */
  readonly routeBaselineSummary: TimetableRouteBaselineSummary | null;
  /** Optional concise notes for no-service/unavailable/unconfigured constraints. */
  readonly notices: readonly LineDepartureTimetableNotice[];
  /** True when segment timing cannot provide truthful downstream stop offsets. */
  readonly hasUnavailableDownstreamStopTiming: boolean;
}

/** Compact route timing status aggregate for selected-line baseline segments. */
export type RouteTimingStatus = 'routed' | 'fallback-routed' | 'not-routed' | 'routing-failed';

