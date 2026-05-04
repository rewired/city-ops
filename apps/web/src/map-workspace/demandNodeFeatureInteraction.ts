import type { MapLibreGeoJsonFeature } from './maplibreGlobal';
import type { ScenarioDemandPreviewFeatureProperties } from './scenarioDemandPreviewGeoJson';

/**
 * Safely decodes a scenario demand node ID from a MapLibre rendered feature.
 * 
 * @param feature A MapLibre feature from the scenario demand preview layer.
 */
export function decodeDemandNodeIdFromFeature(
  feature: MapLibreGeoJsonFeature<ScenarioDemandPreviewFeatureProperties> | undefined
): string | null {
  if (!feature || !feature.properties) {
    return null;
  }

  const { entityId, entityKind } = feature.properties;

  // We only treat 'node', 'attractor', or 'gateway' as selectable if they have an entityId.
  // In the current scenario demand preview projection, these all map to scenario demand nodes.
  if (typeof entityId === 'string' && entityId.length > 0) {
    return entityId;
  }

  return null;
}
