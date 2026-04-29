import type {
  ScenarioDemandNodeRole,
  ScenarioDemandNodeClass,
  ScenarioDemandAttractorCategory,
  ScenarioDemandScale,
  ScenarioDemandGatewayKind,
  ScenarioDemandSourceKind
} from '../types/scenarioDemand';

/**
 * Allowed roles for demand nodes.
 */
export const ALLOWED_DEMAND_NODE_ROLES: readonly ScenarioDemandNodeRole[] = [
  'origin',
  'destination',
  'bidirectional'
];

/**
 * Allowed classes for demand nodes.
 */
export const ALLOWED_DEMAND_NODE_CLASSES: readonly ScenarioDemandNodeClass[] = [
  'residential',
  'workplace',
  'gateway',
  'education_future',
  'retail_future',
  'health_future',
  'leisure_future'
];

/**
 * Allowed categories for attractors.
 */
export const ALLOWED_ATTRACTOR_CATEGORIES: readonly ScenarioDemandAttractorCategory[] = [
  'workplace',
  'education',
  'retail',
  'health',
  'leisure'
];

/**
 * Allowed scales for attractors and gateways.
 */
export const ALLOWED_DEMAND_SCALES: readonly ScenarioDemandScale[] = [
  'local',
  'district',
  'major',
  'metropolitan'
];

/**
 * Allowed kinds for gateways.
 */
export const ALLOWED_GATEWAY_KINDS: readonly ScenarioDemandGatewayKind[] = [
  'rail-station',
  'bus-station',
  'airport',
  'ferry-terminal',
  'other'
];

/**
 * Allowed kinds for source data.
 */
export const ALLOWED_DEMAND_SOURCE_KINDS: readonly ScenarioDemandSourceKind[] = [
  'census',
  'osm',
  'commuter-statistics',
  'manual',
  'generated'
];
