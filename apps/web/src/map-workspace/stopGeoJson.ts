import type { Line } from '../domain/types/line';
import type { Stop, StopId } from '../domain/types/stop';
import type { MapLibreGeoJsonFeatureCollection } from './maplibreGlobal';

/**
 * Public stop feature property contract projected into MapLibre GeoJSON sources.
 */
export interface StopFeatureProperties {
  readonly stopId: StopId;
  readonly label: string;
  readonly selected: boolean;
  readonly draftMember: boolean;
  readonly buildLineInteractive: boolean;
  readonly selectedLineMember: boolean;
  readonly sequenceNumber: string | null;
}

/**
 * Builds a typed GeoJSON feature collection for all currently placed stops.
 */
export const buildStopFeatureCollection = ({
  stops,
  selectedStopId,
  draftStopIds,
  buildLineInteractive,
  selectedLine
}: {
  readonly stops: readonly Stop[];
  readonly selectedStopId: StopId | null;
  readonly draftStopIds: ReadonlySet<StopId>;
  readonly buildLineInteractive: boolean;
  readonly selectedLine: Line | null;
}): MapLibreGeoJsonFeatureCollection<StopFeatureProperties> => {
  const selectedLineStopIds = selectedLine?.stopIds ?? [];

  return {
    type: 'FeatureCollection',
    features: stops.map((stop) => {
      const selectedLineIndex = selectedLineStopIds.indexOf(stop.id);
      const isSelectedLineMember = selectedLineIndex !== -1;
      const sequenceNumber = isSelectedLineMember ? (selectedLineIndex + 1).toString() : null;

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [stop.position.lng, stop.position.lat]
        },
        properties: {
          stopId: stop.id,
          label: stop.label ?? stop.id,
          selected: selectedStopId === stop.id,
          draftMember: draftStopIds.has(stop.id),
          buildLineInteractive,
          selectedLineMember: isSelectedLineMember,
          sequenceNumber
        }
      };
    })
  };
};
