import { describe, expect, it, vi } from 'vitest';
import { createOsmStopCandidateGroupId } from '../domain/types/osmStopCandidate';
import {
  MAP_LAYER_ID_OSM_STOP_CANDIDATES_CIRCLE,
  MAP_LAYER_ID_SCENARIO_DEMAND_PREVIEW_CIRCLE,
  MAP_OSM_STOP_CANDIDATE_CIRCLE_LAYER_PAINT,
  MAP_SCENARIO_DEMAND_PREVIEW_CIRCLE_LAYER_PAINT
} from './mapRenderConstants';
import {
  decodeMapEntityHoverTargetFromFeatureProperties,
  syncMapEntityHoverAffordance,
  type MapEntityHoverAffordanceMap
} from './mapEntityHoverTarget';
import type { MapLibreLayerSpecification } from './maplibreGlobal';

const createAffordanceMap = (
  presentLayerIds: readonly string[] = [
    MAP_LAYER_ID_SCENARIO_DEMAND_PREVIEW_CIRCLE,
    MAP_LAYER_ID_OSM_STOP_CANDIDATES_CIRCLE
  ]
): MapEntityHoverAffordanceMap & { readonly canvas: { readonly style: { cursor: string } }; readonly setPaintProperty: ReturnType<typeof vi.fn> } => {
  const layerIds = new Set(presentLayerIds);
  const canvas = { style: { cursor: '' } };

  return {
    canvas,
    getCanvas: () => canvas,
    getLayer: (layerId: string): MapLibreLayerSpecification | undefined =>
      layerIds.has(layerId)
        ? {
            id: layerId,
            type: 'circle',
            source: 'test-source'
          }
        : undefined,
    setPaintProperty: vi.fn()
  };
};

describe('decodeMapEntityHoverTargetFromFeatureProperties', () => {
  it('accepts valid demand node feature properties', () => {
    expect(
      decodeMapEntityHoverTargetFromFeatureProperties({
        entityId: 'node-1',
        entityKind: 'node'
      })
    ).toEqual({
      kind: 'demand-node',
      id: 'node-1'
    });
  });

  it('accepts valid OSM stop candidate group feature properties', () => {
    expect(
      decodeMapEntityHoverTargetFromFeatureProperties({
        candidateGroupId: 'osm-group:1',
        label: 'Candidate'
      })
    ).toEqual({
      kind: 'osm-stop-candidate',
      id: createOsmStopCandidateGroupId('osm-group:1')
    });
  });

  it('rejects missing or malformed feature properties without throwing', () => {
    expect(decodeMapEntityHoverTargetFromFeatureProperties(undefined)).toBeNull();
    expect(decodeMapEntityHoverTargetFromFeatureProperties({ entityId: '' })).toBeNull();
    expect(decodeMapEntityHoverTargetFromFeatureProperties({ entityId: 1 })).toBeNull();
    expect(decodeMapEntityHoverTargetFromFeatureProperties({ candidateGroupId: '' })).toBeNull();
    expect(decodeMapEntityHoverTargetFromFeatureProperties({ candidateGroupId: false })).toBeNull();
  });
});

describe('syncMapEntityHoverAffordance', () => {
  it('applies pointer cursor and demand node paint emphasis for demand node hover', () => {
    const map = createAffordanceMap();

    syncMapEntityHoverAffordance(map, {
      kind: 'demand-node',
      id: 'node-1'
    });

    expect(map.canvas.style.cursor).toBe('pointer');
    expect(map.setPaintProperty).toHaveBeenCalledWith(
      MAP_LAYER_ID_SCENARIO_DEMAND_PREVIEW_CIRCLE,
      'circle-radius',
      expect.arrayContaining(['case'])
    );
    expect(map.setPaintProperty).toHaveBeenCalledWith(
      MAP_LAYER_ID_OSM_STOP_CANDIDATES_CIRCLE,
      'circle-radius',
      MAP_OSM_STOP_CANDIDATE_CIRCLE_LAYER_PAINT['circle-radius']
    );
  });

  it('applies pointer cursor and OSM candidate paint emphasis for OSM candidate hover', () => {
    const map = createAffordanceMap();

    syncMapEntityHoverAffordance(map, {
      kind: 'osm-stop-candidate',
      id: createOsmStopCandidateGroupId('osm-group:1')
    });

    expect(map.canvas.style.cursor).toBe('pointer');
    expect(map.setPaintProperty).toHaveBeenCalledWith(
      MAP_LAYER_ID_OSM_STOP_CANDIDATES_CIRCLE,
      'circle-radius',
      expect.arrayContaining(['case'])
    );
    expect(map.setPaintProperty).toHaveBeenCalledWith(
      MAP_LAYER_ID_SCENARIO_DEMAND_PREVIEW_CIRCLE,
      'circle-radius',
      MAP_SCENARIO_DEMAND_PREVIEW_CIRCLE_LAYER_PAINT['circle-radius']
    );
  });

  it('clears cursor and restores base paint deterministically', () => {
    const map = createAffordanceMap();

    syncMapEntityHoverAffordance(map, null);

    expect(map.canvas.style.cursor).toBe('');
    expect(map.setPaintProperty).toHaveBeenCalledWith(
      MAP_LAYER_ID_SCENARIO_DEMAND_PREVIEW_CIRCLE,
      'circle-radius',
      MAP_SCENARIO_DEMAND_PREVIEW_CIRCLE_LAYER_PAINT['circle-radius']
    );
    expect(map.setPaintProperty).toHaveBeenCalledWith(
      MAP_LAYER_ID_OSM_STOP_CANDIDATES_CIRCLE,
      'circle-radius',
      MAP_OSM_STOP_CANDIDATE_CIRCLE_LAYER_PAINT['circle-radius']
    );
  });

  it('does not throw when supported hover layers are absent', () => {
    const map = createAffordanceMap([]);

    expect(() => {
      syncMapEntityHoverAffordance(map, {
        kind: 'demand-node',
        id: 'node-1'
      });
    }).not.toThrow();

    expect(map.canvas.style.cursor).toBe('pointer');
    expect(map.setPaintProperty).not.toHaveBeenCalled();
  });
});
