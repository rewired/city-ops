# ADR 0104: Service-plan frequency editor as a three-column table with explicit mode selection

## Status

Accepted

## Context

The selected-line `Edit service plan` dialog already used canonical time-band constants and explicit editor control states (`unset`, `frequency`, `no-service`), but the row layout mixed label/window content and did not expose all three control states as first-class user choices.

We need a clearer table-like editing surface that:

- shows `Time band`, `Window`, and `Service` as explicit columns;
- keeps canonical label/window rendering sourced from `TIME_BAND_DISPLAY_LABELS` and `TIME_BAND_DEFINITIONS` + `formatTimeBandWindow`;
- presents explicit `frequency`, `no-service`, and `unset` choices per band;
- keeps positive-minute validation semantics owned by `lineFrequencyEditorState`;
- preserves canonical service-plan domain writes (`{ kind: 'unset' }`, `{ kind: 'no-service' }`, or `{ kind: 'frequency', ... }`).

## Decision

Refactor `FrequencyEditorDialog` to a three-column, table-like row structure and add one guidance line above the table:

> “All values are in minutes. Empty values are treated as unset. Only positive values are valid. Zero or negative values are invalid.”

Per row:

- render canonical time-band label and window in separate columns;
- render explicit radio choices for `Frequency`, `No service`, and `Unset`;
- keep a single minute input in the `Service` column;
- disable and clear minute input when `no-service` is selected;
- clear input and emit `set-unset` when `unset` is selected;
- continue routing freeform numeric input through `normalizeLineFrequencyEditorInput` and existing action handling.

## Consequences

- Service-state intent is explicit for every time band without inferring mode from empty text alone.
- Canonical time-band display ownership remains centralized in domain constants/helpers.
- Validation and domain-write semantics remain in existing editor-state logic, reducing UI duplication.
- Existing tests must assert the new explanatory text, column headers, and no-service cleared-input behavior.
