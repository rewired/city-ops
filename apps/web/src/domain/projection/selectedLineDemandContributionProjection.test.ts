import { describe, it, expect } from 'vitest';
import { projectSelectedLineDemandContribution } from './selectedLineDemandContributionProjection';
import type { ScenarioDemandArtifact, ScenarioDemandNode } from '../types/scenarioDemand';
import type { Stop } from '../types/stop';
import type { Line } from '../types/line';
import { createLineId, createLineFrequencyMinutes, createNoServiceLineServiceByTimeBand } from '../types/line';

describe('selectedLineDemandContributionProjection', () => {
  const activeTimeBandId = 'morning-rush' as any;

  const createMockNode = (id: string, lng: number, lat: number, role: 'origin' | 'destination', nodeClass: 'residential' | 'workplace', weight: number, timeBandWeights?: Record<string, number>): ScenarioDemandNode => ({
    id,
    position: { lng, lat },
    role,
    class: nodeClass,
    baseWeight: weight,
    timeBandWeights: (timeBandWeights || { 'morning-rush': 1.0 }) as any,
  });

  const createMockStop = (id: string, lng: number, lat: number): Stop => ({
    id: id as any,
    label: `Stop ${id}`,
    position: { lng, lat }
  });

  const createMockLine = (id: string, stopIds: string[], topology: 'linear' | 'loop' = 'linear', servicePattern: 'one-way' | 'bidirectional' = 'one-way'): Line => {
    const frequencyByTimeBand = createNoServiceLineServiceByTimeBand();
    (frequencyByTimeBand as any)['morning-rush'] = { kind: 'frequency', headwayMinutes: createLineFrequencyMinutes(10) };

    const routeSegments = stopIds.slice(0, topology === 'loop' ? undefined : -1).map((_, i) => {
      const fromStopId = stopIds[i];
      const toStopId = stopIds[(i + 1) % stopIds.length];
      return {
        id: `seg-${id}-${i}` as any,
        lineId: createLineId(id),
        fromStopId: fromStopId as any,
        toStopId: toStopId as any,
        inMotionTravelMinutes: 5,
        dwellMinutes: 1,
        totalTravelMinutes: 6,
        status: 'routed' as const,
        warnings: []
      };
    });

    return {
      id: createLineId(id),
      label: `Line ${id}`,
      stopIds: stopIds as any[],
      topology,
      servicePattern,
      routeSegments,
      frequencyByTimeBand
    };
  };

  const artifact: ScenarioDemandArtifact = {
    schemaVersion: 1,
    scenarioId: 'test',
    generatedAt: '',
    sourceMetadata: {
      generatedFrom: [],
      generatorName: 'test',
      generatorVersion: '0.1.0'
    },
    nodes: [
      createMockNode('res1', 0, 0, 'origin', 'residential', 100, { 'morning-rush': 1.5 }),
      createMockNode('work1', 0.01, 0, 'destination', 'workplace', 50, { 'morning-rush': 2.0 }),
    ],
    attractors: [],
    gateways: []
  };

  it('returns null when no line or artifact is provided', () => {
    expect(projectSelectedLineDemandContribution(null, [], null, activeTimeBandId)).toBeNull();
  });

  it('projects demand contribution for a linear one-way line', () => {
    const stop1 = createMockStop('s1', 0, 0); // captures res1 (active weight 150)
    const stop2 = createMockStop('s2', 0.01, 0); // captures work1 (active weight 100)
    const line = createMockLine('l1', ['s1', 's2']);
    
    const result = projectSelectedLineDemandContribution(line, [stop1, stop2], artifact, 'morning-rush' as any);
    expect(result?.status).toBe('serving');
    expect(result?.capturedResidentialActiveWeight).toBe(150);
    expect(result?.servedResidentialActiveWeight).toBe(150);
    expect(result?.reachableWorkplaceActiveWeight).toBe(100);
    expect(result?.activeDeparturesPerHourEstimate).toBe(6);
    expect(result?.servicePressureStatus).toBe('balanced'); // 150 / 6 = 25 (balanced is <= 50)
  });

  it('returns captures-only when residential is after workplace in one-way line', () => {
    const stop1 = createMockStop('s1', 0, 0); // captures res1
    const stop2 = createMockStop('s2', 0.01, 0); // captures work1
    const line = createMockLine('l1', ['s2', 's1']); // Reversed
    
    const result = projectSelectedLineDemandContribution(line, [stop1, stop2], artifact, activeTimeBandId);
    expect(result?.status).toBe('captures-only');
    expect(result?.servedResidentialActiveWeight).toBe(0);
    expect(result?.notes).toContain('Captures demand but cannot structurally connect it.');
  });

  it('serves both directions for a bidirectional line', () => {
    const stop1 = createMockStop('s1', 0, 0); // captures res1
    const stop2 = createMockStop('s2', 0.01, 0); // captures work1
    const line = createMockLine('l1', ['s2', 's1'], 'linear', 'bidirectional');
    
    const result = projectSelectedLineDemandContribution(line, [stop1, stop2], artifact, activeTimeBandId);
    expect(result?.status).toBe('serving');
    expect(result?.servedResidentialActiveWeight).toBe(150);
  });

  it('serves any connection for a loop line', () => {
    const stop1 = createMockStop('s1', 0, 0); // captures res1
    const stop2 = createMockStop('s2', 0.01, 0); // captures work1
    const line = createMockLine('l1', ['s2', 's1'], 'loop', 'one-way');
    
    const result = projectSelectedLineDemandContribution(line, [stop1, stop2], artifact, activeTimeBandId);
    expect(result?.status).toBe('serving');
    expect(result?.servedResidentialActiveWeight).toBe(150);
  });

  it('returns no-service when line is inactive', () => {
    const stop1 = createMockStop('s1', 0, 0);
    const stop2 = createMockStop('s2', 0.01, 0);
    const line = createMockLine('l1', ['s1', 's2']);
    (line.frequencyByTimeBand as any)['morning-rush'] = { kind: 'no-service' };

    const result = projectSelectedLineDemandContribution(line, [stop1, stop2], artifact, activeTimeBandId);
    expect(result?.status).toBe('no-service');
    expect(result?.servedResidentialActiveWeight).toBe(0);
    expect(result?.notes).toContain('No active service in this time band.');
  });

  it('deduplicates nodes captured by multiple stops on the same line', () => {
    const stop1 = createMockStop('s1', 0, 0);
    const stop1b = createMockStop('s1b', 0.0001, 0); // also captures res1
    const stop2 = createMockStop('s2', 0.01, 0);
    const line = createMockLine('l1', ['s1', 's1b', 's2']);

    const result = projectSelectedLineDemandContribution(line, [stop1, stop1b, stop2], artifact, activeTimeBandId);
    expect(result?.capturedResidentialActiveWeight).toBe(150);
    expect(result?.capturedResidentialNodeCount).toBe(1);
    expect(result?.servedResidentialActiveWeight).toBe(150);
  });

  it('returns captures-only when only one type of demand is captured', () => {
    const stop1 = createMockStop('s1', 0, 0); // captures res1
    const stop2 = createMockStop('s2', 1, 1); // captures nothing
    const line = createMockLine('l1', ['s1', 's2']);
    
    const result = projectSelectedLineDemandContribution(line, [stop1, stop2], artifact, activeTimeBandId);
    expect(result?.status).toBe('captures-only');
    expect(result?.notes).toContain('Captures homes but no reachable workplace destinations.');
  });

  it('calculates service pressure correctly', () => {
    const stop1 = createMockStop('s1', 0, 0); // res1: 150
    const stop2 = createMockStop('s2', 0.01, 0); // work1: 100
    const line = createMockLine('l1', ['s1', 's2']);
    // Ratio = 150 / 6 = 25 -> balanced
    
    let result = projectSelectedLineDemandContribution(line, [stop1, stop2], artifact, activeTimeBandId);
    expect(result?.servicePressureStatus).toBe('balanced');

    // Make it overloaded: demand 150, frequency 0.5 departures/hr (headway 120min)
    (line.frequencyByTimeBand as any)['morning-rush'] = { kind: 'frequency', headwayMinutes: createLineFrequencyMinutes(120) };
    // Ratio = 150 / 0.5 = 300 -> overloaded (> 200)
    result = projectSelectedLineDemandContribution(line, [stop1, stop2], artifact, activeTimeBandId);
    expect(result?.servicePressureStatus).toBe('overloaded');
    expect(result?.status).toBe('degraded');
  });

  it('does not mutate inputs', () => {
    const line = createMockLine('l1', ['s1', 's2']);
    const lineJson = JSON.stringify(line);
    const artifactJson = JSON.stringify(artifact);
    
    projectSelectedLineDemandContribution(line, [], artifact, activeTimeBandId);
    
    expect(JSON.stringify(line)).toBe(lineJson);
    expect(JSON.stringify(artifact)).toBe(artifactJson);
  });
});
