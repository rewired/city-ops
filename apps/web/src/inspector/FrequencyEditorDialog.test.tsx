import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { MVP_TIME_BAND_IDS } from '../domain/constants/timeBands';
import type { LineFrequencyControlByTimeBand, LineFrequencyInputByTimeBand, LineFrequencyValidationByTimeBand } from '../session/useNetworkSessionState';
import { FrequencyEditorDialog } from './FrequencyEditorDialog';

const createInputState = (value: string): LineFrequencyInputByTimeBand =>
  Object.fromEntries(MVP_TIME_BAND_IDS.map((timeBandId) => [timeBandId, value])) as LineFrequencyInputByTimeBand;

const createValidationState = (value: string | null): LineFrequencyValidationByTimeBand =>
  Object.fromEntries(MVP_TIME_BAND_IDS.map((timeBandId) => [timeBandId, value])) as LineFrequencyValidationByTimeBand;

const createControlState = (value: 'unset' | 'frequency' | 'no-service'): LineFrequencyControlByTimeBand =>
  Object.fromEntries(MVP_TIME_BAND_IDS.map((timeBandId) => [timeBandId, value])) as LineFrequencyControlByTimeBand;

describe('FrequencyEditorDialog', () => {
  it('renders service-plan title and no selectable Unset option', () => {
    const markup = renderToStaticMarkup(
      <FrequencyEditorDialog
        open
        onClose={() => {}}
        lineFrequencyInputByTimeBand={createInputState('')}
        lineFrequencyControlByTimeBand={createControlState('unset')}
        lineFrequencyValidationByTimeBand={createValidationState(null)}
        onFrequencyChange={() => {}}
      />
    );

    expect(markup).toContain('Edit service plan');
    expect(markup).not.toContain('>Unset<');
    expect(markup).toContain('Interval');
    expect(markup).toContain('No service');
    expect(markup).toContain('Late morning');
    expect(markup).toContain('(09:00–11:00)');
    expect(markup).toContain('inspector-frequency-editor__row--not-configured');
  });

  it('renders frequency rows with editable minute values', () => {
    const markup = renderToStaticMarkup(
      <FrequencyEditorDialog
        open
        onClose={() => {}}
        lineFrequencyInputByTimeBand={createInputState('10')}
        lineFrequencyControlByTimeBand={createControlState('frequency')}
        lineFrequencyValidationByTimeBand={createValidationState(null)}
        onFrequencyChange={() => {}}
      />
    );

    expect(markup).toContain('value="10"');
    expect(markup).not.toContain('disabled=""');
  });

  it('renders no-service rows with en dash interval placeholder', () => {
    const markup = renderToStaticMarkup(
      <FrequencyEditorDialog
        open
        onClose={() => {}}
        lineFrequencyInputByTimeBand={createInputState('12')}
        lineFrequencyControlByTimeBand={createControlState('no-service')}
        lineFrequencyValidationByTimeBand={createValidationState(null)}
        onFrequencyChange={() => {}}
      />
    );

    expect(markup).toContain('value="–"');
    expect(markup).toContain('disabled=""');
  });
});
