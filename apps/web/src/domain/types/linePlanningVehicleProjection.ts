import type { LineFrequencyMinutes, LineId } from './line';
import type { RouteTravelTimeSeconds } from './routeBaseline';
import type { TimeBandId } from './timeBand';

/**
 * Branded projected vehicle count, constrained to non-negative finite integers.
 */
export type ProjectedVehicleCount = number & { readonly __brand: 'ProjectedVehicleCount' };

export type VehicleProjectionStatus =
  | 'ready'
  | 'no-service'
  | 'unconfigured'
  | 'route-unavailable'
  | 'fallback-route';

export interface VehicleProjectionWarning {
  readonly type: 'fallback-routing';
}

export interface LineBandVehicleProjection {
  readonly lineId: LineId;
  readonly timeBandId: TimeBandId;
  readonly serviceState: 'unset' | 'no-service' | 'frequency';
  readonly headwayMinutes?: LineFrequencyMinutes;
  readonly roundTripSeconds?: RouteTravelTimeSeconds;
  readonly projectedVehicles?: ProjectedVehicleCount;
  readonly status: VehicleProjectionStatus;
  readonly warnings: readonly VehicleProjectionWarning[];
}

export interface LinePlanningVehicleProjection {
  readonly lineId: LineId;
  readonly bands: readonly LineBandVehicleProjection[];
  readonly maxProjectedVehicles: ProjectedVehicleCount;
  readonly totalConfiguredBands: number;
  readonly totalNoServiceBands: number;
  readonly totalUnconfiguredBands: number;
  readonly hasFallbackRouteWarning: boolean;
}

/**
 * Creates a branded projected vehicle count from a non-negative finite numeric input.
 */
export const createProjectedVehicleCount = (rawCount: number): ProjectedVehicleCount => {
  if (!Number.isFinite(rawCount) || rawCount < 0 || !Number.isInteger(rawCount)) {
    throw new Error('Projected vehicle count must be a non-negative finite integer.');
  }

  return rawCount as ProjectedVehicleCount;
};
