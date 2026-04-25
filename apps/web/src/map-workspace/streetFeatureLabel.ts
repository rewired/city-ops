/**
 * Key preference order for extracting a street name from MapLibre feature properties.
 */
const STREET_NAME_PROPERTY_KEYS = ['name', 'name:de', 'name:en', 'short_name', 'official_name'] as const;

/**
 * Common road-class or technical values to reject as street labels.
 */
const GENERIC_ROAD_CLASS_VALUES = new Set([
  'residential',
  'secondary',
  'primary',
  'tertiary',
  'road',
  'path',
  'service',
  'track',
  'footway',
  'cycleway',
  'motorway',
  'trunk',
  'living_street',
  'pedestrian',
  'unclassified'
]);

/**
 * Normalizes a string by trimming and collapsing repeated whitespace.
 */
const normalizeLabel = (value: string): string => value.trim().replace(/\s+/g, ' ');

/**
 * Extracts a candidate street label from MapLibre feature properties.
 * Returns null if no usable street name exists or if it contains only generic road-class values.
 */
export const extractStreetLabelCandidate = (properties: Record<string, unknown> | undefined): string | null => {
  if (!properties) {
    return null;
  }

  for (const key of STREET_NAME_PROPERTY_KEYS) {
    const rawValue = properties[key];

    if (typeof rawValue !== 'string') {
      continue;
    }

    const normalizedValue = normalizeLabel(rawValue);

    if (normalizedValue.length === 0) {
      continue;
    }

    // Reject if it's purely a generic road class name (case-insensitive)
    if (GENERIC_ROAD_CLASS_VALUES.has(normalizedValue.toLowerCase())) {
      continue;
    }

    return normalizedValue;
  }

  return null;
};
