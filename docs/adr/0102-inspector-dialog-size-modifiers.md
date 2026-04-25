# ADR 0102: Inspector dialog size modifiers

## Status

Accepted (2026-04-25)

## Context

Selected-line inspector dialogs used a mixed sizing approach:

1. A default `inspector-dialog__surface` width in shared styles.
2. A dedicated one-off `--service-plan-editor` width modifier for the frequency editor dialog.
3. No explicit size mapping contract across service plan and departures dialogs.

That made dialog sizing less predictable and encouraged ad-hoc width handling in component usage.

## Decision

1. Define reusable shared size modifiers on `inspector-dialog__surface`:
   - `inspector-dialog__surface--small`
   - `inspector-dialog__surface--medium`
   - `inspector-dialog__surface--large`
2. Map selected-line dialogs to explicit size intent:
   - Frequency editor dialog => `small`
   - Service plan dialog => `medium`
   - Departures dialog => `large`
3. Keep `large` constrained and scrollable through shared CSS (`max-height` + `overflow: auto`) so departures detail remains readable without viewport overflow.
4. Remove legacy one-off width modifier usage from dialog components.

## Consequences

- Dialog sizing becomes a shared UI contract instead of per-dialog ad-hoc sizing.
- Future inspector dialogs can reuse size intent classes without adding new width-only special cases.
- Departures detail can render larger by default while staying bounded and scrollable.

## Explicit non-goals (this slice)

- no simulation, routing, or domain logic changes
- no new dialog behaviors beyond size/styling contract changes
- no mobile layout or multimodal scope expansion
