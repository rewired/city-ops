import type { Line } from '../domain/types/line';
import type { RouteGeometryCoordinate } from '../domain/types/lineRoute';
import type { Stop, StopId } from '../domain/types/stop';
import type { MapLibreGeoJsonFeatureCollection } from './maplibreGlobal';

/**
 * Public completed-line feature property contract projected into MapLibre GeoJSON sources.
 */
export interface CompletedLineFeatureProperties {
  readonly lineId: Line['id'];
  readonly selected: boolean;
}

/**
 * Public draft-line feature property contract projected into MapLibre GeoJSON sources.
 */
export interface DraftLineFeatureProperties {
  readonly draft: true;
}

const areCoordinatesEqual = (
  left: RouteGeometryCoordinate,
  right: RouteGeometryCoordinate
): boolean => left[0] === right[0] && left[1] === right[1];

const buildLineCoordinatesFromRouteSegments = (line: Line): readonly RouteGeometryCoordinate[] =>
  line.routeSegments.reduce<readonly RouteGeometryCoordinate[]>((flattenedCoordinates, segment) => {
    if (segment.orderedGeometry.length === 0) {
      return flattenedCoordinates;
    }

    if (flattenedCoordinates.length === 0) {
      return [...flattenedCoordinates, ...segment.orderedGeometry];
    }

    const lastCoordinate = flattenedCoordinates[flattenedCoordinates.length - 1];
    const firstCoordinate = segment.orderedGeometry[0];

    if (lastCoordinate === undefined || firstCoordinate === undefined) {
      return [...flattenedCoordinates, ...segment.orderedGeometry];
    }

    const segmentCoordinates = areCoordinatesEqual(lastCoordinate, firstCoordinate)
      ? segment.orderedGeometry.slice(1)
      : segment.orderedGeometry;

    return [...flattenedCoordinates, ...segmentCoordinates];
  }, []);

const buildLineCoordinatesFromStops = ({
  line,
  stopsById
}: {
  readonly line: Line;
  readonly stopsById: ReadonlyMap<StopId, Stop>;
}): readonly RouteGeometryCoordinate[] =>
  line.stopIds
    .map((stopId) => stopsById.get(stopId))
    .filter((stop): stop is Stop => stop !== undefined)
    .map((stop) => [stop.position.lng, stop.position.lat] as const);

/**
 * Builds a typed GeoJSON feature collection for completed session line paths.
 *
 * Route-segment geometry is preferred and flattened in segment order with shared
 * segment-boundary coordinate de-duplication. Stop-order coordinates remain as
 * a fallback when routed segment geometry is unavailable.
 */
export const buildCompletedLineFeatureCollection = ({
  lines,
  stopsById,
  selectedLineId
}: {
  readonly lines: readonly Line[];
  readonly stopsById: ReadonlyMap<StopId, Stop>;
  readonly selectedLineId: Line['id'] | null;
}): MapLibreGeoJsonFeatureCollection<CompletedLineFeatureProperties> => ({
  type: 'FeatureCollection',
  features: lines
    .map((line) => {
      const routeSegmentCoordinates = buildLineCoordinatesFromRouteSegments(line);
      const coordinates =
        routeSegmentCoordinates.length >= 2
          ? routeSegmentCoordinates
          : buildLineCoordinatesFromStops({ line, stopsById });

      if (coordinates.length < 2) {
        return null;
      }

      return {
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates
        },
        properties: {
          lineId: line.id,
          selected: selectedLineId === line.id
        }
      };
    })
    .filter((feature): feature is NonNullable<typeof feature> => feature !== null)
});

/**
 * Builds a typed GeoJSON feature collection for the active draft line stop-order preview.
 */
export const buildDraftLineFeatureCollection = ({
  draftStopIds,
  stopsById
}: {
  readonly draftStopIds: readonly StopId[];
  readonly stopsById: ReadonlyMap<StopId, Stop>;
}): MapLibreGeoJsonFeatureCollection<DraftLineFeatureProperties> => {
  const coordinates = draftStopIds
    .map((stopId) => stopsById.get(stopId))
    .filter((stop): stop is Stop => stop !== undefined)
    .map((stop) => [stop.position.lng, stop.position.lat] as const);

  return {
    type: 'FeatureCollection',
    features:
      coordinates.length < 2
        ? []
        : [
            {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates
              },
              properties: {
                draft: true
              }
            }
          ]
  };
};
