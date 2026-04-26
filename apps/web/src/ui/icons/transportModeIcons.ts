import type { MaterialIconName } from './materialIcons';

/**
 * Defines the canonical keys for supported transport modes.
 */
export type TransportModeIconKey = 'bus' | 'tram' | 'metro' | 'rail' | 'ferry';

/**
 * Maps transport mode keys to their canonical Material Symbol ligature names.
 */
export const TRANSPORT_MODE_ICON_NAMES: Record<TransportModeIconKey, MaterialIconName> = {
  bus: 'directions_bus',
  tram: 'tram',
  metro: 'subway',
  rail: 'train',
  ferry: 'directions_boat'
};

/**
 * Defines the canonical Material Symbol variation settings for transport mode icons.
 * Uses Sharp style with specific weight, fill, grade, and optical size.
 */
export const TRANSPORT_MODE_ICON_SYMBOL_SETTINGS = {
  family: 'sharp' as const,
  weight: 100,
  fill: 1,
  grade: 200,
  opticalSize: 24
} as const;
