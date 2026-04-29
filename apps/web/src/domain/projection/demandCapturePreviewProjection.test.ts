import { describe, it, expect } from 'vitest';
import { projectDemandCapturePreview } from './demandCapturePreviewProjection';
import type { DemandNode, DemandNodeId, DemandWeight } from '../types/demandNode';
import type { StopDemandCatchment } from '../demand/demandCatchment';
import type { StopId } from '../types/stop';
import type { TimeBandId } from '../types/timeBand';

const createMockNode = (id: string): DemandNode => ({
  id: id as DemandNodeId,
  label: `Node ${id}`,
  position: { lng: 0, lat: 0 },
  role: 'origin',
  demandClass: 'residential',
  weightByTimeBand: {} as Record<TimeBandId, DemandWeight>
});

const createMockCatchment = (stopId: string, nodeIds: string[]): StopDemandCatchment => ({
  stopId: stopId as StopId,
  capturedDemandNodeIds: nodeIds as DemandNodeId[],
  residentialOriginWeightByTimeBand: {} as Record<TimeBandId, DemandWeight>,
  workplaceDestinationWeightByTimeBand: {} as Record<TimeBandId, DemandWeight>
});

describe('demandCapturePreviewProjection', () => {
  it('returns all nodes as uncaptured if no stops exist', () => {
    const nodes = [createMockNode('n1'), createMockNode('n2')];
    const result = projectDemandCapturePreview({
      demandNodes: nodes,
      stopCatchments: [],
      selectedStopId: null
    });

    expect(result.totalNodeCount).toBe(2);
    expect(result.capturedNodeCount).toBe(0);
    expect(result.selectedStopCapturedNodeCount).toBe(0);
    expect(result.demandNodeCaptures).toHaveLength(2);
    expect(result.demandNodeCaptures[0]!.capturedByStopCount).toBe(0);
    expect(result.demandNodeCaptures[0]!.capturedBySelectedStop).toBe(false);
  });

  it('identifies captured nodes correctly', () => {
    const nodes = [createMockNode('n1'), createMockNode('n2')];
    const catchments = [createMockCatchment('s1', ['n1'])];
    const result = projectDemandCapturePreview({
      demandNodes: nodes,
      stopCatchments: catchments,
      selectedStopId: null
    });

    expect(result.capturedNodeCount).toBe(1);
    expect(result.demandNodeCaptures[0]!.demandNodeId).toBe('n1');
    expect(result.demandNodeCaptures[0]!.capturedByStopCount).toBe(1);
    expect(result.demandNodeCaptures[0]!.capturedByStopIds).toContain('s1');
    expect(result.demandNodeCaptures[1]!.capturedByStopCount).toBe(0);
  });

  it('does not duplicate stop IDs if a stop catchment holds multiple duplicates (safety)', () => {
    const nodes = [createMockNode('n1')];
    const catchments = [
      {
        stopId: 's1' as StopId,
        capturedDemandNodeIds: ['n1', 'n1'] as DemandNodeId[],
        residentialOriginWeightByTimeBand: {} as Record<TimeBandId, DemandWeight>,
        workplaceDestinationWeightByTimeBand: {} as Record<TimeBandId, DemandWeight>
      }
    ];
    const result = projectDemandCapturePreview({
      demandNodes: nodes,
      stopCatchments: catchments,
      selectedStopId: null
    });

    expect(result.demandNodeCaptures[0]!.capturedByStopIds).toEqual(['s1']);
    expect(result.demandNodeCaptures[0]!.capturedByStopCount).toBe(1);
  });

  it('highlights selected stop captures correctly', () => {
    const nodes = [createMockNode('n1'), createMockNode('n2')];
    const catchments = [
      createMockCatchment('s1', ['n1']),
      createMockCatchment('s2', ['n1', 'n2'])
    ];
    const result = projectDemandCapturePreview({
      demandNodes: nodes,
      stopCatchments: catchments,
      selectedStopId: 's1' as StopId
    });

    expect(result.selectedStopCapturedNodeCount).toBe(1);
    expect(result.demandNodeCaptures[0]!.capturedBySelectedStop).toBe(true);
    expect(result.demandNodeCaptures[1]!.capturedBySelectedStop).toBe(false);
  });

  it('preserves input demand node array order', () => {
    const nodes = [createMockNode('n2'), createMockNode('n1')];
    const catchments = [createMockCatchment('s1', ['n1', 'n2'])];
    const result = projectDemandCapturePreview({
      demandNodes: nodes,
      stopCatchments: catchments,
      selectedStopId: null
    });

    expect(result.demandNodeCaptures[0]!.demandNodeId).toBe('n2');
    expect(result.demandNodeCaptures[1]!.demandNodeId).toBe('n1');
  });
});
