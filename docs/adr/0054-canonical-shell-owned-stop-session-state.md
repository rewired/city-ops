# ADR 0054: Canonical shell-owned stop session state for map workspace sync

## Status

Accepted

## Date

2026-04-24

## Context

`MapWorkspaceSurface` previously owned local placed-stop state and exported only a scalar count to `App.tsx`.

This created split stop truth between the map surface and shell-level summary rendering, and made canonical stop reuse at public boundaries indirect.

## Decision

- Lift placed-stop session state ownership to `App.tsx` as canonical `readonly Stop[]`.
- Derive shell-level stop count projections from canonical stop-array length, rather than from a mirrored exported scalar.
- Update `MapWorkspaceSurface` props to consume:
  - injected canonical `placedStops`
  - an immutable stop-append/update callback for placement events
  - existing stop-selection and line-draft callbacks already required by the map workspace boundary
- Remove local placed-stop ownership inside `MapWorkspaceSurface`.
- Use injected canonical stops for:
  - stop source synchronization
  - line source synchronization
  - fallback route-segment generation during draft line completion

## Consequences

- There is exactly one stop truth source for current session planning.
- Shell summaries and map rendering now resolve from the same canonical stop list.
- Public boundary typing for stop session state is clearer and remains strictly immutable-by-contract.

## Non-goals

- No changes to transport mode scope (bus-only MVP remains unchanged).
- No persistence/back-end ownership changes for stops.
- No routing realism expansion beyond existing fallback-segment baseline behavior.
