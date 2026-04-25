import { describe, it, expect } from 'vitest';
import { createUniqueStopLabel } from './stopLabeling';
import { createStopId } from '../types/stop';

describe('createUniqueStopLabel', () => {
  const mockStops = [
    { id: createStopId('stop-1'), position: { lng: 0, lat: 0 }, label: 'Street A' },
    { id: createStopId('stop-2'), position: { lng: 0, lat: 0 }, label: 'Street A 1' }
  ];

  it('returns base label if no duplicates exist', () => {
    const result = createUniqueStopLabel({
      baseLabel: 'Street B',
      fallbackOrdinal: 3,
      existingStops: mockStops
    });
    expect(result).toBe('Street B');
  });

  it('appends numeric suffix if base label exists', () => {
    const result = createUniqueStopLabel({
      baseLabel: 'Street A',
      fallbackOrdinal: 3,
      existingStops: [{ id: createStopId('stop-1'), position: { lng: 0, lat: 0 }, label: 'Street A' }]
    });
    expect(result).toBe('Street A 1');
  });

  it('finds next available numeric suffix', () => {
    const result = createUniqueStopLabel({
      baseLabel: 'Street A',
      fallbackOrdinal: 3,
      existingStops: mockStops
    });
    expect(result).toBe('Street A 2');
  });

  it('falls back to generic label if base label is null', () => {
    const result = createUniqueStopLabel({
      baseLabel: null,
      fallbackOrdinal: 3,
      existingStops: mockStops
    });
    expect(result).toBe('Stop 3');
  });

  it('falls back to generic label if base label is empty', () => {
    const result = createUniqueStopLabel({
      baseLabel: '  ',
      fallbackOrdinal: 4,
      existingStops: mockStops
    });
    expect(result).toBe('Stop 4');
  });

  it('normalizes whitespace for duplicate comparison', () => {
    const result = createUniqueStopLabel({
      baseLabel: 'Street   A',
      fallbackOrdinal: 3,
      existingStops: mockStops
    });
    expect(result).toBe('Street A 2');
  });

  it('handles empty existing stops list', () => {
    const result = createUniqueStopLabel({
      baseLabel: 'New Street',
      fallbackOrdinal: 1,
      existingStops: []
    });
    expect(result).toBe('New Street');
  });
});
