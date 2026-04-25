import { calculateGreatCircleDistanceMeters, type GeometryCoordinate } from '../../lib/geometry';
import { STOP_ACCESS_RADIUS_METERS } from '../constants/demand';
import type { DemandNode, DemandNodeId, DemandWeight } from '../types/demandNode';
import { createDemandWeight } from '../types/demandNode';
import type { Stop, StopId } from '../types/stop';
import type { TimeBandId } from '../types/timeBand';

/**
 * Deterministic projection of demand nodes captured by a specific stop within the access radius.
 */
export interface StopDemandCatchment {
  readonly stopId: StopId;
  readonly capturedDemandNodeIds: readonly DemandNodeId[];
  readonly residentialOriginWeightByTimeBand: Readonly<Record<TimeBandId, DemandWeight>>;
  readonly workplaceDestinationWeightByTimeBand: Readonly<Record<TimeBandId, DemandWeight>>;
}

const toGeometryCoordinate = (stopOrNode: { readonly position: { readonly lng: number; readonly lat: number } }): GeometryCoordinate =>
  [stopOrNode.position.lng, stopOrNode.position.lat];

/**
 * Computes stop catchments for a set of stops and demand nodes based on the centralized MVP access radius.
 * Determines which demand nodes fall within the radius of each stop, and aggregates their weights by time band.
 */
export const calculateStopCatchments = (
  stops: readonly Stop[],
  demandNodes: readonly DemandNode[]
): readonly StopDemandCatchment[] => {
  return stops.map((stop) => {
    const stopCoordinate = toGeometryCoordinate(stop);
    
    const capturedNodes = demandNodes.filter(
      (node) => calculateGreatCircleDistanceMeters(stopCoordinate, toGeometryCoordinate(node)) <= STOP_ACCESS_RADIUS_METERS
    );

    const capturedDemandNodeIds = capturedNodes.map((node) => node.id);

    const residentialOriginWeightByTimeBand: Record<TimeBandId, DemandWeight> = {};
    const workplaceDestinationWeightByTimeBand: Record<TimeBandId, DemandWeight> = {};

    for (const node of capturedNodes) {
      if (node.demandClass === 'residential' && node.role === 'origin') {
        for (const [timeBandId, weight] of Object.entries(node.weightByTimeBand)) {
          const current = residentialOriginWeightByTimeBand[timeBandId as TimeBandId] || 0;
          residentialOriginWeightByTimeBand[timeBandId as TimeBandId] = createDemandWeight(current + weight);
        }
      } else if (node.demandClass === 'workplace' && node.role === 'destination') {
        for (const [timeBandId, weight] of Object.entries(node.weightByTimeBand)) {
          const current = workplaceDestinationWeightByTimeBand[timeBandId as TimeBandId] || 0;
          workplaceDestinationWeightByTimeBand[timeBandId as TimeBandId] = createDemandWeight(current + weight);
        }
      }
    }

    return {
      stopId: stop.id,
      capturedDemandNodeIds,
      residentialOriginWeightByTimeBand,
      workplaceDestinationWeightByTimeBand
    };
  });
};
