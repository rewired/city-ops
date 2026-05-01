import { describe, expect, it, vi } from 'vitest';
import { hasInteractiveSelectionFeatureAtPoint } from './mapWorkspaceInteractions';
import type { MapLibreInteractionEvent, MapLibreMap } from './maplibreGlobal';
import { 
  MAP_LAYER_ID_STOPS_CIRCLE, 
  MAP_LAYER_ID_COMPLETED_LINES,
  MAP_LAYER_ID_OSM_STOP_CANDIDATES_CIRCLE
} from './mapRenderConstants';

const createMapMock = (presentLayerIds: string[], features: any[] = []) => {
  const layerSet = new Set(presentLayerIds);
  const queryRenderedFeatures = vi.fn().mockReturnValue(features);

  return {
    getLayer: (id: string) => layerSet.has(id) ? { id } : undefined,
    queryRenderedFeatures,
  } as unknown as MapLibreMap;
};

describe('mapWorkspaceInteractions', () => {
  describe('hasInteractiveSelectionFeatureAtPoint', () => {
    it('returns true when interactive features are found in existing layers', () => {
      const map = createMapMock(
        [MAP_LAYER_ID_STOPS_CIRCLE], 
        [{ id: 'stop-1', layer: { id: MAP_LAYER_ID_STOPS_CIRCLE } }]
      );
      const event = { point: { x: 10, y: 10 } } as MapLibreInteractionEvent;
      
      const result = hasInteractiveSelectionFeatureAtPoint(map, event);
      
      expect(result).toBe(true);
      expect(map.queryRenderedFeatures).toHaveBeenCalledWith(event.point, { 
        layers: [MAP_LAYER_ID_STOPS_CIRCLE] 
      });
    });

    it('returns false when no features are found', () => {
      const map = createMapMock([MAP_LAYER_ID_STOPS_CIRCLE, MAP_LAYER_ID_COMPLETED_LINES, MAP_LAYER_ID_OSM_STOP_CANDIDATES_CIRCLE], []);
      const event = { point: { x: 10, y: 10 } } as MapLibreInteractionEvent;
      
      const result = hasInteractiveSelectionFeatureAtPoint(map, event);
      
      expect(result).toBe(false);
    });

    it('returns false and does not throw when interactive layers are missing from the style', () => {
      const map = createMapMock([]); // No layers present
      const event = { point: { x: 10, y: 10 } } as MapLibreInteractionEvent;
      
      const result = hasInteractiveSelectionFeatureAtPoint(map, event);
      
      expect(result).toBe(false);
      expect(map.queryRenderedFeatures).not.toHaveBeenCalled();
    });

    it('queries only the subset of interactive layers that are currently present', () => {
      const map = createMapMock([MAP_LAYER_ID_COMPLETED_LINES], []);
      const event = { point: { x: 10, y: 10 } } as MapLibreInteractionEvent;
      
      hasInteractiveSelectionFeatureAtPoint(map, event);
      
      expect(map.queryRenderedFeatures).toHaveBeenCalledWith(event.point, { 
        layers: [MAP_LAYER_ID_COMPLETED_LINES] 
      });
    });
  });
});
