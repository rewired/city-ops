import { describe, it, expect } from 'vitest';
import { buildDemandNodeGeoJson, type DemandNodeFeatureProperties } from './demandNodeGeoJson';
import type { DemandNode, DemandNodeId, DemandWeight } from '../domain/types/demandNode';
import type { TimeBandId } from '../domain/types/timeBand';
import type { NetworkDemandCapturePreviewProjection } from '../domain/projection/demandCapturePreviewProjection';
import type { StopId } from '../domain/types/stop';

const createMockNode = (id: string, weight: number): DemandNode => ({
  id: id as DemandNodeId,
  label: `Node ${id}`,
  position: { lng: 10.0, lat: 50.0 },
  role: 'origin',
  demandClass: 'residential',
  weightByTimeBand: {
    'day': weight as DemandWeight
  } as unknown as Record<TimeBandId, DemandWeight>
});

describe('buildDemandNodeGeoJson', () => {
  it('populates base feature properties', () => {
    const nodes = [createMockNode('n1', 50)];
    const result = buildDemandNodeGeoJson(nodes, 'day' as TimeBandId);

    expect(result.features).toHaveLength(1);
    const props = result.features[0]!.properties as unknown as DemandNodeFeatureProperties;
    expect(props.demandNodeId).toBe('n1');
    expect(props.role).toBe('origin');
    expect(props.demandClass).toBe('residential');
    expect(props.label).toBe('Node n1');
    expect(props.activeWeight).toBe(50);
  });

  it('defaults missing capture state to uncaptured', () => {
    const nodes = [createMockNode('n1', 50)];
    const result = buildDemandNodeGeoJson(nodes, 'day' as TimeBandId);

    const props = result.features[0]!.properties as unknown as DemandNodeFeatureProperties;
    expect(props.captured).toBe(false);
    expect(props.capturedByStopCount).toBe(0);
    expect(props.capturedBySelectedStop).toBe(false);
  });

  it('maps captured and selected states from projection properly', () => {
    const nodes = [createMockNode('n1', 50), createMockNode('n2', 10)];
    const mockProjection: NetworkDemandCapturePreviewProjection = {
      totalNodeCount: 2,
      capturedNodeCount: 1,
      selectedStopCapturedNodeCount: 1,
      demandNodeCaptures: [
        {
          demandNodeId: 'n1' as DemandNodeId,
          capturedByStopIds: ['s1'] as unknown as StopId[],
          capturedByStopCount: 1,
          capturedBySelectedStop: true
        },
        {
          demandNodeId: 'n2' as DemandNodeId,
          capturedByStopIds: [] as unknown as StopId[],
          capturedByStopCount: 0,
          capturedBySelectedStop: false
        }
      ]
    };

    const result = buildDemandNodeGeoJson(nodes, 'day' as TimeBandId, mockProjection);

    const props1 = result.features[0]!.properties as unknown as DemandNodeFeatureProperties;
    expect(props1.captured).toBe(true);
    expect(props1.capturedByStopCount).toBe(1);
    expect(props1.capturedBySelectedStop).toBe(true);

    const props2 = result.features[1]!.properties as unknown as DemandNodeFeatureProperties;
    expect(props2.captured).toBe(false);
    expect(props2.capturedByStopCount).toBe(0);
    expect(props2.capturedBySelectedStop).toBe(false);
  });
});
