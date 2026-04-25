import type { ReactElement } from 'react';

import {
  MVP_TIME_BAND_IDS,
  TIME_BAND_DEFINITIONS,
  TIME_BAND_DISPLAY_LABELS,
  formatTimeBandWindow
} from '../domain/constants/timeBands';
import type { TimeBandDefinition, TimeBandId } from '../domain/types/timeBand';
import {
  LINE_FREQUENCY_EDITOR_MAX_LENGTH,
  normalizeLineFrequencyEditorInput
} from '../session/lineFrequencyEditorState';
import type {
  LineFrequencyControlByTimeBand,
  LineFrequencyInputByTimeBand,
  LineFrequencyValidationByTimeBand,
  SelectedLineFrequencyUpdateAction
} from '../session/useNetworkSessionState';

interface FrequencyEditorDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly lineFrequencyInputByTimeBand: LineFrequencyInputByTimeBand;
  readonly lineFrequencyControlByTimeBand: LineFrequencyControlByTimeBand;
  readonly lineFrequencyValidationByTimeBand: LineFrequencyValidationByTimeBand;
  readonly onFrequencyChange: (
    timeBandId: TimeBandId,
    rawInputValue: string,
    action?: SelectedLineFrequencyUpdateAction
  ) => void;
}

const TIME_BAND_DEFINITION_BY_ID: Readonly<Record<TimeBandId, TimeBandDefinition>> = Object.fromEntries(
  TIME_BAND_DEFINITIONS.map((definition) => [definition.id, definition])
) as Readonly<Record<TimeBandId, TimeBandDefinition>>;

/**
 * Renders a table-like selected-line service-plan editor with explicit frequency, no-service, and unset controls.
 */
export function FrequencyEditorDialog({
  open,
  onClose,
  lineFrequencyInputByTimeBand,
  lineFrequencyControlByTimeBand,
  lineFrequencyValidationByTimeBand,
  onFrequencyChange
}: FrequencyEditorDialogProps): ReactElement | null {
  if (!open) {
    return null;
  }

  return (
    <div className="inspector-dialog" role="dialog" aria-modal="true" aria-label="Edit service plan dialog">
      <div className="inspector-dialog__surface inspector-dialog__surface--small">
        <header className="inspector-dialog__header">
          <h3>Edit service plan</h3>
          <button type="button" className="inspector-dialog__close" onClick={onClose}>
            Close
          </button>
        </header>
        <p className="inspector-frequency-editor__note">
          All values are in minutes. Empty values are treated as unset. Only positive values are valid. Zero or negative
          values are invalid.
        </p>
        <div className="inspector-frequency-editor" role="table" aria-label="Service plan by time band">
          <div className="inspector-frequency-editor__header" role="row">
            <span role="columnheader">Time band</span>
            <span role="columnheader">Window</span>
            <span role="columnheader">Service</span>
          </div>
          {MVP_TIME_BAND_IDS.map((timeBandId) => {
            const timeBandDefinition = TIME_BAND_DEFINITION_BY_ID[timeBandId];
            const controlState = lineFrequencyControlByTimeBand[timeBandId];
            const isNoService = controlState === 'no-service';
            const isUnset = controlState === 'unset';
            const intervalValue = isNoService || isUnset ? '' : lineFrequencyInputByTimeBand[timeBandId] ?? '';
            const rowClassName = [
              'inspector-frequency-editor__row',
              isUnset ? 'inspector-frequency-editor__row--not-configured' : null
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <section key={timeBandId} className={rowClassName} role="row">
                <p className="inspector-frequency-editor__band-label" role="cell">
                  {TIME_BAND_DISPLAY_LABELS[timeBandId]}
                </p>
                <p className="inspector-frequency-editor__band-window" role="cell">
                  {formatTimeBandWindow(timeBandDefinition)}
                </p>
                <div className="inspector-frequency-editor__controls" role="cell">
                  <label className="inspector-frequency-editor__choice">
                    <input
                      type="radio"
                      name={`frequency-mode-${timeBandId}`}
                      checked={controlState === 'frequency'}
                      onChange={() => {
                        onFrequencyChange(timeBandId, lineFrequencyInputByTimeBand[timeBandId] ?? '', 'set-frequency');
                      }}
                    />
                    <span>Frequency</span>
                  </label>
                  <label className="inspector-frequency-editor__choice">
                    <input
                      type="radio"
                      name={`frequency-mode-${timeBandId}`}
                      checked={isNoService}
                      onChange={() => {
                        onFrequencyChange(timeBandId, '', 'set-no-service');
                      }}
                    />
                    <span>No service</span>
                  </label>
                  <label className="inspector-frequency-editor__choice">
                    <input
                      type="radio"
                      name={`frequency-mode-${timeBandId}`}
                      checked={isUnset}
                      onChange={() => {
                        onFrequencyChange(timeBandId, '', 'set-unset');
                      }}
                    />
                    <span>Unset</span>
                  </label>
                  <label className="inspector-frequency-editor__interval-field">
                    <span className="inspector-frequency-editor__interval-label">Minutes</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={LINE_FREQUENCY_EDITOR_MAX_LENGTH}
                      aria-label={`Frequency minutes for ${TIME_BAND_DISPLAY_LABELS[timeBandId]} (${formatTimeBandWindow(timeBandDefinition)})`}
                      disabled={isNoService}
                      value={intervalValue}
                      onFocus={() => {
                        onFrequencyChange(timeBandId, lineFrequencyInputByTimeBand[timeBandId] ?? '', 'set-frequency');
                      }}
                      onChange={(event) => {
                        const normalizedValue = normalizeLineFrequencyEditorInput(event.currentTarget.value);
                        onFrequencyChange(timeBandId, normalizedValue, 'input-change');
                      }}
                    />
                    <span>min</span>
                  </label>
                </div>
                {lineFrequencyValidationByTimeBand[timeBandId] ? (
                  <span className="inspector-frequency-editor__error">{lineFrequencyValidationByTimeBand[timeBandId]}</span>
                ) : null}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
