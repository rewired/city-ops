import { decodeMapEntityHoverTargetFromFeatureProperties } from './mapEntityHoverTarget';

/**
 * Minimal rendered demand feature shape required to decode scenario demand node IDs.
 */
export interface DemandNodeFeatureInteractionFeature {
  /** Raw MapLibre feature properties emitted by the scenario demand preview layer. */
  readonly properties?: Record<string, unknown>;
}

/**
 * Safely decodes a scenario demand node ID from raw MapLibre feature properties.
 * 
 * @param properties The properties record from a rendered map feature.
 */
export function decodeDemandNodeIdFromFeatureProperties(
  properties: Record<string, unknown> | undefined
): string | null {
  const target = decodeMapEntityHoverTargetFromFeatureProperties(properties);

  if (target?.kind === 'demand-node') {
    return target.id;
  }

  return null;
}

/**
 * Safely decodes a scenario demand node ID from a MapLibre rendered feature.
 * 
 * @param feature A MapLibre feature from the scenario demand preview layer.
 */
export function decodeDemandNodeIdFromFeature(
  feature: DemandNodeFeatureInteractionFeature | undefined
): string | null {
  return decodeDemandNodeIdFromFeatureProperties(feature?.properties);
}
