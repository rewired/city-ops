/**
 * Safe target for demand gap map feature focus interaction.
 */
export interface DemandGapFeatureFocusTarget {
  /** Canonical demand gap identifier. */
  readonly gapId: string;
}

/**
 * Decodes demand gap identifier from map feature properties.
 * 
 * Returns a valid focus target if the properties contain a valid string gapId,
 * otherwise returns null.
 * 
 * @param properties MapLibre feature properties object.
 */
export function decodeDemandGapIdFromFeatureProperties(
  properties: Record<string, unknown> | undefined
): DemandGapFeatureFocusTarget | null {
  const gapId = properties?.gapId;

  if (typeof gapId !== 'string') {
    return null;
  }

  return { gapId };
}
