import type {
  ScenarioDemandArtifact,
  ScenarioDemandSourceEntry,
  ScenarioDemandSourceMetadata,
  ScenarioDemandNode,
  ScenarioDemandAttractor,
  ScenarioDemandGateway,
  ScenarioDemandSourceKind,
  ScenarioDemandNodeRole,
  ScenarioDemandNodeClass,
  ScenarioDemandAttractorCategory,
  ScenarioDemandScale,
  ScenarioDemandGatewayKind
} from '../types/scenarioDemand';
import { MVP_TIME_BAND_IDS } from '../constants/timeBands';
import {
  ALLOWED_DEMAND_NODE_ROLES,
  ALLOWED_DEMAND_NODE_CLASSES,
  ALLOWED_ATTRACTOR_CATEGORIES,
  ALLOWED_DEMAND_SCALES,
  ALLOWED_GATEWAY_KINDS,
  ALLOWED_DEMAND_SOURCE_KINDS
} from '../constants/scenarioDemand';
import type { TimeBandId } from '../types/timeBand';

/**
 * Validates an untrusted payload against the ScenarioDemandArtifact schema.
 * 
 * @param payload Untrusted raw JSON object.
 * @throws Error upon structural or value constraints violations.
 */
export function parseScenarioDemandArtifact(payload: unknown): ScenarioDemandArtifact {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Scenario demand artifact must be a valid JSON object.');
  }

  const raw = payload as Record<string, unknown>;

  if (typeof raw.schemaVersion !== 'number') {
    throw new Error('Demand artifact missing numeric schemaVersion.');
  }

  if (typeof raw.scenarioId !== 'string') {
    throw new Error('Demand artifact missing string scenarioId.');
  }

  if (typeof raw.generatedAt !== 'string') {
    throw new Error('Demand artifact missing string generatedAt.');
  }

  if (!raw.sourceMetadata || typeof raw.sourceMetadata !== 'object') {
    throw new Error('Demand artifact missing sourceMetadata object.');
  }

  const rawMeta = raw.sourceMetadata as Record<string, unknown>;
  if (!Array.isArray(rawMeta.generatedFrom)) {
    throw new Error('sourceMetadata missing generatedFrom array.');
  }

  if (typeof rawMeta.generatorName !== 'string') {
    throw new Error('sourceMetadata missing string generatorName.');
  }

  if (typeof rawMeta.generatorVersion !== 'string') {
    throw new Error('sourceMetadata missing string generatorVersion.');
  }

  const generatedFrom = rawMeta.generatedFrom.map((entry: unknown, index: number) => {
    if (!entry || typeof entry !== 'object') {
      throw new Error(`generatedFrom entry at index ${index} is not an object.`);
    }
    const e = entry as Record<string, unknown>;
    if (typeof e.sourceKind !== 'string' || !ALLOWED_DEMAND_SOURCE_KINDS.includes(e.sourceKind as ScenarioDemandSourceKind)) {
      throw new Error(`generatedFrom entry at index ${index} holds invalid sourceKind.`);
    }
    if (typeof e.label !== 'string') {
      throw new Error(`generatedFrom entry at index ${index} missing string label.`);
    }

    const parsedEntry: ScenarioDemandSourceEntry = {
      sourceKind: e.sourceKind as ScenarioDemandSourceKind,
      label: e.label,
      ...(typeof e.sourceDate === 'string' ? { sourceDate: e.sourceDate } : {}),
      ...(typeof e.datasetYear === 'number' ? { datasetYear: e.datasetYear } : {}),
      ...(typeof e.licenseHint === 'string' ? { licenseHint: e.licenseHint } : {}),
      ...(typeof e.attributionHint === 'string' ? { attributionHint: e.attributionHint } : {})
    };
    return parsedEntry;
  });

  const sourceMetadata: ScenarioDemandSourceMetadata = {
    generatedFrom,
    generatorName: rawMeta.generatorName,
    generatorVersion: rawMeta.generatorVersion,
    ...(typeof rawMeta.notes === 'string' ? { notes: rawMeta.notes } : {})
  };

  if (!Array.isArray(raw.nodes)) {
    throw new Error('Demand artifact missing nodes array.');
  }

  if (!Array.isArray(raw.attractors)) {
    throw new Error('Demand artifact missing attractors array.');
  }

  if (!Array.isArray(raw.gateways)) {
    throw new Error('Demand artifact missing gateways array.');
  }

  const knownIds = new Set<string>();

  const parsePosition = (pos: unknown, entityId: string, entityType: string) => {
    if (!pos || typeof pos !== 'object') {
      throw new Error(`${entityType} ${entityId} missing position object.`);
    }
    const p = pos as Record<string, unknown>;
    if (typeof p.lng !== 'number' || !Number.isFinite(p.lng)) {
      throw new Error(`${entityType} ${entityId} position lng must be a finite number.`);
    }
    if (typeof p.lat !== 'number' || !Number.isFinite(p.lat)) {
      throw new Error(`${entityType} ${entityId} position lat must be a finite number.`);
    }
    return { lng: p.lng, lat: p.lat };
  };

  const parseTimeBandWeights = (weights: unknown, entityId: string, entityType: string): Record<TimeBandId, number> => {
    if (!weights || typeof weights !== 'object') {
      throw new Error(`${entityType} ${entityId} missing timeBandWeights object.`);
    }
    const w = weights as Record<string, unknown>;
    const result: Partial<Record<TimeBandId, number>> = {};
    
    for (const bandId of MVP_TIME_BAND_IDS) {
      const val = w[bandId];
      if (typeof val !== 'number' || !Number.isFinite(val) || val < 0) {
        throw new Error(`${entityType} ${entityId} missing or invalid non-negative weight for time band ${bandId}.`);
      }
      result[bandId] = val;
    }
    return result as Record<TimeBandId, number>;
  };

  const nodes = raw.nodes.map((node: unknown, index: number) => {
    if (!node || typeof node !== 'object') {
      throw new Error(`Node at index ${index} is not an object.`);
    }
    const n = node as Record<string, unknown>;
    if (typeof n.id !== 'string') throw new Error(`Node at index ${index} missing string id.`);
    
    if (knownIds.has(n.id)) {
      throw new Error(`Duplicate entity ID detected: ${n.id}`);
    }
    knownIds.add(n.id);

    const position = parsePosition(n.position, n.id, 'Node');

    if (typeof n.role !== 'string' || !ALLOWED_DEMAND_NODE_ROLES.includes(n.role as ScenarioDemandNodeRole)) {
      throw new Error(`Node ${n.id} holds invalid role.`);
    }

    if (typeof n.class !== 'string' || !ALLOWED_DEMAND_NODE_CLASSES.includes(n.class as ScenarioDemandNodeClass)) {
      throw new Error(`Node ${n.id} holds invalid class.`);
    }

    if (typeof n.baseWeight !== 'number' || !Number.isFinite(n.baseWeight) || n.baseWeight < 0) {
      throw new Error(`Node ${n.id} requires non-negative numeric baseWeight.`);
    }

    const timeBandWeights = parseTimeBandWeights(n.timeBandWeights, n.id, 'Node');

    const parsedNode: ScenarioDemandNode = {
      id: n.id,
      position,
      role: n.role as ScenarioDemandNodeRole,
      class: n.class as ScenarioDemandNodeClass,
      baseWeight: n.baseWeight,
      timeBandWeights,
      ...(n.sourceTrace && typeof n.sourceTrace === 'object' ? { sourceTrace: n.sourceTrace as Record<string, unknown> } : {})
    };
    return parsedNode;
  });

  const attractors = raw.attractors.map((attractor: unknown, index: number) => {
    if (!attractor || typeof attractor !== 'object') {
      throw new Error(`Attractor at index ${index} is not an object.`);
    }
    const a = attractor as Record<string, unknown>;
    if (typeof a.id !== 'string') throw new Error(`Attractor at index ${index} missing string id.`);

    if (knownIds.has(a.id)) {
      throw new Error(`Duplicate entity ID detected: ${a.id}`);
    }
    knownIds.add(a.id);

    const position = parsePosition(a.position, a.id, 'Attractor');

    if (typeof a.category !== 'string' || !ALLOWED_ATTRACTOR_CATEGORIES.includes(a.category as ScenarioDemandAttractorCategory)) {
      throw new Error(`Attractor ${a.id} holds invalid category.`);
    }

    if (typeof a.scale !== 'string' || !ALLOWED_DEMAND_SCALES.includes(a.scale as ScenarioDemandScale)) {
      throw new Error(`Attractor ${a.id} holds invalid scale.`);
    }

    if (typeof a.sourceWeight !== 'number' || !Number.isFinite(a.sourceWeight) || a.sourceWeight < 0) {
      throw new Error(`Attractor ${a.id} requires non-negative numeric sourceWeight.`);
    }

    if (typeof a.sinkWeight !== 'number' || !Number.isFinite(a.sinkWeight) || a.sinkWeight < 0) {
      throw new Error(`Attractor ${a.id} requires non-negative numeric sinkWeight.`);
    }

    let timeBandWeights: Record<TimeBandId, number> | undefined;
    if (a.timeBandWeights !== undefined) {
      timeBandWeights = parseTimeBandWeights(a.timeBandWeights, a.id, 'Attractor');
    }

    const parsedAttractor: ScenarioDemandAttractor = {
      id: a.id,
      position,
      category: a.category as ScenarioDemandAttractorCategory,
      scale: a.scale as ScenarioDemandScale,
      sourceWeight: a.sourceWeight,
      sinkWeight: a.sinkWeight,
      ...(timeBandWeights ? { timeBandWeights } : {}),
      ...(a.sourceTrace && typeof a.sourceTrace === 'object' ? { sourceTrace: a.sourceTrace as Record<string, unknown> } : {})
    };
    return parsedAttractor;
  });

  const gateways = raw.gateways.map((gateway: unknown, index: number) => {
    if (!gateway || typeof gateway !== 'object') {
      throw new Error(`Gateway at index ${index} is not an object.`);
    }
    const g = gateway as Record<string, unknown>;
    if (typeof g.id !== 'string') throw new Error(`Gateway at index ${index} missing string id.`);

    if (knownIds.has(g.id)) {
      throw new Error(`Duplicate entity ID detected: ${g.id}`);
    }
    knownIds.add(g.id);

    const position = parsePosition(g.position, g.id, 'Gateway');

    if (typeof g.kind !== 'string' || !ALLOWED_GATEWAY_KINDS.includes(g.kind as ScenarioDemandGatewayKind)) {
      throw new Error(`Gateway ${g.id} holds invalid kind.`);
    }

    if (typeof g.scale !== 'string' || !ALLOWED_DEMAND_SCALES.includes(g.scale as ScenarioDemandScale)) {
      throw new Error(`Gateway ${g.id} holds invalid scale.`);
    }

    if (typeof g.sourceWeight !== 'number' || !Number.isFinite(g.sourceWeight) || g.sourceWeight < 0) {
      throw new Error(`Gateway ${g.id} requires non-negative numeric sourceWeight.`);
    }

    if (typeof g.sinkWeight !== 'number' || !Number.isFinite(g.sinkWeight) || g.sinkWeight < 0) {
      throw new Error(`Gateway ${g.id} requires non-negative numeric sinkWeight.`);
    }

    if (typeof g.transferWeight !== 'number' || !Number.isFinite(g.transferWeight) || g.transferWeight < 0) {
      throw new Error(`Gateway ${g.id} requires non-negative numeric transferWeight.`);
    }

    const timeBandWeights = parseTimeBandWeights(g.timeBandWeights, g.id, 'Gateway');

    const parsedGateway: ScenarioDemandGateway = {
      id: g.id,
      position,
      kind: g.kind as ScenarioDemandGatewayKind,
      scale: g.scale as ScenarioDemandScale,
      sourceWeight: g.sourceWeight,
      sinkWeight: g.sinkWeight,
      transferWeight: g.transferWeight,
      timeBandWeights,
      ...(g.sourceTrace && typeof g.sourceTrace === 'object' ? { sourceTrace: g.sourceTrace as Record<string, unknown> } : {})
    };
    return parsedGateway;
  });

  return {
    schemaVersion: raw.schemaVersion,
    scenarioId: raw.scenarioId,
    generatedAt: raw.generatedAt,
    sourceMetadata,
    nodes,
    attractors,
    gateways
  };
}
