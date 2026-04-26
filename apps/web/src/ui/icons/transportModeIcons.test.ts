import { describe, expect, it } from 'vitest';

import { TRANSPORT_MODE_ICON_NAMES, TRANSPORT_MODE_ICON_SYMBOL_SETTINGS } from './transportModeIcons';

describe('transportModeIcons', () => {
  it('should have the correct canonical mapping for all five transport modes', () => {
    expect(TRANSPORT_MODE_ICON_NAMES).toEqual({
      bus: 'directions_bus',
      tram: 'tram',
      metro: 'subway',
      rail: 'train',
      ferry: 'directions_boat'
    });
  });

  it('should define the canonical rendering settings', () => {
    expect(TRANSPORT_MODE_ICON_SYMBOL_SETTINGS).toEqual({
      family: 'sharp',
      weight: 100,
      fill: 1,
      grade: 200,
      opticalSize: 24
    });
  });

  it('should include all required keys in the mapping', () => {
    const keys = Object.keys(TRANSPORT_MODE_ICON_NAMES);
    expect(keys).toContain('bus');
    expect(keys).toContain('tram');
    expect(keys).toContain('metro');
    expect(keys).toContain('rail');
    expect(keys).toContain('ferry');
    expect(keys).toHaveLength(5);
  });
});
