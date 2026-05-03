import type { ReactElement } from 'react';
import { MaterialIcon } from './icons/MaterialIcon';
import type { FocusedDemandGapPlanningContext } from '../app/focusedDemandGapPlanningContext';

interface PlanningContextBannerProps {
  /** The planning context to display. */
  readonly context: FocusedDemandGapPlanningContext;
  /** Callback triggered when the user dismisses the banner. */
  readonly onDismiss: () => void;
}

/**
 * Renders a transient, dismissible context banner providing guidance after a planning entrypoint is triggered.
 * 
 * This component remains non-authoritative and only displays shell-owned transient context.
 */
export function PlanningContextBanner({ context, onDismiss }: PlanningContextBannerProps): ReactElement {
  return (
    <div className={`planning-context-banner planning-context-banner--${context.kind}`} role="status">
      <div className="planning-context-banner__content">
        <MaterialIcon name="info" className="planning-context-banner__icon" />
        <div className="planning-context-banner__text">
          <strong className="planning-context-banner__title">{context.title}</strong>
          <p className="planning-context-banner__description">{context.description}</p>
        </div>
      </div>
      <button
        type="button"
        className="planning-context-banner__dismiss"
        aria-label="Dismiss planning context"
        onClick={onDismiss}
      >
        <MaterialIcon name="close" />
      </button>
    </div>
  );
}
