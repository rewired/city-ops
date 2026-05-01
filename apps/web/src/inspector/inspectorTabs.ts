import type { MaterialIconName } from '../ui/icons/materialIcons';

/** Canonical UI-local tab identifiers for inspector panel navigation. */
export const INSPECTOR_TAB_IDS = ['overview', 'lines', 'demand', 'service'] as const;

/** Union of available UI-local inspector tab ids. */
export type InspectorTabId = (typeof INSPECTOR_TAB_IDS)[number];

/** Accessible labels keyed by tab id for inspector tab trigger rendering. */
export const INSPECTOR_TAB_LABELS: Readonly<Record<InspectorTabId, string>> = {
  overview: 'Overview',
  lines: 'Lines',
  demand: 'Demand',
  service: 'Service'
};

/** Material icon names keyed by tab id for inspector tab trigger rendering. */
export const INSPECTOR_TAB_ICONS: Readonly<Record<InspectorTabId, MaterialIconName>> = {
  overview: 'monitoring',
  lines: 'route',
  demand: 'groups',
  service: 'speed'
};
