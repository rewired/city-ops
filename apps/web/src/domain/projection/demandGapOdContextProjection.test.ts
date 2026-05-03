import { describe, expect, it } from 'vitest';
import { projectDemandGapOdContext } from './demandGapOdContextProjection';
import type { DemandGapRankingProjection } from './demandGapProjection';
import type { ScenarioDemandArtifact, ScenarioDemandNode } from '../types/scenarioDemand';
import type { TimeBandId } from '../types/timeBand';
import { MVP_TIME_BAND_IDS } from '../constants/timeBands';

describe('projectDemandGapOdContext', () => {
  const mockTimeBandId: TimeBandId = 'morning-rush';
  
  const createMockTimeBandWeights = (): Record<TimeBandId, number> => ({
    'morning-rush': 1.0,
    'late-morning': 1.0,
    'midday': 1.0,
    'afternoon': 1.0,
    'evening-rush': 1.0,
    'evening': 1.0,
    'night': 1.0
  });

  const mockNode1: ScenarioDemandNode = {
    id: 'node-res-1',
    role: 'origin',
    class: 'residential',
    position: { lng: 10, lat: 50 },
    baseWeight: 100,
    timeBandWeights: createMockTimeBandWeights()
  };

  const mockNode2: ScenarioDemandNode = {
    id: 'node-work-1',
    role: 'destination',
    class: 'workplace',
    position: { lng: 10.01, lat: 50.01 }, // Nearby workplace
    baseWeight: 150,
    timeBandWeights: createMockTimeBandWeights()
  };

  const mockNode3: ScenarioDemandNode = {
    id: 'node-work-2',
    role: 'destination',
    class: 'workplace',
    position: { lng: 10.1, lat: 50.1 }, // Further workplace
    baseWeight: 200,
    timeBandWeights: createMockTimeBandWeights()
  };
  
  const mockNode4: ScenarioDemandNode = {
    id: 'node-res-2',
    role: 'origin',
    class: 'residential',
    position: { lng: 10.05, lat: 50.05 },
    baseWeight: 80,
    timeBandWeights: createMockTimeBandWeights()
  };

  const artifact: ScenarioDemandArtifact = {
    schemaVersion: 1,
    scenarioId: 'test-scenario',
    generatedAt: '2026-05-03T00:00:00Z',
    sourceMetadata: {
      generatedFrom: [],
      generatorName: 'test',
      generatorVersion: '1.0.0'
    },
    nodes: [mockNode1, mockNode2, mockNode3, mockNode4],
    attractors: [],
    gateways: []
  };

  const createMockRanking = (gapKind: 'uncaptured-residential' | 'captured-unserved-residential' | 'captured-unreachable-workplace', gapId: string): DemandGapRankingProjection => {
    const gap = {
      id: gapId,
      kind: gapKind,
      position: { lng: 10, lat: 50 },
      activeWeight: 100,
      baseWeight: 100,
      nearestStopDistanceMeters: null,
      capturingStopCount: 0,
      note: 'Test note'
    };
    
    return {
      status: 'ready',
      activeTimeBandId: mockTimeBandId,
      uncapturedResidentialGaps: gapKind === 'uncaptured-residential' ? [gap] : [],
      capturedButUnservedResidentialGaps: gapKind === 'captured-unserved-residential' ? [gap] : [],
      capturedButUnreachableWorkplaceGaps: gapKind === 'captured-unreachable-workplace' ? [gap] : [],
      summary: { totalGapCount: 1 }
    };
  };

  it('returns unavailable when artifact is missing', () => {
    const ranking = createMockRanking('uncaptured-residential', 'node-res-1');
    const result = projectDemandGapOdContext(null, ranking, 'node-res-1', mockTimeBandId);
    expect(result.status).toBe('unavailable');
  });

  it('returns unavailable when focusedGapId is missing or not found', () => {
    const ranking = createMockRanking('uncaptured-residential', 'node-res-1');
    expect(projectDemandGapOdContext(artifact, ranking, null, mockTimeBandId).status).toBe('unavailable');
    expect(projectDemandGapOdContext(artifact, ranking, 'non-existent', mockTimeBandId).status).toBe('unavailable');
  });

  it('returns origin-side context with workplace candidates for uncaptured-residential gaps', () => {
    const ranking = createMockRanking('uncaptured-residential', 'node-res-1');
    const result = projectDemandGapOdContext(artifact, ranking, 'node-res-1', mockTimeBandId);
    
    expect(result.status).toBe('ready');
    expect(result.problemSide).toBe('origin');
    expect(result.candidates.length).toBe(2);
    expect(result.candidates[0]!.demandClass).toBe('workplace');
    
    // Node 3 has higher weight (200) vs Node 2 (150), so it should be first
    expect(result.candidates[0]!.id).toBe('node-work-2');
    expect(result.candidates[1]!.id).toBe('node-work-1');
    expect(result.guidance).toContain('outside stop access');
  });

  it('returns origin-side context with workplace candidates for captured-unserved-residential gaps', () => {
    const ranking = createMockRanking('captured-unserved-residential', 'node-res-1');
    const result = projectDemandGapOdContext(artifact, ranking, 'node-res-1', mockTimeBandId);
    
    expect(result.status).toBe('ready');
    expect(result.problemSide).toBe('origin');
    expect(result.candidates.length).toBe(2);
    expect(result.candidates[0]!.demandClass).toBe('workplace');
    expect(result.guidance).toContain('captured, but active service does not currently connect');
  });

  it('returns destination-side context with residential candidates for captured-unreachable-workplace gaps', () => {
    const ranking = createMockRanking('captured-unreachable-workplace', 'node-work-1');
    const result = projectDemandGapOdContext(artifact, ranking, 'node-work-1', mockTimeBandId);
    
    expect(result.status).toBe('ready');
    expect(result.problemSide).toBe('destination');
    expect(result.candidates.length).toBe(2);
    expect(result.candidates[0]!.demandClass).toBe('residential');
    
    // node-res-1 has weight 100, node-res-2 has weight 80.
    expect(result.candidates[0]!.id).toBe('node-res-1');
    expect(result.candidates[1]!.id).toBe('node-res-2');
    expect(result.guidance).toContain('workplace destination is captured, but no active service currently brings');
  });

  it('caps candidates deterministically', () => {
    // We mock the centralized limit by injecting many nodes. 
    // Wait, the limit is 5. We can create 10 nodes.
    const manyNodes = Array.from({ length: 10 }).map((_, i): ScenarioDemandNode => ({
      id: `node-work-many-${i}`,
      role: 'destination',
      class: 'workplace',
      position: { lng: 10 + i * 0.001, lat: 50 },
      baseWeight: 100, // Same weight
      timeBandWeights: createMockTimeBandWeights()
    }));
    
    const ranking = createMockRanking('uncaptured-residential', 'node-res-1');
    const result = projectDemandGapOdContext({ ...artifact, nodes: [...manyNodes, mockNode1] }, ranking, 'node-res-1', mockTimeBandId);
    
    expect(result.candidates.length).toBe(5);
    // Since weights are the same, it sorts by distance (i.e. i ascending)
    expect(result.candidates[0]!.id).toBe('node-work-many-0');
    expect(result.candidates[4]!.id).toBe('node-work-many-4');
  });
});
