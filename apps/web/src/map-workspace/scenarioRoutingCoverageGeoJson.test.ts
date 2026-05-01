import { describe, expect, it } from 'vitest';
import { buildScenarioRoutingCoverageMaskFeatureCollection } from './scenarioRoutingCoverageGeoJson';
import type { ScenarioRoutingCoverage } from '../domain/scenario/scenarioRegistry';

describe('scenarioRoutingCoverageGeoJson', () => {
  describe('buildScenarioRoutingCoverageMaskFeatureCollection', () => {
    it('returns empty collection when coverage is null', () => {
      const result = buildScenarioRoutingCoverageMaskFeatureCollection(null);
      expect(result.features).toHaveLength(0);
    });

    it('builds an inverted polygon with two rings for valid bounds', () => {
      const coverage: ScenarioRoutingCoverage = {
        kind: 'bounds',
        bounds: { west: 10, south: 50, east: 11, north: 51 }
      };

      const result = buildScenarioRoutingCoverageMaskFeatureCollection(coverage);
      
      expect(result.features).toHaveLength(1);
      const feature = result.features[0];
      expect(feature.geometry.type).toBe('Polygon');
      
      const coords = (feature.geometry as any).coordinates;
      expect(coords).toHaveLength(2); // Outer world ring and inner hole
      
      // Outer ring should be world bounds
      expect(coords[0][0]).toEqual([-180, 90]);
      
      // Inner ring should be our coverage bounds
      expect(coords[1][0]).toEqual([10, 51]);
      expect(coords[1][1]).toEqual([10, 50]);
    });
  });
});
