import { describe, it, expect } from 'vitest';
import { decodeDemandGapIdFromFeatureProperties } from './demandGapFeatureInteraction';

describe('demandGapFeatureInteraction', () => {
  describe('decodeDemandGapIdFromFeatureProperties', () => {
    it('returns a focus target for valid properties with gapId', () => {
      const properties = { gapId: 'gap-123', other: 'data' };
      const result = decodeDemandGapIdFromFeatureProperties(properties);
      expect(result).toEqual({ gapId: 'gap-123' });
    });

    it('returns null for undefined properties', () => {
      const result = decodeDemandGapIdFromFeatureProperties(undefined);
      expect(result).toBeNull();
    });

    it('returns null when gapId is missing', () => {
      const properties = { other: 'data' };
      const result = decodeDemandGapIdFromFeatureProperties(properties);
      expect(result).toBeNull();
    });

    it('returns null when gapId is not a string', () => {
      const properties = { gapId: 123 };
      const result = decodeDemandGapIdFromFeatureProperties(properties);
      expect(result).toBeNull();
    });

    it('returns null for null gapId', () => {
      const properties: Record<string, unknown> = { gapId: null };
      const result = decodeDemandGapIdFromFeatureProperties(properties);
      expect(result).toBeNull();
    });
  });
});
