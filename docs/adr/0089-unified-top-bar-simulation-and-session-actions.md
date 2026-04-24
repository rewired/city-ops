# ADR 0089: Unified top-bar simulation and session actions composition

## Status

Accepted (2026-04-24)

## Context

The desktop shell currently stacks an `app-header` row above a separate simulation control row. This split consumes vertical space and separates closely related planning controls (clock, speed, and session load/export actions).

## Decision

1. Replace split `header` + `controls` rows with one `top-bar` row in the app grid.
2. Use one integrated top-bar composition that renders, in one horizontal bar:
   - brand/title (`CityOps`)
   - day/time readout
   - active time-band label
   - play/pause and reset icon controls
   - discrete speed controls for `1x`, `5x`, `10x`, and `20x`
   - compact selected-line load/export actions
3. Preserve existing simulation callback semantics:
   - play/pause remains a running-state toggle, not a speed mode
   - reset behavior remains unchanged
   - speed selection continues to use canonical simulation speed ids
4. Keep the change presentation-only (layout and control composition), without simulation/domain/session logic expansion.

## Consequences

- Planning controls and clock context stay co-located in a single row.
- Vertical shell density improves while preserving desktop-only scope.
- Existing controller boundaries remain intact because callbacks are reused.

## Explicit non-goals (Slice 035)

- no simulation clock semantics changes
- no new speed definitions beyond canonical `1x`/`5x`/`10x`/`20x`
- no session import/export contract changes
- no mobile layout support
- no multimodal gameplay scope expansion
