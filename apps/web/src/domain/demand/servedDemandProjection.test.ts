import { describe, expect, it } from 'vitest';
import { projectLineBandDemand } from './servedDemandProjection';
import type { LineId } from '../types/line';
import type { StopId } from '../types/stop';
import type { TimeBandId } from '../types/timeBand';
import type { StopDemandCatchment } from './demandCatchment';
import { createDemandWeight } from '../types/demandNode';

describe('servedDemandProjection', () => {
  const lineId = 'line-1' as LineId;
  const band = 'band-1' as TimeBandId;
  
  const createCatchment = (stopId: string, originW: number, destW: number): StopDemandCatchment => ({
    stopId: stopId as StopId,
    capturedDemandNodeIds: [],
    residentialOriginWeightByTimeBand: { [band]: createDemandWeight(originW) } as any,
    workplaceDestinationWeightByTimeBand: { [band]: createDemandWeight(destW) } as any,
  });

  it('returns zero and unconfigured status for unset service', () => {
    const result = projectLineBandDemand(lineId, [], band, 'unset', new Map());
    expect(result.status).toBe('unconfigured');
    expect(result.servedDemandWeight).toBe(0);
    expect(result.warnings[0].type).toBe('no-service-configured');
  });

  it('returns zero and no-service status for no-service', () => {
    const result = projectLineBandDemand(lineId, [], band, 'no-service', new Map());
    expect(result.status).toBe('no-service');
    expect(result.servedDemandWeight).toBe(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('correctly pairs valid directional demand', () => {
    const orderedStopIds = ['s1', 's2'] as StopId[];
    const catchments = new Map<StopId, StopDemandCatchment>([
      ['s1' as StopId, createCatchment('s1', 10, 0)],
      ['s2' as StopId, createCatchment('s2', 0, 20)]
    ]);

    const result = projectLineBandDemand(lineId, orderedStopIds, band, 'frequency', catchments);
    expect(result.status).toBe('served');
    expect(result.capturedOriginWeight).toBe(10);
    expect(result.capturedDestinationWeight).toBe(20);
    expect(result.servedDemandWeight).toBe(10); // min(10, 20)
  });

  it('does not pair wrong-directional demand', () => {
    const orderedStopIds = ['s1', 's2'] as StopId[];
    const catchments = new Map<StopId, StopDemandCatchment>([
      ['s1' as StopId, createCatchment('s1', 0, 20)], // Destination before origin
      ['s2' as StopId, createCatchment('s2', 10, 0)]
    ]);

    const result = projectLineBandDemand(lineId, orderedStopIds, band, 'frequency', catchments);
    expect(result.status).toBe('no-demand');
    expect(result.capturedOriginWeight).toBe(0);
    expect(result.capturedDestinationWeight).toBe(0);
    expect(result.servedDemandWeight).toBe(0);
    expect(result.warnings[0].type).toBe('wrong-direction');
  });

  it('sums valid stops only', () => {
    // s1: origin (10) - has dest at s3 -> paired
    // s2: dest (5) - has origin at s1 -> paired
    // s3: dest (20) - has origin at s1 -> paired
    // s4: origin (30) - no dest after it -> NOT paired
    const orderedStopIds = ['s1', 's2', 's3', 's4'] as StopId[];
    const catchments = new Map<StopId, StopDemandCatchment>([
      ['s1' as StopId, createCatchment('s1', 10, 0)],
      ['s2' as StopId, createCatchment('s2', 0, 5)],
      ['s3' as StopId, createCatchment('s3', 0, 20)],
      ['s4' as StopId, createCatchment('s4', 30, 0)]
    ]);

    const result = projectLineBandDemand(lineId, orderedStopIds, band, 'frequency', catchments);
    expect(result.status).toBe('served');
    expect(result.capturedOriginWeight).toBe(10); // only s1 is valid
    expect(result.capturedDestinationWeight).toBe(25); // s2 + s3 are valid
    expect(result.servedDemandWeight).toBe(10); // min(10, 25)
  });

  it('identifies incomplete pairing', () => {
    const orderedStopIds = ['s1', 's2'] as StopId[];
    const catchments = new Map<StopId, StopDemandCatchment>([
      ['s1' as StopId, createCatchment('s1', 10, 0)],
      ['s2' as StopId, createCatchment('s2', 5, 0)] // No destination at all
    ]);

    const result = projectLineBandDemand(lineId, orderedStopIds, band, 'frequency', catchments);
    expect(result.status).toBe('incomplete-pairing');
    expect(result.capturedOriginWeight).toBe(0);
    expect(result.servedDemandWeight).toBe(0);
  });
});
