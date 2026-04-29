import type { MapLibreGeoJsonFeatureCollection } from './maplibreGlobal';
import type { DemandNode, DemandNodeRole, DemandClass, DemandNodeId, DemandWeight } from '../domain/types/demandNode';
import type { TimeBandId } from '../domain/types/timeBand';
import type { NetworkDemandCapturePreviewProjection } from '../domain/projection/demandCapturePreviewProjection';

/**
 * MapLibre GeoJSON properties associated with a scenario-bound demand node feature.
 */
export interface DemandNodeFeatureProperties {
  readonly demandNodeId: DemandNodeId;
  readonly role: DemandNodeRole;
  readonly demandClass: DemandClass;
  readonly label: string;
  readonly activeWeight: DemandWeight;
  readonly captured: boolean;
  readonly capturedByStopCount: number;
  readonly capturedBySelectedStop: boolean;
}

/**
 * Translates internal static demand datasets into standard map rendering payload structures.
 * 
 * @param demandNodes Evaluated locations generating passenger intent.
 * @param activeTimeBandId The active time band context.
 * @param demandCapturePreviewProjection Precomputed structural capture state mapping.
 */
export function buildDemandNodeGeoJson(
  demandNodes: readonly DemandNode[],
  activeTimeBandId: TimeBandId,
  demandCapturePreviewProjection?: NetworkDemandCapturePreviewProjection
): MapLibreGeoJsonFeatureCollection {
  const captureMap = new Map(
    demandCapturePreviewProjection?.demandNodeCaptures.map((c) => [c.demandNodeId, c]) ?? []
  );

  return {
    type: 'FeatureCollection',

    features: demandNodes.map((node) => {
      const capture = captureMap.get(node.id);
      
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [node.position.lng, node.position.lat]
        },
        properties: {
          demandNodeId: node.id,
          role: node.role,
          demandClass: node.demandClass,
          label: node.label,
          activeWeight: node.weightByTimeBand[activeTimeBandId] ?? 0,
          captured: capture ? capture.capturedByStopCount > 0 : false,
          capturedByStopCount: capture ? capture.capturedByStopCount : 0,
          capturedBySelectedStop: capture ? capture.capturedBySelectedStop : false
        }
      };
    })
  };
}

