import { type ReactElement } from 'react';

/**
 * A compact, non-interactive map legend explaining the demand gap overlay categories.
 */
export function DemandGapLegend(): ReactElement {
  return (
    <div className="demand-gap-legend" aria-label="Demand gap legend">
      <header className="demand-gap-legend__header">
        <h4>Demand Gaps</h4>
      </header>
      <ul className="demand-gap-legend__list">
        <li className="demand-gap-legend__item">
          <div className="demand-gap-legend__swatch demand-gap-legend__swatch--uncaptured" />
          <span className="demand-gap-legend__label">Uncaptured Residential</span>
        </li>
        <li className="demand-gap-legend__item">
          <div className="demand-gap-legend__swatch demand-gap-legend__swatch--unserved" />
          <span className="demand-gap-legend__label">Captured but Unserved</span>
        </li>
        <li className="demand-gap-legend__item">
          <div className="demand-gap-legend__swatch demand-gap-legend__swatch--unreachable" />
          <span className="demand-gap-legend__label">Unreachable Workplace</span>
        </li>
      </ul>
      <div className="demand-gap-legend__hint">
        Showing spatial pressure from the current demand gap projection.
      </div>
    </div>
  );
}
