import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { MVP_TIME_BAND_IDS } from '../domain/constants/timeBands';
import type {
  LineFrequencyControlByTimeBand,
  LineFrequencyInputByTimeBand,
  LineFrequencyValidationByTimeBand
} from '../session/useNetworkSessionState';
import { FrequencyEditorDialog } from './FrequencyEditorDialog';

const createInputState = (value: string): LineFrequencyInputByTimeBand =>
  Object.fromEntries(MVP_TIME_BAND_IDS.map((timeBandId) => [timeBandId, value])) as LineFrequencyInputByTimeBand;

const createValidationState = (value: string | null): LineFrequencyValidationByTimeBand =>
  Object.fromEntries(MVP_TIME_BAND_IDS.map((timeBandId) => [timeBandId, value])) as LineFrequencyValidationByTimeBand;

const createControlState = (value: 'unset' | 'frequency' | 'no-service'): LineFrequencyControlByTimeBand =>
  Object.fromEntries(MVP_TIME_BAND_IDS.map((timeBandId) => [timeBandId, value])) as LineFrequencyControlByTimeBand;

describe('FrequencyEditorDialog', () => {
  it('renders service-plan title, explanatory guidance, and explicit control modes', () => {
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
    expect(markup).toContain('All values are in minutes. Empty values are treated as unset. Only positive values are valid. Zero or negative values are invalid.');
    expect(markup).toContain('Time band');
    expect(markup).toContain('Window');
    expect(markup).toContain('Service');
    expect(markup).toContain('Late morning');
    expect(markup).toContain('09:00–11:00');
    expect(markup).toContain('Frequency');
    expect(markup).toContain('No service');
    expect(markup).toContain('Unset');
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

  it('renders no-service rows with disabled and cleared minute input', () => {
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

    expect(markup).toContain('value=""');
    expect(markup).toContain('disabled=""');
  });
});
