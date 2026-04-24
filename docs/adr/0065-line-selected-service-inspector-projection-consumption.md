# ADR 0065: Line-selected service inspector projection consumption

## Status

Accepted (2026-04-24)

## Context

`App.tsx` already consumed domain projection output for some line-service semantics, but the line-selected inspector and status bar still used ad-hoc active-band frequency hint logic in React.

The next slice needs a compact line-selected service-plan section showing active-band/service-readiness snapshot fields while keeping projection semantics outside the UI component layer.

## Decision

Introduce a dedicated compact line-selected inspector projection helper in the domain projection layer and consume it from `App.tsx`.

### Included

1. Extend line-service projection types with `LineSelectedServiceInspectorProjection`.
2. Add `projectLineSelectedServiceInspector(lineProjection, maxNotesVisible?)` in `lineServicePlanProjection.ts`.
3. Move compact line-selected service-plan semantics into this helper:
   - active time-band label
   - service-status label
   - configured headway label with explicit unconfigured message
   - theoretical departures/hour label when configured
   - total stored route-time label
   - route segment count
   - blocker/warning counts
   - bounded note message list
4. Replace status-bar selected-line frequency hint usage with this projection output.
5. Add deterministic unit coverage for configured/degraded and not-configured inspector projection scenarios.

### Explicit non-goals

- no demand/economy/vehicle/satisfaction KPI additions
- no simulation execution changes
- no route recalculation changes
- no persistence/import/backend scope expansion

## Rationale

Keeping compact inspector/service-hint shaping in the domain projection layer prevents semantic drift and duplicate “small formatting rule” ownership in React.

This also keeps UI work focused on rendering deterministic projection output, aligned with existing layer-boundary discipline.

## Consequences

- Active-band service hint and compact line-selected service section now share one projection source.
- React component logic is slimmer and no longer owns ad-hoc active-band frequency semantics.
- Future UI surfaces can reuse the same compact projection contract without re-deriving readiness/headway/departure labels.
