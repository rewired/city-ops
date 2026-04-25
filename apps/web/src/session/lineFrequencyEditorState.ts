import { createLineFrequencyMinutes, type LineServiceBandPlan } from '../domain/types/line';
import type { SelectedLineFrequencyUpdateAction, LineFrequencyControlState } from './useNetworkSessionState';

/** Maximum number of characters allowed in the service-interval editor input. */
export const LINE_FREQUENCY_EDITOR_MAX_LENGTH = 3;

/** Validation message shown when the service-interval input is not a whole minute value in the supported range. */
export const LINE_FREQUENCY_EDITOR_VALIDATION_MESSAGE = 'Enter an interval from 1 to 999 whole minutes.';

/** Deterministic reducer output for one selected-line service-band editor action. */
export interface LineFrequencyEditorActionResult {
  readonly controlState: LineFrequencyControlState;
  readonly normalizedInputValue: string;
  readonly validationMessage: string | null;
  readonly nextBandPlan: LineServiceBandPlan | null;
}

/**
 * Normalizes raw service-interval text to the compact editor length limit without coercing characters.
 */
export const normalizeLineFrequencyEditorInput = (rawInputValue: string): string =>
  rawInputValue.slice(0, LINE_FREQUENCY_EDITOR_MAX_LENGTH);

const resolveLineFrequencyMinutes = (rawInputValue: string): number | null => {
  const trimmedValue = rawInputValue.trim();
  if (trimmedValue.length === 0) {
    return null;
  }

  if (!/^\d{1,3}$/.test(trimmedValue)) {
    return Number.NaN;
  }

  const parsedValue = Number(trimmedValue);
  if (!Number.isInteger(parsedValue) || parsedValue <= 0 || parsedValue > 999) {
    return Number.NaN;
  }

  return parsedValue;
};

/**
 * Applies one frequency-editor action to local row state and returns any canonical service-plan update.
 */
export const applyLineFrequencyEditorAction = (
  rawInputValue: string,
  action: SelectedLineFrequencyUpdateAction
): LineFrequencyEditorActionResult => {
  const normalizedInputValue = normalizeLineFrequencyEditorInput(rawInputValue);

  if (action === 'set-no-service') {
    return {
      controlState: 'no-service',
      normalizedInputValue,
      validationMessage: null,
      nextBandPlan: { kind: 'no-service' }
    };
  }

  if (action === 'set-unset') {
    return {
      controlState: 'unset',
      normalizedInputValue: '',
      validationMessage: null,
      nextBandPlan: { kind: 'unset' }
    };
  }

  const parsedValue = resolveLineFrequencyMinutes(rawInputValue);
  if (parsedValue === null) {
    return {
      controlState: 'frequency',
      normalizedInputValue,
      validationMessage: null,
      nextBandPlan: null
    };
  }

  if (!Number.isFinite(parsedValue)) {
    return {
      controlState: 'frequency',
      normalizedInputValue,
      validationMessage: LINE_FREQUENCY_EDITOR_VALIDATION_MESSAGE,
      nextBandPlan: null
    };
  }

  return {
    controlState: 'frequency',
    normalizedInputValue,
    validationMessage: null,
    nextBandPlan: {
      kind: 'frequency',
      headwayMinutes: createLineFrequencyMinutes(parsedValue)
    }
  };
};
