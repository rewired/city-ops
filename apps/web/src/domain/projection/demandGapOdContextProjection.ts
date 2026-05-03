import type { TimeBandId } from '../types/timeBand';
import type { DemandGapKind, DemandGapRankingProjection, DemandGapRankingItem } from './demandGapProjection';
import type { ScenarioDemandArtifact, ScenarioDemandNode } from '../types/scenarioDemand';
import { calculateGreatCircleDistanceMeters } from '../../lib/geometry';
import { calculateActiveDemandWeight } from './demandWeight';
import { DEMAND_GAP_OD_CONTEXT_MAX_CANDIDATES } from '../constants/scenarioDemand';

/** Status of the OD context projection based on readiness of dependencies. */
export type DemandGapOdContextStatus = 'unavailable' | 'ready';

/** Indicates whether the gap represents an origin or a destination problem. */
export type DemandGapOdContextProblemSide = 'origin' | 'destination';

/** Represents a candidate node to resolve a focused demand gap. */
export interface DemandGapOdContextCandidate {
  readonly id: string;
  readonly role: 'origin' | 'destination';
  readonly demandClass: 'residential' | 'workplace';
  readonly position: { readonly lng: number; readonly lat: number };
  readonly activeWeight: number;
  readonly baseWeight: number;
  readonly distanceMeters: number;
}

/** 
 * Derived planning context providing likely origin or destination candidates 
 * for a focused demand gap. This is pure projection context and does not 
 * represent exact simulation passenger flow truth or route geometry.
 */
export interface DemandGapOdContextProjection {
  readonly status: DemandGapOdContextStatus;
  readonly activeTimeBandId: TimeBandId;
  readonly focusedGapId: string | null;
  readonly focusedGapKind: DemandGapKind | null;
  readonly problemSide: DemandGapOdContextProblemSide | null;
  readonly focusedPosition: { readonly lng: number; readonly lat: number } | null;
  readonly candidates: readonly DemandGapOdContextCandidate[];
  readonly summary: {
    readonly candidateCount: number;
    readonly topActiveWeight: number;
  };
  readonly guidance: string | null;
}

const findFocusedGapItem = (
  ranking: DemandGapRankingProjection,
  gapId: string
): DemandGapRankingItem | null => {
  if (ranking.status !== 'ready') return null;
  
  return (
    ranking.uncapturedResidentialGaps.find(g => g.id === gapId) ??
    ranking.capturedButUnservedResidentialGaps.find(g => g.id === gapId) ??
    ranking.capturedButUnreachableWorkplaceGaps.find(g => g.id === gapId) ??
    null
  );
};

const resolveProblemSideAndGuidance = (kind: DemandGapKind): { problemSide: DemandGapOdContextProblemSide, guidance: string } => {
  switch (kind) {
    case 'uncaptured-residential':
      return {
        problemSide: 'origin',
        guidance: 'This residential demand is outside stop access. Place a stop nearby, then connect it toward one of the listed workplace clusters.'
      };
    case 'captured-unserved-residential':
      return {
        problemSide: 'origin',
        guidance: 'This residential demand is captured, but active service does not currently connect it to a workplace destination.'
      };
    case 'captured-unreachable-workplace':
      return {
        problemSide: 'destination',
        guidance: 'This workplace destination is captured, but no active service currently brings residential demand to it.'
      };
  }
};

const createEmptyProjection = (activeTimeBandId: TimeBandId): DemandGapOdContextProjection => ({
  status: 'unavailable',
  activeTimeBandId,
  focusedGapId: null,
  focusedGapKind: null,
  problemSide: null,
  focusedPosition: null,
  candidates: [],
  summary: { candidateCount: 0, topActiveWeight: 0 },
  guidance: null
});

/**
 * Derives a compact origin-destination context for a focused demand gap.
 * Identifies whether the gap is an origin or destination problem and suggests
 * likely candidate connections based on active demand weight and distance.
 */
export function projectDemandGapOdContext(
  artifact: ScenarioDemandArtifact | null,
  ranking: DemandGapRankingProjection,
  focusedGapId: string | null,
  activeTimeBandId: TimeBandId
): DemandGapOdContextProjection {
  if (!artifact || !focusedGapId || ranking.status !== 'ready') {
    return createEmptyProjection(activeTimeBandId);
  }

  const gapItem = findFocusedGapItem(ranking, focusedGapId);
  if (!gapItem) {
    return createEmptyProjection(activeTimeBandId);
  }

  const { problemSide, guidance } = resolveProblemSideAndGuidance(gapItem.kind);

  // Determine candidate nodes through type guards to preserve strict typing
  const isWorkplaceDestinationNode = (
    node: ScenarioDemandNode
  ): node is ScenarioDemandNode & { readonly role: 'destination'; readonly class: 'workplace' } => {
    return node.role === 'destination' && node.class === 'workplace';
  };

  const isResidentialOriginNode = (
    node: ScenarioDemandNode
  ): node is ScenarioDemandNode & { readonly role: 'origin'; readonly class: 'residential' } => {
    return node.role === 'origin' && node.class === 'residential';
  };

  const candidateNodes = problemSide === 'origin'
    ? artifact.nodes.filter(isWorkplaceDestinationNode)
    : artifact.nodes.filter(isResidentialOriginNode);

  const candidates: DemandGapOdContextCandidate[] = [];

  for (const node of candidateNodes) {
    const activeWeight = calculateActiveDemandWeight(node, activeTimeBandId);
    if (activeWeight <= 0) continue;

    const distanceMeters = calculateGreatCircleDistanceMeters(
      [gapItem.position.lng, gapItem.position.lat],
      [node.position.lng, node.position.lat]
    );

    candidates.push({
      id: node.id,
      role: node.role,
      demandClass: node.class,
      position: node.position,
      activeWeight,
      baseWeight: node.baseWeight,
      distanceMeters
    });
  }

  // Sort candidates deterministically:
  // 1. Descending active weight
  // 2. Ascending distance
  // 3. Ascending stable ID
  candidates.sort((a, b) => {
    if (b.activeWeight !== a.activeWeight) {
      return b.activeWeight - a.activeWeight;
    }
    if (a.distanceMeters !== b.distanceMeters) {
      return a.distanceMeters - b.distanceMeters;
    }
    return a.id.localeCompare(b.id);
  });

  const cappedCandidates = candidates.slice(0, DEMAND_GAP_OD_CONTEXT_MAX_CANDIDATES);

  return {
    status: 'ready',
    activeTimeBandId,
    focusedGapId: gapItem.id,
    focusedGapKind: gapItem.kind,
    problemSide,
    focusedPosition: gapItem.position,
    candidates: cappedCandidates,
    summary: {
      candidateCount: cappedCandidates.length,
      topActiveWeight: cappedCandidates[0]?.activeWeight ?? 0
    },
    guidance
  };
}
