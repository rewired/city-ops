import { SCENARIO_DEMAND_STOP_ACCESS_RADIUS_METERS } from '../constants/scenarioDemand';
import type { ScenarioDemandArtifact, ScenarioDemandNode } from '../types/scenarioDemand';
import type { Stop, StopId } from '../types/stop';
import type { Line } from '../types/line';
import type { TimeBandId } from '../types/timeBand';
import { calculateGreatCircleDistanceMeters } from '../../lib/geometry';
import { calculateActiveDemandWeight } from './demandWeight';
import { projectLineServicePlanForLine } from './lineServicePlanProjection';
import {
  SERVICE_PRESSURE_MIN_DEPARTURES_PER_HOUR_DENOMINATOR,
  SERVICE_PRESSURE_RATIO_LOW_THRESHOLD,
  SERVICE_PRESSURE_RATIO_BALANCED_THRESHOLD,
  SERVICE_PRESSURE_RATIO_HIGH_THRESHOLD
} from '../constants/lineService';
import type { ServicePressureStatus } from './servicePressureProjection';

/**
 * Status of the selected-line demand contribution projection.
 */
export type SelectedLineDemandContributionStatus = 
  | 'unavailable' 
  | 'no-service' 
  | 'no-demand' 
  | 'captures-only' 
  | 'serving' 
  | 'degraded';

/**
 * Compact line-level demand contribution projection for a selected line.
 */
export interface SelectedLineDemandContributionProjection {
  readonly lineId: string;
  readonly activeTimeBandId: TimeBandId;
  readonly status: SelectedLineDemandContributionStatus;
  
  /** Total active weight of residential origin nodes captured by this line. */
  readonly capturedResidentialActiveWeight: number;
  /** Number of residential origin nodes captured by this line. */
  readonly capturedResidentialNodeCount: number;
  /** Total active weight of workplace destination nodes captured by this line. */
  readonly capturedWorkplaceActiveWeight: number;
  /** Number of workplace destination nodes captured by this line. */
  readonly capturedWorkplaceNodeCount: number;
  
  /** Total active weight of residential origin nodes structurally served by this line. */
  readonly servedResidentialActiveWeight: number;
  /** Total active weight of residential origin nodes captured but not served by this line. */
  readonly unservedCapturedResidentialActiveWeight: number;
  /** Total active weight of workplace destination nodes reachable by active service on this line. */
  readonly reachableWorkplaceActiveWeight: number;
  
  /** Active frequency headway in minutes. */
  readonly activeHeadwayMinutes: number | null;
  /** Theoretical departures per hour estimate. */
  readonly activeDeparturesPerHourEstimate: number;
  /** Ratio of served residential active weight to departures per hour. */
  readonly servicePressureRatio: number;
  /** Classification of the service pressure ratio. */
  readonly servicePressureStatus: ServicePressureStatus;
  
  /** Concise notes explaining the projection status. */
  readonly notes: string[];
}

/**
 * Projects demand contribution for a single selected line and active time band.
 */
