# ADR 0098: Compact selected-line service-plan editor with explicit Interval vs No service actions

## Status

Accepted (2026-04-25)

## Context

The selected-line "Edit frequency" dialog was not usable at MVP density:

1. Each canonical time band rendered as a large radio group.
2. `Unset` appeared as a player-facing choice even though it is an internal "not configured yet" state.
3. The dialog consumed too much width/height for quick desktop scanning.
4. Numeric input accepted broad number parsing semantics that allowed non-MVP interval forms.

## Decision

1. Keep canonical domain service-band semantics unchanged: `unset | frequency | no-service`.
2. Replace the dialog interaction model with exactly two player-facing row actions per time band:
   - `Interval`
   - `No service`
3. Remove selectable `Unset` from the UI. `unset` remains visible only as a neutral not-configured row state.
4. Render each row as compact label + time window + controls: `[Label] (HH:MM–HH:MM)  [Interval] [value] min [No service]`.
5. Rename dialog title to `Edit service plan` and constrain the service-plan dialog surface width to a compact desktop range.
6. Use a controlled text input (no browser number spinners), with validation constrained to whole-minute values `1..999`.
7. Show `–` in the interval field when a band is set to `no-service`, while preserving explicit `{ kind: 'no-service' }` in domain state.
8. Allow temporary empty interval text while editing without implicitly mapping it to `no-service`.

## Consequences

- The service editor is compact and scannable for desktop-only MVP usage.
- Player intent is explicit (`Interval` or `No service`) while `unset` remains an internal readiness-relevant state.
- Canonical time-band labels/windows remain sourced from shared domain definitions and formatting helpers.
- Input validation semantics are deterministic and aligned with MVP constraints.

## Explicit non-goals (this slice)

- no custom time-band authoring
- no persistence, backend, or export/import contract changes
- no simulation, routing, demand, economy, or vehicle projection behavior changes
- no mobile/touch-first layout additions
- no multimodal transport scope expansion
