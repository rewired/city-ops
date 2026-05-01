import { useState, useEffect, type ReactElement } from 'react';
import { InlineRenameField } from './InlineRenameField';
import { SelectedLineInspector } from './SelectedLineInspector';
import type { Line } from '../domain/types/line';
import type { InspectorPanelState } from './types';
import type { TimeBandId } from '../domain/types/timeBand';
import type {
  LineFrequencyControlByTimeBand,
  LineFrequencyInputByTimeBand,
  LineFrequencyValidationByTimeBand,
  SelectedLineFrequencyUpdateAction
} from '../session/useNetworkSessionState';

interface InspectorLinesTabProps {
  readonly inspectorPanelState: InspectorPanelState;
  readonly completedLines: readonly Line[];
  readonly selectedLineRouteBaseline: import('../domain/types/routeBaseline').LineRouteBaseline | null;
  readonly placedStops: readonly import('../domain/types/stop').Stop[];
  readonly activeTimeBandId: TimeBandId;
  readonly selectedLineServiceProjection: ReturnType<typeof import('../domain/projection/lineServicePlanProjection').projectLineServicePlanForLine> | null;
  readonly selectedLineServiceInspectorProjection: ReturnType<typeof import('../domain/projection/lineServicePlanProjection').projectLineSelectedServiceInspector> | null;
  readonly selectedLinePlanningVehicleProjection: ReturnType<typeof import('../domain/projection/linePlanningVehicleProjection').projectLinePlanningVehicles> | null;
  readonly lineFrequencyInputByTimeBand: LineFrequencyInputByTimeBand;
  readonly lineFrequencyControlByTimeBand: LineFrequencyControlByTimeBand;
  readonly lineFrequencyValidationByTimeBand: LineFrequencyValidationByTimeBand;
  readonly onFrequencyChange: (
    timeBandId: TimeBandId,
    rawInputValue: string,
    action?: SelectedLineFrequencyUpdateAction
  ) => void;
  readonly onSelectedLineIdChange: (lineId: Line['id']) => void;
  readonly onStopSelectionChange: (stopId: import('../domain/types/stop').StopId) => void;
  readonly onLineSequenceStopFocus: (stopId: import('../domain/types/stop').StopId) => void;
  readonly onStopRename: (stopId: import('../domain/types/stop').StopId, nextLabel: string) => void;
  readonly onLineRename: (lineId: Line['id'], nextLabel: string) => void;
  readonly openDialogIntent: import('../session/sessionTypes').SelectedLineDialogOpenIntent | null;
  readonly onOpenDialogIntentConsumed: (intent: import('../session/sessionTypes').SelectedLineDialogOpenIntent | null) => void;
  readonly selectedLineDemandContribution: import('../domain/projection/selectedLineDemandContributionProjection').SelectedLineDemandContributionProjection | null;
}

/**
 * Renders the line management tab, supporting both a high-level list of completed lines
 * and a detailed inspector view for a specific selected line.
 */
export function InspectorLinesTab({
  inspectorPanelState,
  completedLines,
  selectedLineRouteBaseline,
  placedStops,
  activeTimeBandId,
  selectedLineServiceProjection,
  selectedLineServiceInspectorProjection,
  selectedLinePlanningVehicleProjection,
  lineFrequencyInputByTimeBand,
  lineFrequencyControlByTimeBand,
  lineFrequencyValidationByTimeBand,
  onFrequencyChange,
  onSelectedLineIdChange,
  onStopSelectionChange,
  onLineSequenceStopFocus,
  onStopRename,
  onLineRename,
  openDialogIntent,
  onOpenDialogIntentConsumed,
  selectedLineDemandContribution
}: InspectorLinesTabProps): ReactElement {
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  useEffect(() => {
    if (viewMode === 'detail' && inspectorPanelState.mode !== 'line-selected') {
      setViewMode('list');
    }
  }, [inspectorPanelState.mode, viewMode]);

  useEffect(() => {
    if (
      openDialogIntent &&
      inspectorPanelState.mode === 'line-selected' &&
      openDialogIntent.lineId === inspectorPanelState.selectedLine.id
    ) {
      setViewMode('detail');
    }
  }, [openDialogIntent, inspectorPanelState]);

  return (
    <section className="inspector-lines-tab" aria-label="Lines">
      <h3>Lines</h3>
      {viewMode === 'list' ? (
        completedLines.length > 0 ? (
          <ul className="inspector-simple-list inspector-lines-tab__list" aria-label="Completed line list">
            {completedLines.map((line) => (
              <li key={line.id} className="inspector-lines-tab__list-item">
                <button
                  type="button"
                  className="inspector-lines-tab__line-badge-button"
                  onClick={() => {
                    onSelectedLineIdChange(line.id);
                    setViewMode('detail');
                  }}
                  title={`Select and focus ${line.label}`}
                  aria-label={`Select line ${line.id}: ${line.label}`}
                >
                  {line.id}
                </button>
                <span className="inspector-lines-tab__line-label" title={line.label}>
                  {line.label}
                </span>
                <InlineRenameField
                  value={line.label}
                  entityLabel="line"
                  idleDisplayMode="edit-only"
                  onAccept={(nextValue) => onLineRename(line.id, nextValue)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p>No completed lines.</p>
        )
      ) : (
        <>
          <button
            type="button"
            className="inspector-lines-tab__back"
            onClick={() => {
              setViewMode('list');
            }}
          >
            Back to completed lines
          </button>
          {inspectorPanelState.mode === 'line-selected' ? (
            <SelectedLineInspector
              panelState={inspectorPanelState}
              selectedLineRouteBaseline={selectedLineRouteBaseline}
              placedStops={placedStops}
              activeTimeBandId={activeTimeBandId}
              lineFrequencyInputByTimeBand={lineFrequencyInputByTimeBand}
              lineFrequencyControlByTimeBand={lineFrequencyControlByTimeBand}
              lineFrequencyValidationByTimeBand={lineFrequencyValidationByTimeBand}
              selectedLineServiceProjection={selectedLineServiceProjection}
              selectedLineServiceInspectorProjection={selectedLineServiceInspectorProjection}
              selectedLinePlanningVehicleProjection={selectedLinePlanningVehicleProjection}
              onLineRename={onLineRename}
              onLineSequenceStopFocus={onLineSequenceStopFocus}
              onStopRename={onStopRename}
              onStopSelectionChange={onStopSelectionChange}
              onFrequencyChange={onFrequencyChange}
              openDialogIntent={openDialogIntent}
              onOpenDialogIntentConsumed={onOpenDialogIntentConsumed}
              selectedLineDemandContribution={selectedLineDemandContribution}
            />
          ) : (
            <p>Select a completed line from the list to open detail.</p>
          )}
        </>
      )}
    </section>
  );
}
