import type { OsmStopCandidateGroupId } from '../domain/types/osmStopCandidate';
import { createOsmStopCandidateGroupId } from '../domain/types/osmStopCandidate';
import type { ScenarioDemandNode } from '../domain/types/scenarioDemand';
import type { MapLibreMap } from './maplibreGlobal';
import {
  MAP_LAYER_ID_OSM_STOP_CANDIDATES_CIRCLE,
  MAP_LAYER_ID_SCENARIO_DEMAND_PREVIEW_CIRCLE,
  MAP_OSM_STOP_CANDIDATE_CIRCLE_LAYER_PAINT,
  MAP_OSM_STOP_CANDIDATE_HOVER_CIRCLE_RADIUS,
  MAP_OSM_STOP_CANDIDATE_HOVER_STROKE_COLOR,
  MAP_OSM_STOP_CANDIDATE_HOVER_STROKE_WIDTH,
  MAP_SCENARIO_DEMAND_PREVIEW_CIRCLE_LAYER_PAINT,
  MAP_SCENARIO_DEMAND_PREVIEW_HOVER_CIRCLE_RADIUS,
  MAP_SCENARIO_DEMAND_PREVIEW_HOVER_STROKE_COLOR,
  MAP_SCENARIO_DEMAND_PREVIEW_HOVER_STROKE_WIDTH
} from './mapRenderConstants';

/**
 * Shared hover affordance target for clickable map entities.
 *
 * The OSM branch uses the rendered consolidated candidate group id because
 * OSM candidate map interaction is group-based until explicit adoption.
 */
export type MapEntityHoverTarget =
  | { readonly kind: 'demand-node'; readonly id: ScenarioDemandNode['id'] }
  | { readonly kind: 'osm-stop-candidate'; readonly id: OsmStopCandidateGroupId };

/**
 * Minimal canvas surface required to toggle the map cursor during hover.
 */
export interface MapEntityHoverCanvas {
  /** Mutable CSS cursor value for the MapLibre canvas element. */
  readonly style: {
    cursor: string;
  };
}

/**
 * Minimal map surface required to apply and clear hover-only affordance styling.
 */
export type MapEntityHoverAffordanceMap = Pick<MapLibreMap, 'getLayer' | 'setPaintProperty'> & {
  /** Returns the canvas-like element whose cursor should reflect hover affordance. */
  getCanvas(): MapEntityHoverCanvas;
};

const hasNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

/**
 * Decodes a supported clickable map entity hover target from rendered feature properties.
 *
 * Returns null for unsupported, incomplete, or malformed property records.
 */
export function decodeMapEntityHoverTargetFromFeatureProperties(
  properties: Record<string, unknown> | undefined
): MapEntityHoverTarget | null {
  if (!properties) {
    return null;
  }

  if (hasNonEmptyString(properties.entityId)) {
    return {
      kind: 'demand-node',
      id: properties.entityId
    };
  }

  if (hasNonEmptyString(properties.candidateGroupId)) {
    return {
      kind: 'osm-stop-candidate',
      id: createOsmStopCandidateGroupId(properties.candidateGroupId)
    };
  }

  return null;
}

const setPaintPropertyIfLayerExists = (
  map: MapEntityHoverAffordanceMap,
  layerId: string,
  propertyName: string,
  value: string | number | boolean | readonly unknown[]
): void => {
  if (!map.getLayer(layerId)) {
    return;
  }

  map.setPaintProperty(layerId, propertyName, value);
};

const clearDemandNodeHoverPaint = (map: MapEntityHoverAffordanceMap): void => {
  setPaintPropertyIfLayerExists(
    map,
    MAP_LAYER_ID_SCENARIO_DEMAND_PREVIEW_CIRCLE,
    'circle-radius',
    MAP_SCENARIO_DEMAND_PREVIEW_CIRCLE_LAYER_PAINT['circle-radius']
  );
  setPaintPropertyIfLayerExists(
    map,
    MAP_LAYER_ID_SCENARIO_DEMAND_PREVIEW_CIRCLE,
    'circle-stroke-width',
    MAP_SCENARIO_DEMAND_PREVIEW_CIRCLE_LAYER_PAINT['circle-stroke-width']
  );
  setPaintPropertyIfLayerExists(
    map,
    MAP_LAYER_ID_SCENARIO_DEMAND_PREVIEW_CIRCLE,
    'circle-stroke-color',
    MAP_SCENARIO_DEMAND_PREVIEW_CIRCLE_LAYER_PAINT['circle-stroke-color']
  );
};

