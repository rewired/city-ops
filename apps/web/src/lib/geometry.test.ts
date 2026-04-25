import { describe, expect, it } from 'vitest';
import { calculateGreatCircleDistanceMeters, toRadians } from './geometry';

describe('geometry', () => {
  describe('toRadians', () => {
    it('converts 180 degrees to Pi', () => {
      expect(toRadians(180)).toBe(Math.PI);
    });

    it('converts 90 degrees to half Pi', () => {
      expect(toRadians(90)).toBe(Math.PI / 2);
    });

    it('converts 0 degrees to 0', () => {
      expect(toRadians(0)).toBe(0);
    });
  });

  describe('calculateGreatCircleDistanceMeters', () => {
    it('calculates zero distance for the same coordinate', () => {
      const coord: readonly [number, number] = [13.404954, 52.520008]; // Berlin
      expect(calculateGreatCircleDistanceMeters(coord, coord)).toBe(0);
    });

    it('calculates distance accurately for a known short segment', () => {
      // Alexanderplatz to Brandenburger Tor (approx 2.2km)
      const alex: readonly [number, number] = [13.413215, 52.521918];
      const gate: readonly [number, number] = [13.377704, 52.516275];
      
      const dist = calculateGreatCircleDistanceMeters(alex, gate);
      // Rough bounds for Berlin city center
      expect(dist).toBeGreaterThan(2000);
      expect(dist).toBeLessThan(2500);
    });

    it('is deterministic', () => {
      const coordA: readonly [number, number] = [13.4, 52.5];
      const coordB: readonly [number, number] = [13.5, 52.6];
      
      const dist1 = calculateGreatCircleDistanceMeters(coordA, coordB);
      const dist2 = calculateGreatCircleDistanceMeters(coordA, coordB);
      expect(dist1).toBe(dist2);
    });
  });
});
