import { describe, it, expect, vi } from 'vitest';
import { resolveNearbyStreetLabelCandidate } from './mapWorkspaceStreetSnap';
import type { MapLibreMap } from './maplibreGlobal';

describe('resolveNearbyStreetLabelCandidate', () => {
  it('returns label from nearby rendered feature', () => {
    const mockMap = {
      project: vi.fn().mockReturnValue({ x: 100, y: 100 }),
      queryRenderedFeatures: vi.fn().mockReturnValue([
        { properties: { name: 'Mönckebergstraße' } }
      ])
    } as unknown as MapLibreMap;

    const result = resolveNearbyStreetLabelCandidate(mockMap, { lng: 10, lat: 50 });
    expect(result).toBe('Mönckebergstraße');
    expect(mockMap.queryRenderedFeatures).toHaveBeenCalled();
  });

  it('returns null if no nearby feature has a name', () => {
    const mockMap = {
      project: vi.fn().mockReturnValue({ x: 100, y: 100 }),
      queryRenderedFeatures: vi.fn().mockReturnValue([
        { properties: { highway: 'residential' } }
      ])
    } as unknown as MapLibreMap;

    const result = resolveNearbyStreetLabelCandidate(mockMap, { lng: 10, lat: 50 });
    expect(result).toBeNull();
  });

  it('returns null if no features are found nearby', () => {
    const mockMap = {
      project: vi.fn().mockReturnValue({ x: 100, y: 100 }),
      queryRenderedFeatures: vi.fn().mockReturnValue([])
    } as unknown as MapLibreMap;

    const result = resolveNearbyStreetLabelCandidate(mockMap, { lng: 10, lat: 50 });
    expect(result).toBeNull();
  });
});
