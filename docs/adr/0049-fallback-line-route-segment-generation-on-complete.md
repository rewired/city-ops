# ADR 0049: Fallback line route segment generation on line completion

## Status

Accepted

## Date

2026-04-24

## Context

Completed lines currently persist ordered stop ids but initialize `routeSegments` as an empty list.

This loses a deterministic baseline for segment distance/time truth and leaves line completion without explicit route provenance, despite canonical route segment types and routing constants already existing.

## Decision

Add a pure domain routing helper at `apps/web/src/domain/routing/fallbackLineRouting.ts` that:

- validates minimum ordered stop count before segment generation
- creates one segment per consecutive stop pair
- supports closure only when explicitly requested (`closureMode: 'closed'`) or when the first stop id is already repeated at the end of the sequence
- computes deterministic segment ids from line id plus ordered segment index
- sets fallback geometry as a two-point path from stop coordinates
- computes fallback distance via deterministic great-circle calculation
- computes fallback travel timing through canonical routing helpers/constants
- marks every generated segment status as `fallback-routed`

Update `MapWorkspaceSurface` line completion to call this helper so newly completed lines include fallback-derived `routeSegments` immediately, without changing draft preview rendering behavior.

## Consequences

- Completed lines now carry deterministic baseline route segments as soon as they are created.
- Route segment provenance is explicit (`fallback-routed`) at creation time.
- Routing computation remains outside React component logic, preserving architecture boundaries.

## Non-goals

- No street-network routing adapter integration in this slice.
- No simulation/economy behavior changes.
- No changes to draft preview rendering semantics.
