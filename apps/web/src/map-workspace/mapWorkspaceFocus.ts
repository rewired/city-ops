import type { MapLibreMap } from './maplibreGlobal';
import type { MapFocusIntent } from '../session/sessionTypes';
import type { Stop } from '../domain/types/stop';
import type { Line } from '../domain/types/line';
import { MAP_FOCUS_PADDING, MAP_FOCUS_ZOOM_STOP, MAP_ROUTING_COVERAGE_MAX_BOUNDS_PADDING } from './mapBootstrapConfig';
import type { ScenarioRoutingCoverage } from '../domain/scenario/scenarioRegistry';

/**
 * Input parameters for applying map workspace focus intent.
 */
export interface ApplyMapWorkspaceFocusIntentInput {
  /** The MapLibre instance to apply focus on. */
  readonly map: MapLibreMap;
  /** The focus intent specifying the target entity. */
  readonly intent: MapFocusIntent;
  /** The collection of all currently placed stops. */
  readonly stops: readonly Stop[];
  /** The collection of all currently active lines. */
  readonly lines: readonly Line[];
}

/**
 * Resolves the geographic bounds for a given line, either from its routed geometry
 * or falling back to ordered stop positions.
 * 
 * @param line The line to resolve bounds for.
 * @param stops The collection of placed stops to resolve fallback positions.
 * @returns A tuple of min/max [lng, lat] pairs, or null if no geometry can be resolved.
 */
export function resolveLineFocusBounds(
  line: Line,
  stops: readonly Stop[]
): [[number, number], [number, number]] | null {
  const coordinates: [number, number][] = [];

  // Collect all geometry coordinates if available
  line.routeSegments.forEach((segment) => {
    segment.orderedGeometry.forEach((coord) => {
      coordinates.push([coord[0], coord[1]]);
    });
  });

  // Fallback to stop positions if geometry is empty
  if (coordinates.length === 0) {
    const stopsById = new Map(stops.map((s) => [s.id, s] as const));
    line.stopIds.forEach((stopId) => {
      const stop = stopsById.get(stopId);
      if (stop) {
        coordinates.push([stop.position.lng, stop.position.lat]);
      }
    });
  }

  if (coordinates.length === 0) {
    return null;
  }

  const lats = coordinates.map((c) => c[1]);
  const lngs = coordinates.map((c) => c[0]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return [
    [minLng, minLat],
    [maxLng, maxLat]
  ];
}

/**
 * Applies the geographic focus intent onto the map workspace surface.
 * Resolves the target stop or line and eases or fits the viewport accordingly.
 * 
 * @param input The structured focus input containing map, intent, stops, and lines.
 */
export function applyMapWorkspaceFocusIntent(input: ApplyMapWorkspaceFocusIntentInput): void {
  const { map, intent, stops, lines } = input;
  const { target } = intent;

  if (target.type === 'stop') {
    const stop = stops.find((s) => s.id === target.id);
    if (stop) {
      map.easeTo({
        center: [stop.position.lng, stop.position.lat],
        zoom: MAP_FOCUS_ZOOM_STOP
      });
    }
  } else if (target.type === 'line') {
    const line = lines.find((l) => l.id === target.id);
    if (line) {
      const bounds = resolveLineFocusBounds(line, stops);
      if (bounds) {
        map.fitBounds(bounds, { padding: MAP_FOCUS_PADDING });
      }
    }
  } else if (target.type === 'position') {
    map.easeTo({
      center: [target.position.lng, target.position.lat],
      zoom: MAP_FOCUS_ZOOM_STOP
    });
  }
}

/**
 * Applies scenario-level max-bounds to the map workspace instance to prevent out-of-coverage drift.
 * Includes a small standardized padding around the coverage bounding box.
 * 
 * @param map The MapLibre instance.
 * @param coverage The scenario routing coverage definition.
 */
export function applyMapMaxBounds(map: MapLibreMap, coverage: ScenarioRoutingCoverage | null): void {
  if (!coverage || coverage.kind !== 'bounds') {
    map.setMaxBounds(null);
    return;
  }

  const { west, south, east, north } = coverage.bounds;
  const padding = MAP_ROUTING_COVERAGE_MAX_BOUNDS_PADDING;

  map.setMaxBounds([
    [west - padding, south - padding],
    [east + padding, north + padding]
  ]);
}
