import type { ScenarioRoutingCoverage } from '../domain/scenario/scenarioRegistry';
import type { MapLibreGeoJsonFeatureCollection } from './maplibreGlobal';

/**
 * Builds an inverted GeoJSON mask representing everything OUTSIDE the scenario routing coverage.
 * Uses a world-wide bounding box with the coverage area as a hole.
 */
export const buildScenarioRoutingCoverageMaskFeatureCollection = (
  coverage: ScenarioRoutingCoverage | null
): MapLibreGeoJsonFeatureCollection => {
  if (!coverage || coverage.kind !== 'bounds') {
    return {
      type: 'FeatureCollection',
      features: []
    };
  }

  const { west, south, east, north } = coverage.bounds;

  // World bounds coordinates for the outer shell of the mask.
  // Using slightly less than 180/-90 to avoid wrapping artifacts in some projection engines, 
  // though MapLibre handles large values well.
  const WORLD_WEST = -180;
  const WORLD_SOUTH = -90;
  const WORLD_EAST = 180;
  const WORLD_NORTH = 90;

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            // Outer ring: Full world
            [
              [WORLD_WEST, WORLD_NORTH],
              [WORLD_EAST, WORLD_NORTH],
              [WORLD_EAST, WORLD_SOUTH],
              [WORLD_WEST, WORLD_SOUTH],
              [WORLD_WEST, WORLD_NORTH]
            ],
            // Inner ring (hole): Coverage area
            [
              [west, north],
              [west, south],
              [east, south],
              [east, north],
              [west, north]
            ]
          ]
        },
        properties: {}
      }
    ]
  };
};
