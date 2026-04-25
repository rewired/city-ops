import type { Stop } from '../types/stop';

/**
 * Creates a unique stop label from a base candidate and existing stops.
 * If the base label already exists, appends a deterministic numeric suffix.
 * Falls back to generic "Stop N" if no base label is provided.
 */
export const createUniqueStopLabel = (input: {
  readonly baseLabel: string | null;
  readonly fallbackOrdinal: number;
  readonly existingStops: readonly Stop[];
}): string => {
  const { baseLabel, fallbackOrdinal, existingStops } = input;

  // Use generic fallback if no base label candidate exists
  if (!baseLabel || baseLabel.trim().length === 0) {
    return `Stop ${fallbackOrdinal}`;
  }

  const normalizedBase = baseLabel.trim().replace(/\s+/g, ' ');
  const existingLabels = new Set(
    existingStops
      .map((s) => s.label?.trim().replace(/\s+/g, ' '))
      .filter((l): l is string => typeof l === 'string')
  );

  if (!existingLabels.has(normalizedBase)) {
    return normalizedBase;
  }

  // Find next available numeric suffix starting from 1
  let suffix = 1;
  while (existingLabels.has(`${normalizedBase} ${suffix}`)) {
    suffix += 1;
  }

  return `${normalizedBase} ${suffix}`;
};
