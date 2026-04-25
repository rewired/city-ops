import type { ReactElement } from 'react';

import type { StopSelectedInspectorPanelState } from './types';

interface SelectedStopInspectorProps {
  readonly panelState: StopSelectedInspectorPanelState;
}

/** Renders the stop-selected inspector state without owning selection truth. */
export function SelectedStopInspector({ panelState }: SelectedStopInspectorProps): ReactElement {
  const { stop } = panelState;

  return (
    <div className="inspector-card">
      <h3>Stop details</h3>
      <table className="inspector-compact-table">
        <tbody>
          <tr>
            <th scope="row">Label</th>
            <td>{stop.label}</td>
          </tr>
          <tr>
            <th scope="row">ID</th>
            <td>{stop.id}</td>
          </tr>
          <tr>
            <th scope="row">Position</th>
            <td>{`${stop.position.lat.toFixed(5)}, ${stop.position.lng.toFixed(5)}`}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
