import type { MapLibreMap } from './maplibreGlobal';

/**
 * Restrained, cold blue tone for recognizable water bodies without breaking the dark theme.
 */
const BASEMAP_OVERRIDE_WATER_COLOR = '#182428';

/**
 * Soft green tone for parks, grass, and recreational areas.
 */
const BASEMAP_OVERRIDE_PARK_GREEN_COLOR = '#1c2b20';

/**
 * Slightly deeper, muted green tone for wooded and forest areas.
 */
const BASEMAP_OVERRIDE_FOREST_GREEN_COLOR = '#141f14';

/**
 * Pale muted green for generic green landuse.
 */
const BASEMAP_OVERRIDE_GENERIC_GREEN_COLOR = '#202820';

/**
 * Reduced water opacity so large water surfaces remain readable without dominating the dark basemap.
 */
const BASEMAP_OVERRIDE_WATER_OPACITY = 0.62;

/**
 * Reduced waterway opacity so narrow canals and streams stay visible without visual noise.
 */
const BASEMAP_OVERRIDE_WATERWAY_OPACITY = 0.56;

/**
 * Reduced park opacity so major green spaces remain legible without looking pasted onto the basemap.
 */
const BASEMAP_OVERRIDE_PARK_GREEN_OPACITY = 0.58;

/**
 * Reduced forest opacity for deeper wooded areas that should sit behind streets and gameplay overlays.
 */
const BASEMAP_OVERRIDE_FOREST_GREEN_OPACITY = 0.52;

/**
 * Reduced generic green opacity so small green landuse patches do not compete with roads or stops.
 */
const BASEMAP_OVERRIDE_GENERIC_GREEN_OPACITY = 0.46;

/**
 * Applies paint-property overrides to specific Carto Dark Matter basemap layers
 * to improve the semantic readability of water and green spaces.
 *
 * @param map The active MapLibreMap instance to apply overrides to.
 */
export function applyBasemapSemanticReadabilityOverrides(map: MapLibreMap): void {
  // 1. Water Overrides
  applyPaintOverride(map, 'water', 'fill-color', BASEMAP_OVERRIDE_WATER_COLOR);
  applyPaintOverride(map, 'water', 'fill-opacity', BASEMAP_OVERRIDE_WATER_OPACITY);
  applyPaintOverride(map, 'waterway', 'line-color', BASEMAP_OVERRIDE_WATER_COLOR);
  applyPaintOverride(map, 'waterway', 'line-opacity', BASEMAP_OVERRIDE_WATERWAY_OPACITY);

  // 2. Green Space Overrides
  applyPaintOverride(map, 'landcover', 'fill-color', [
    'case',
    ['==', ['get', 'class'], 'wood'], BASEMAP_OVERRIDE_FOREST_GREEN_COLOR,
    ['==', ['get', 'class'], 'grass'], BASEMAP_OVERRIDE_PARK_GREEN_COLOR,
    ['==', ['get', 'class'], 'recreation_ground'], BASEMAP_OVERRIDE_PARK_GREEN_COLOR,
    BASEMAP_OVERRIDE_GENERIC_GREEN_COLOR,
  ]);
  applyPaintOverride(map, 'landcover', 'fill-opacity', [
    'case',
    ['==', ['get', 'class'], 'wood'], BASEMAP_OVERRIDE_FOREST_GREEN_OPACITY,
    ['==', ['get', 'class'], 'grass'], BASEMAP_OVERRIDE_PARK_GREEN_OPACITY,
    ['==', ['get', 'class'], 'recreation_ground'], BASEMAP_OVERRIDE_PARK_GREEN_OPACITY,
    BASEMAP_OVERRIDE_GENERIC_GREEN_OPACITY,
  ]);

  applyPaintOverride(map, 'park_national_park', 'fill-color', BASEMAP_OVERRIDE_FOREST_GREEN_COLOR);
  applyPaintOverride(map, 'park_national_park', 'fill-opacity', BASEMAP_OVERRIDE_FOREST_GREEN_OPACITY);
  applyPaintOverride(map, 'park_nature_reserve', 'fill-color', BASEMAP_OVERRIDE_FOREST_GREEN_COLOR);
  applyPaintOverride(map, 'park_nature_reserve', 'fill-opacity', BASEMAP_OVERRIDE_FOREST_GREEN_OPACITY);

  applyPaintOverride(map, 'landuse', 'fill-color', [
    'case',
    ['==', ['get', 'class'], 'cemetery'], BASEMAP_OVERRIDE_PARK_GREEN_COLOR,
    ['==', ['get', 'class'], 'stadium'], BASEMAP_OVERRIDE_GENERIC_GREEN_COLOR,
    BASEMAP_OVERRIDE_GENERIC_GREEN_COLOR,
  ]);
  applyPaintOverride(map, 'landuse', 'fill-opacity', [
    'case',
    ['==', ['get', 'class'], 'cemetery'], BASEMAP_OVERRIDE_PARK_GREEN_OPACITY,
    ['==', ['get', 'class'], 'stadium'], BASEMAP_OVERRIDE_GENERIC_GREEN_OPACITY,
    BASEMAP_OVERRIDE_GENERIC_GREEN_OPACITY,
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
