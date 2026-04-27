/**
 * Evaluates readiness of scenario resources for immediate gameplay routing.
 */
export type ScenarioReadinessStatus = 'ready' | 'missing-assets';

/**
 * Explicit viewport coordinates for initial map projection anchor logic.
 */
export interface ScenarioViewport {
  /** Target longitude. */
  readonly lng: number;
  /** Target latitude. */
  readonly lat: number;
  /** Initial zoom scalar. */
  readonly zoom: number;
}

/**
 * Outer playable boundary bounding box.
 */
export interface ScenarioPlayableBounds {
  readonly west: number;
  readonly south: number;
  readonly east: number;
  readonly north: number;
}

/**
 * Hard structural parameters defining scenario gameplay contexts.
 */
export interface ScenarioDefinition {
  /** Payload schema validation version. */
  readonly schemaVersion: number;
  /** Identifier string matching asset schemas. */
  readonly scenarioId: string;
  /** Human-readable display label. */
  readonly title: string;
  /** Narrative focus brief. */
  readonly description: string;
  /** Bounded operational area code. */
  readonly areaId: string;
  /** Required OSM and routing asset pointers. */
  readonly requiredAssets: {
    readonly routing: {
      readonly areaId: string;
      readonly engine: string;
      readonly profile: string;
      readonly algorithm: string;
    };
    readonly stopCandidates: {
      readonly areaId: string;
    };
  };
  /** Default viewport bounds. */
  readonly initialViewport: ScenarioViewport;
  /** Outer geographic limits. */
  readonly playableBounds: ScenarioPlayableBounds;
  /** Available startup funds. */
  readonly startingBudget: number;
  /** Default time schedule starting point. */
  readonly simulationStart: {
    readonly weekday: string;
    readonly time: string;
  };
  /** Target demand vector configuration code. */
  readonly demandProfileId: string;
  /** Specific metrics mapped for completion criteria. */
  readonly objectives: ReadonlyArray<{
    readonly objectiveId: string;
    readonly label: string;
  }>;
}

/**
 * Fully validated browser-facing runtime registry entry schema.
 */
export interface ScenarioRegistryEntry {
  /** Scenario primary key identifier. */
  readonly scenarioId: string;
  /** Human-readable descriptive label. */
  readonly title: string;
  /** Functional content descriptor. */
  readonly description: string;
  /** Regional coverage handle. */
  readonly areaId: string;
  /** Asset capability indicator. */
  readonly status: ScenarioReadinessStatus;
  /** Collection of missing environment file requirements. */
  readonly missingRequirements: readonly string[];
  /** Direct definition mapping. */
  readonly scenario: ScenarioDefinition;
}

/**
 * Full client-ready scenarios container wrapper.
 */
export interface ScenarioRegistry {
  /** Manifest schema verification index. */
  readonly schemaVersion: number;
  /** Compilation UTC timestamp. */
  readonly generatedAt: string;
  /** Parsed selection entries. */
  readonly scenarios: readonly ScenarioRegistryEntry[];
}

/**
 * Validates an untrusted runtime fetch payload against scenario configuration shapes.
 * 
 * @param payload Untrusted raw JSON object.
 * @throws Error upon missing structural definitions.
 */
