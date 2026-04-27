import type { MapLibreMap } from './maplibreGlobal';

/**
 * Restrained, cold blue tone for recognizable water bodies without breaking the dark theme.
 */
const BASEMAP_OVERRIDE_WATER_COLOR = '#2a3a42';

/**
 * Soft green tone for parks, grass, and recreational areas.
 */
const BASEMAP_OVERRIDE_PARK_GREEN_COLOR = '#243a24';

/**
 * Slightly deeper, muted green tone for wooded and forest areas.
 */
const BASEMAP_OVERRIDE_FOREST_GREEN_COLOR = '#1a2b1a';

/**
 * Pale muted green for generic green landuse.
 */
const BASEMAP_OVERRIDE_GENERIC_GREEN_COLOR = '#2d3d2d';

/**
 * Applies paint-property overrides to specific Carto Dark Matter basemap layers 
 * to improve the semantic readability of water and green spaces.
 * 
 * @param map The active MapLibreMap instance to apply overrides to.
 */
export function applyBasemapSemanticReadabilityOverrides(map: MapLibreMap): void {
  // 1. Water Overrides
  applyPaintOverride(map, 'water', 'fill-color', BASEMAP_OVERRIDE_WATER_COLOR);
  applyPaintOverride(map, 'waterway', 'line-color', BASEMAP_OVERRIDE_WATER_COLOR);

  // 2. Green Space Overrides
  applyPaintOverride(map, 'landcover', 'fill-color', [
    'case',
    ['==', ['get', 'class'], 'wood'], BASEMAP_OVERRIDE_FOREST_GREEN_COLOR,
    ['==', ['get', 'class'], 'grass'], BASEMAP_OVERRIDE_PARK_GREEN_COLOR,
    ['==', ['get', 'class'], 'recreation_ground'], BASEMAP_OVERRIDE_PARK_GREEN_COLOR,
    BASEMAP_OVERRIDE_GENERIC_GREEN_COLOR
  ]);

  applyPaintOverride(map, 'park_national_park', 'fill-color', BASEMAP_OVERRIDE_FOREST_GREEN_COLOR);
  applyPaintOverride(map, 'park_nature_reserve', 'fill-color', BASEMAP_OVERRIDE_FOREST_GREEN_COLOR);
  applyPaintOverride(map, 'landuse', 'fill-color', [
    'case',
    ['==', ['get', 'class'], 'cemetery'], BASEMAP_OVERRIDE_PARK_GREEN_COLOR,
    ['==', ['get', 'class'], 'stadium'], BASEMAP_OVERRIDE_GENERIC_GREEN_COLOR,
    BASEMAP_OVERRIDE_GENERIC_GREEN_COLOR
  ]);
}

/**
 * Defensively applies a paint property override only if the target layer exists in the current style.
 */
function applyPaintOverride(
  map: MapLibreMap, 
  layerId: string, 
  name: string, 
  value: string | number | boolean | readonly unknown[]
): void {
  if (map.getLayer(layerId)) {
    map.setPaintProperty(layerId, name, value);
  }
}
