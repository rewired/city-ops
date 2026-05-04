import { describe, expect, it } from 'vitest';
import { decodeDemandNodeIdFromFeature } from './demandNodeFeatureInteraction';

describe('decodeDemandNodeIdFromFeature', () => {
  it('returns null for undefined feature', () => {
    expect(decodeDemandNodeIdFromFeature(undefined)).toBeNull();
  });

  it('returns null for feature without properties', () => {
    // @ts-expect-error - testing invalid input
    expect(decodeDemandNodeIdFromFeature({ type: 'Feature' })).toBeNull();
  });

  it('returns entityId for valid scenario demand node feature', () => {
    const mockFeature = {
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [0, 0] as [number, number] },
      properties: {
        entityId: 'node-123',
        entityKind: 'node' as const,
        label: 'Node 123',
        roleOrCategory: 'origin',
        scale: 'n/a',
        weight: 1.0
      }
    };

    expect(decodeDemandNodeIdFromFeature(mockFeature)).toBe('node-123');
  });

  it('returns null for malformed entityId', () => {
    const mockFeature = {
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [0, 0] as [number, number] },
      properties: {
        entityId: '',
        entityKind: 'node' as const,
        label: 'Node 123',
        roleOrCategory: 'origin',
        scale: 'n/a',
        weight: 1.0
      }
    };

    expect(decodeDemandNodeIdFromFeature(mockFeature)).toBeNull();
  });
});
