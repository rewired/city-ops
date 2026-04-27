import { parseScenarioRegistryPayload, type ScenarioRegistry } from './scenarioRegistry';

/**
 * State result representing scenarios loading operational boundaries.
 */
export type ScenarioRegistryLoadResult =
  | { readonly status: 'loaded'; readonly registry: ScenarioRegistry }
  | { readonly status: 'failed'; readonly message: string };

/**
 * Fetches and validates scenario manifest definitions directly via HTTP pipeline.
 * 
 * Requests targeted at static public deployment assets.
 */
export async function loadScenarioRegistry(): Promise<ScenarioRegistryLoadResult> {
  try {
    const response = await fetch('/generated/scenarios/scenario-registry.json');

    if (!response.ok) {
      if (response.status === 404) {
        return {
          status: 'failed',
          message: 'Scenario registry asset not found on deployment server. Ensure assets are generated.'
        };
      }
      return {
        status: 'failed',
        message: `Failed HTTP registry synchronization. Response status: ${response.status} (${response.statusText})`
      };
    }

    const rawJson = await response.json();
    const parsedRegistry = parseScenarioRegistryPayload(rawJson);

    return {
      status: 'loaded',
      registry: parsedRegistry
    };
  } catch (error) {
    const errorString = error instanceof Error ? error.message : String(error);
    return {
      status: 'failed',
      message: `Scenario validation processing failure: ${errorString}`
    };
  }
}