export function parseScenarioRegistryPayload(payload: unknown): ScenarioRegistry {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Scenario registry payload must be a valid JSON object.');
  }

  const raw = payload as Record<string, unknown>;

  if (typeof raw.schemaVersion !== 'number') {
    throw new Error('Registry payload missing numeric schemaVersion.');
  }

  if (typeof raw.generatedAt !== 'string') {
    throw new Error('Registry payload missing string generatedAt.');
  }

  if (!Array.isArray(raw.scenarios)) {
    throw new Error('Registry payload missing scenarios array.');
  }

  const scenarios: ScenarioRegistryEntry[] = raw.scenarios.map((entry: unknown, index: number) => {
    if (!entry || typeof entry !== 'object') {
      throw new Error(`Scenario entry at index ${index} is not an object.`);
    }

    const e = entry as Record<string, unknown>;

    if (typeof e.scenarioId !== 'string') throw new Error(`Scenario at index ${index} missing scenarioId.`);
    if (typeof e.title !== 'string') throw new Error(`Scenario at index ${index} missing title.`);
    if (typeof e.description !== 'string') throw new Error(`Scenario at index ${index} missing description.`);
    if (typeof e.areaId !== 'string') throw new Error(`Scenario at index ${index} missing areaId.`);
    
    if (e.status !== 'ready' && e.status !== 'missing-assets') {
      throw new Error(`Scenario ${e.scenarioId} holds invalid status state.`);
    }

    if (!Array.isArray(e.missingRequirements)) {
      throw new Error(`Scenario ${e.scenarioId} missingRequirements array empty or undefined.`);
    }

    const missingRequirements = e.missingRequirements.map((req: unknown) => String(req));

    const inner = e.scenario as Record<string, unknown> | undefined;
    if (!inner || typeof inner !== 'object') {
      throw new Error(`Scenario ${e.scenarioId} missing core scenario configuration definition block.`);
    }

    if (typeof inner.schemaVersion !== 'number') throw new Error(`Scenario ${e.scenarioId} inner missing schemaVersion.`);
    if (typeof inner.scenarioId !== 'string') throw new Error(`Scenario ${e.scenarioId} inner missing scenarioId.`);
    if (typeof inner.title !== 'string') throw new Error(`Scenario ${e.scenarioId} inner missing title.`);
    if (typeof inner.description !== 'string') throw new Error(`Scenario ${e.scenarioId} inner missing description.`);
    if (typeof inner.areaId !== 'string') throw new Error(`Scenario ${e.scenarioId} inner missing areaId.`);

    const viewport = inner.initialViewport as Record<string, unknown> | undefined;
    if (!viewport || typeof viewport !== 'object') {
      throw new Error(`Scenario ${e.scenarioId} missing initialViewport metadata.`);
    }
    if (typeof viewport.lng !== 'number' || typeof viewport.lat !== 'number' || typeof viewport.zoom !== 'number') {
      throw new Error(`Scenario ${e.scenarioId} contains malformed initialViewport values.`);
    }

    const playableBounds = inner.playableBounds as Record<string, unknown> | undefined;
    if (!playableBounds || typeof playableBounds !== 'object') {
      throw new Error(`Scenario ${e.scenarioId} missing playableBounds.`);
    }
    if (
      typeof playableBounds.west !== 'number' ||
      typeof playableBounds.south !== 'number' ||
      typeof playableBounds.east !== 'number' ||
      typeof playableBounds.north !== 'number'
    ) {
      throw new Error(`Scenario ${e.scenarioId} contains malformed playableBounds.`);
    }

    const reqAssets = inner.requiredAssets as Record<string, unknown> | undefined;
    const routingAsset = reqAssets?.routing as Record<string, unknown> | undefined;
    const stopAsset = reqAssets?.stopCandidates as Record<string, unknown> | undefined;

    const objectives = Array.isArray(inner.objectives)
      ? inner.objectives.map((o: unknown, oIndex: number) => {
          if (!o || typeof o !== 'object') throw new Error(`Scenario ${e.scenarioId} objective index ${oIndex} invalid.`);
          const obj = o as Record<string, unknown>;
          if (typeof obj.objectiveId !== 'string' || typeof obj.label !== 'string') {
            throw new Error(`Scenario ${e.scenarioId} objective index ${oIndex} lacks schema requirements.`);
          }
          return {
            objectiveId: obj.objectiveId,
            label: obj.label
          };
        })
      : [];

    const simStart = inner.simulationStart as Record<string, unknown> | undefined;

    return {
      scenarioId: e.scenarioId,
      title: e.title,
      description: e.description,
      areaId: e.areaId,
      status: e.status as ScenarioReadinessStatus,
      missingRequirements,
      scenario: {
        schemaVersion: inner.schemaVersion as number,
        scenarioId: inner.scenarioId as string,
        title: inner.title as string,
        description: inner.description as string,
        areaId: inner.areaId as string,
        requiredAssets: {
          routing: {
            areaId: String(routingAsset?.areaId ?? ''),
            engine: String(routingAsset?.engine ?? ''),
            profile: String(routingAsset?.profile ?? ''),
            algorithm: String(routingAsset?.algorithm ?? '')
          },
          stopCandidates: {
            areaId: String(stopAsset?.areaId ?? '')
          }
        },
        initialViewport: {
          lng: viewport.lng as number,
          lat: viewport.lat as number,
          zoom: viewport.zoom as number
        },
        playableBounds: {
          west: playableBounds.west as number,
          south: playableBounds.south as number,
          east: playableBounds.east as number,
          north: playableBounds.north as number
        },
        startingBudget: Number(inner.startingBudget ?? 0),
        simulationStart: {
          weekday: String(simStart?.weekday ?? 'monday'),
          time: String(simStart?.time ?? '05:00')
        },
        demandProfileId: String(inner.demandProfileId ?? ''),
        objectives
      }
    };
  });

  return {
    schemaVersion: raw.schemaVersion,
    generatedAt: raw.generatedAt,
    scenarios
  };
}
