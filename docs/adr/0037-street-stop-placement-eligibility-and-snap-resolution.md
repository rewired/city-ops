# ADR 0037: Street stop placement eligibility and snap resolution split

## Status

Accepted

## Date

2026-04-23

## Scope

Document Slice 014e map-workspace placement behavior that separates target eligibility checks from street snap-point resolution.

## Constraints

- Keep stop placement bus-MVP scoped and map-local; do not introduce routing, simulation, economy, or persistence side effects.
- Preserve existing rejection behavior for non-street placement attempts.
- Keep placement thresholds centralized in a map-workspace constants module rather than inline literals.
- Support snapping against rendered street line features represented as `LineString` and `MultiLineString`.

## Decision

- Split placement handling into two explicit phases:
  1. **Eligibility**: confirm the click can target a street line layer using existing rendered/source checks.
  2. **Snap resolution**: derive the nearest street point from rendered line geometry near the click.
- Place newly created stops at the resolved snapped longitude/latitude instead of raw click `lngLat`.
- Keep placement rejection unchanged when no snap point can be derived.
- Centralize snap-query window and max snap-distance pixel thresholds in `mapWorkspacePlacementConstants.ts`.

## Explicit non-goals

Slice 014e does **not** introduce:

- new transport modes
- mobile behavior
- pathfinding or route-editing systems
- demand/economy/service simulation changes
- backend/persistence/cloud/multiplayer features

## Consequences

- Placement outcomes remain deterministic while reducing off-street point drift from raw click coordinates.
- The placement interaction model is clearer: valid-target detection is distinct from exact coordinate resolution.
- Pixel thresholds are now reusable and discoverable for future map-workspace tuning.
