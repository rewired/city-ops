import type { 
  MapLibreMap, 
  MapEventPoint, 
  MapLibreRenderedFeatureQueryBox, 
  MapLibreRenderedFeature 
} from './maplibreGlobal';

/**
 * Filters the requested layer IDs to only those currently present in the map style.
 * 
 * MapLibre throws an error if queryRenderedFeatures is called with layer IDs
 * that do not exist in the current style.
 * 
 * @param map The MapLibre map instance.
 * @param layerIds The candidate layer IDs to query.
 * @returns The subset of layer IDs that actually exist in the style.
 */
export const filterExistingLayerIds = (map: MapLibreMap, layerIds: readonly string[]): string[] => {
  return layerIds.filter((layerId) => map.getLayer(layerId) !== undefined);
};

/**
 * Safely queries rendered features for a set of layer IDs, filtering out any missing layers.
 * 
 * Returns an empty array if none of the requested layers exist in the current style.
 * 
 * @param map The MapLibre map instance.
 * @param pointOrBox The geometry to query.
 * @param layerIds The layer IDs to query for features.
 * @returns The rendered features found in the existing layers.
 */
export const queryRenderedFeaturesForExistingLayers = (
  map: MapLibreMap,
  pointOrBox: MapEventPoint | MapLibreRenderedFeatureQueryBox,
  layerIds: readonly string[]
): readonly MapLibreRenderedFeature[] => {
  const existingLayerIds = filterExistingLayerIds(map, layerIds);

  if (existingLayerIds.length === 0) {
    return [];
  }

  return map.queryRenderedFeatures(pointOrBox, { layers: existingLayerIds });
};