export function projectSelectedLineDemandContribution(
  line: Line | null,
  stops: readonly Stop[],
  artifact: ScenarioDemandArtifact | null,
  activeTimeBandId: TimeBandId,
  accessRadiusMeters: number = SCENARIO_DEMAND_STOP_ACCESS_RADIUS_METERS
): SelectedLineDemandContributionProjection | null {
  if (!line || !artifact) {
    return null;
  }

  const lineService = projectLineServicePlanForLine(line, stops, activeTimeBandId);
  const activeDeparturesPerHourEstimate = lineService.theoreticalDeparturesPerHour ?? 0;
  const activeHeadwayMinutes = lineService.currentBandHeadwayMinutes;

  // 1. Identify relevant demand nodes
  const residentialNodes = artifact.nodes.filter(n => n.role === 'origin' && n.class === 'residential');
  const workplaceNodes = artifact.nodes.filter(n => n.role === 'destination' && n.class === 'workplace');

  // 2. Determine nodes captured by line stops
  // We use Sets for deduplication across multiple stops of the same line
  const capturedResidentialNodeIds = new Set<string>();
  const capturedWorkplaceNodeIds = new Set<string>();
  
  // Map<StopId, { residentialNodeIds: string[], workplaceNodeIds: string[] }>
  const capturePerLineStop = new Map<StopId, { residentialNodeIds: string[]; workplaceNodeIds: string[] }>();

  for (const stopId of line.stopIds) {
    const stop = stops.find(s => s.id === stopId);
    if (!stop) continue;

    const resIds: string[] = [];
    const workIds: string[] = [];

    for (const node of residentialNodes) {
      const distance = calculateGreatCircleDistanceMeters(
        [node.position.lng, node.position.lat],
        [stop.position.lng, stop.position.lat]
      );
      if (distance <= accessRadiusMeters) {
        resIds.push(node.id);
        capturedResidentialNodeIds.add(node.id);
      }
    }

    for (const node of workplaceNodes) {
      const distance = calculateGreatCircleDistanceMeters(
        [node.position.lng, node.position.lat],
        [stop.position.lng, stop.position.lat]
      );
      if (distance <= accessRadiusMeters) {
        workIds.push(node.id);
        capturedWorkplaceNodeIds.add(node.id);
      }
    }

    capturePerLineStop.set(stopId, { residentialNodeIds: resIds, workplaceNodeIds: workIds });
  }

  // 3. Determine structural reachability
  const servedResidentialNodeIds = new Set<string>();
  const reachableWorkplaceNodeIds = new Set<string>();
  
  const { topology, servicePattern, stopIds } = line;
  const lineStopIndices = stopIds.map((id, index) => ({ id, index }));
  
  const residentialStopIndices = lineStopIndices.filter(s => (capturePerLineStop.get(s.id)?.residentialNodeIds.length ?? 0) > 0);
  const workplaceStopIndices = lineStopIndices.filter(s => (capturePerLineStop.get(s.id)?.workplaceNodeIds.length ?? 0) > 0);

  const hasActiveService = lineService.status !== 'blocked' && lineService.activeBandState === 'frequency';

  if (hasActiveService && residentialStopIndices.length > 0 && workplaceStopIndices.length > 0) {
    if (topology === 'loop' || servicePattern === 'bidirectional') {
      // Loop or Bidirectional: any residential can reach any workplace if both exist
      if (topology === 'loop' || stopIds.length >= 2) {
        residentialStopIndices.forEach(s => {
          capturePerLineStop.get(s.id)?.residentialNodeIds.forEach(id => servedResidentialNodeIds.add(id));
        });
        workplaceStopIndices.forEach(s => {
          capturePerLineStop.get(s.id)?.workplaceNodeIds.forEach(id => reachableWorkplaceNodeIds.add(id));
        });
      }
    } else {
      // Linear One-way: Si can reach Sj if i < j
      for (const resStop of residentialStopIndices) {
        const canReachAnyWorkplace = workplaceStopIndices.some(workStop => workStop.index > resStop.index);
        if (canReachAnyWorkplace) {
          capturePerLineStop.get(resStop.id)?.residentialNodeIds.forEach(id => servedResidentialNodeIds.add(id));
        }
      }
      for (const workStop of workplaceStopIndices) {
        const canBeReachedByAnyResidential = residentialStopIndices.some(resStop => resStop.index < workStop.index);
        if (canBeReachedByAnyResidential) {
          capturePerLineStop.get(workStop.id)?.workplaceNodeIds.forEach(id => reachableWorkplaceNodeIds.add(id));
        }
      }
    }
  }

  // 4. Aggregations
  const getActiveWeight = (nodes: readonly ScenarioDemandNode[], ids: Set<string>): number =>
    nodes.filter(n => ids.has(n.id)).reduce((sum, n) => sum + calculateActiveDemandWeight(n, activeTimeBandId), 0);

  const capturedResidentialActiveWeight = getActiveWeight(residentialNodes, capturedResidentialNodeIds);
  const capturedWorkplaceActiveWeight = getActiveWeight(workplaceNodes, capturedWorkplaceNodeIds);
  const servedResidentialActiveWeight = getActiveWeight(residentialNodes, servedResidentialNodeIds);
  const reachableWorkplaceActiveWeight = getActiveWeight(workplaceNodes, reachableWorkplaceNodeIds);
  const unservedCapturedResidentialActiveWeight = capturedResidentialActiveWeight - servedResidentialActiveWeight;

  // 5. Service Pressure
  const servicePressureRatio = servedResidentialActiveWeight / Math.max(
    activeDeparturesPerHourEstimate, 
    SERVICE_PRESSURE_MIN_DEPARTURES_PER_HOUR_DENOMINATOR
  );

  let servicePressureStatus: ServicePressureStatus = 'none';
  if (activeDeparturesPerHourEstimate > 0) {
    if (servicePressureRatio <= SERVICE_PRESSURE_RATIO_LOW_THRESHOLD) {
      servicePressureStatus = 'low';
    } else if (servicePressureRatio <= SERVICE_PRESSURE_RATIO_BALANCED_THRESHOLD) {
      servicePressureStatus = 'balanced';
    } else if (servicePressureRatio <= SERVICE_PRESSURE_RATIO_HIGH_THRESHOLD) {
      servicePressureStatus = 'high';
    } else {
      servicePressureStatus = 'overloaded';
    }
  }

  // 6. Status and Notes
  const notes: string[] = [];
  let status: SelectedLineDemandContributionStatus = 'unavailable';

  if (lineService.status === 'blocked') {
    status = 'unavailable';
    notes.push('Line has blocked readiness issues.');
  } else if (!hasActiveService) {
    status = 'no-service';
    notes.push('No active service in this time band.');
  } else if (capturedResidentialNodeIds.size === 0 && capturedWorkplaceNodeIds.size === 0) {
    status = 'no-demand';
    notes.push('No demand captured by this line.');
  } else if (capturedResidentialNodeIds.size > 0 && capturedWorkplaceNodeIds.size === 0) {
    status = 'captures-only';
    notes.push('Captures homes but no reachable workplace destinations.');
  } else if (capturedResidentialNodeIds.size === 0 && capturedWorkplaceNodeIds.size > 0) {
    status = 'captures-only';
    notes.push('Captures workplaces but no residential origins.');
  } else if (servedResidentialNodeIds.size === 0) {
    status = 'captures-only';
    notes.push('Captures demand but cannot structurally connect it.');
  } else {
    status = servicePressureStatus === 'overloaded' ? 'degraded' : 'serving';
  }

  return {
    lineId: line.id,
    activeTimeBandId,
    status,
    capturedResidentialActiveWeight,
    capturedResidentialNodeCount: capturedResidentialNodeIds.size,
    capturedWorkplaceActiveWeight,
    capturedWorkplaceNodeCount: capturedWorkplaceNodeIds.size,
    servedResidentialActiveWeight,
    unservedCapturedResidentialActiveWeight,
    reachableWorkplaceActiveWeight,
    activeHeadwayMinutes,
    activeDeparturesPerHourEstimate,
    servicePressureRatio,
    servicePressureStatus,
    notes
  };
}