const clearOsmStopCandidateHoverPaint = (map: MapEntityHoverAffordanceMap): void => {
  setPaintPropertyIfLayerExists(
    map,
    MAP_LAYER_ID_OSM_STOP_CANDIDATES_CIRCLE,
    'circle-radius',
    MAP_OSM_STOP_CANDIDATE_CIRCLE_LAYER_PAINT['circle-radius']
  );
  setPaintPropertyIfLayerExists(
    map,
    MAP_LAYER_ID_OSM_STOP_CANDIDATES_CIRCLE,
    'circle-stroke-width',
    MAP_OSM_STOP_CANDIDATE_CIRCLE_LAYER_PAINT['circle-stroke-width']
  );
  setPaintPropertyIfLayerExists(
    map,
    MAP_LAYER_ID_OSM_STOP_CANDIDATES_CIRCLE,
    'circle-stroke-color',
    MAP_OSM_STOP_CANDIDATE_CIRCLE_LAYER_PAINT['circle-stroke-color']
  );
};

const applyDemandNodeHoverPaint = (
  map: MapEntityHoverAffordanceMap,
  targetId: ScenarioDemandNode['id']
): void => {
  setPaintPropertyIfLayerExists(
    map,
    MAP_LAYER_ID_SCENARIO_DEMAND_PREVIEW_CIRCLE,
    'circle-radius',
    [
      'case',
      ['==', ['get', 'entityId'], targetId],
      MAP_SCENARIO_DEMAND_PREVIEW_HOVER_CIRCLE_RADIUS,
      MAP_SCENARIO_DEMAND_PREVIEW_CIRCLE_LAYER_PAINT['circle-radius']
    ]
  );
  setPaintPropertyIfLayerExists(
    map,
    MAP_LAYER_ID_SCENARIO_DEMAND_PREVIEW_CIRCLE,
    'circle-stroke-width',
    [
      'case',
      ['==', ['get', 'entityId'], targetId],
      MAP_SCENARIO_DEMAND_PREVIEW_HOVER_STROKE_WIDTH,
      MAP_SCENARIO_DEMAND_PREVIEW_CIRCLE_LAYER_PAINT['circle-stroke-width']
    ]
  );
  setPaintPropertyIfLayerExists(
    map,
    MAP_LAYER_ID_SCENARIO_DEMAND_PREVIEW_CIRCLE,
    'circle-stroke-color',
    [
      'case',
      ['==', ['get', 'entityId'], targetId],
      MAP_SCENARIO_DEMAND_PREVIEW_HOVER_STROKE_COLOR,
      MAP_SCENARIO_DEMAND_PREVIEW_CIRCLE_LAYER_PAINT['circle-stroke-color']
    ]
  );
};

const applyOsmStopCandidateHoverPaint = (
  map: MapEntityHoverAffordanceMap,
  targetId: OsmStopCandidateGroupId
): void => {
  setPaintPropertyIfLayerExists(
    map,
    MAP_LAYER_ID_OSM_STOP_CANDIDATES_CIRCLE,
    'circle-radius',
    [
      'case',
      ['==', ['get', 'candidateGroupId'], targetId],
      MAP_OSM_STOP_CANDIDATE_HOVER_CIRCLE_RADIUS,
      MAP_OSM_STOP_CANDIDATE_CIRCLE_LAYER_PAINT['circle-radius']
    ]
  );
  setPaintPropertyIfLayerExists(
    map,
    MAP_LAYER_ID_OSM_STOP_CANDIDATES_CIRCLE,
    'circle-stroke-width',
    [
      'case',
      ['==', ['get', 'candidateGroupId'], targetId],
      MAP_OSM_STOP_CANDIDATE_HOVER_STROKE_WIDTH,
      MAP_OSM_STOP_CANDIDATE_CIRCLE_LAYER_PAINT['circle-stroke-width']
    ]
  );
  setPaintPropertyIfLayerExists(
    map,
    MAP_LAYER_ID_OSM_STOP_CANDIDATES_CIRCLE,
    'circle-stroke-color',
    [
      'case',
      ['==', ['get', 'candidateGroupId'], targetId],
      MAP_OSM_STOP_CANDIDATE_HOVER_STROKE_COLOR,
      MAP_OSM_STOP_CANDIDATE_CIRCLE_LAYER_PAINT['circle-stroke-color']
    ]
  );
};

/**
 * Applies pointer cursor and display-only paint emphasis for the current map entity hover target.
 *
 * Passing null clears all supported entity hover affordances.
 */
export function syncMapEntityHoverAffordance(
  map: MapEntityHoverAffordanceMap,
  target: MapEntityHoverTarget | null
): void {
  map.getCanvas().style.cursor = target ? 'pointer' : '';
  clearDemandNodeHoverPaint(map);
  clearOsmStopCandidateHoverPaint(map);

  if (!target) {
    return;
  }

  if (target.kind === 'demand-node') {
    applyDemandNodeHoverPaint(map, target.id);
    return;
  }

  applyOsmStopCandidateHoverPaint(map, target.id);
}
