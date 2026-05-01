import type { ReactElement } from 'react';
import { MaterialIcon } from '../ui/icons/MaterialIcon';
import { INSPECTOR_TAB_IDS, INSPECTOR_TAB_LABELS, INSPECTOR_TAB_ICONS, type InspectorTabId } from './inspectorTabs';

interface InspectorTabBarProps {
  /** The currently active tab ID. */
  readonly activeTabId: InspectorTabId;
  /** Callback fired when a tab is clicked. */
  readonly onTabChange: (tabId: InspectorTabId) => void;
}

/**
 * Renders the navigation bar for switching between inspector tabs.
 */
export function InspectorTabBar({ activeTabId, onTabChange }: InspectorTabBarProps): ReactElement {
  return (
    <nav className="inspector-tabs" aria-label="Inspector tabs" role="tablist">
      {INSPECTOR_TAB_IDS.map((tabId) => (
        <button
          key={tabId}
          type="button"
          role="tab"
          aria-selected={activeTabId === tabId}
          className="inspector-tabs__button"
          onClick={() => onTabChange(tabId)}
          title={INSPECTOR_TAB_LABELS[tabId]}
          aria-label={INSPECTOR_TAB_LABELS[tabId]}
        >
          <MaterialIcon name={INSPECTOR_TAB_ICONS[tabId]} />
        </button>
      ))}
    </nav>
  );
}
