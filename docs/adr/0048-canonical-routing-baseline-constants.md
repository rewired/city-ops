# ADR 0048: Canonical routing baseline constants

## Status

Accepted

## Date

2026-04-24

## Context

Route segment domain types are in place, but canonical baseline defaults for fallback route timing were still implicit and not centralized in a dedicated routing constants module.

Without a canonical module, route-building helpers risk drifting defaults for fallback speed, dwell handling, and minimum in-motion timing.

## Decision

Add `apps/web/src/domain/constants/routing.ts` as the canonical routing baseline constants module with:

- fallback bus speed in meters per minute
- default dwell minutes per segment
- minimum in-motion travel minutes for non-zero segments

Update route-building helpers in `apps/web/src/domain/types/lineRoute.ts` to import and use these constants for baseline fallback travel-time calculations.

Do not add route status display labels yet, because the current UI does not render route status labels.

## Consequences

- Routing baseline defaults are centralized and reusable.
- Route-time helper behavior is deterministic and consistent across call sites.
- React/map rendering modules remain free of routing numeric defaults.

## Non-goals

- No changes to map rendering or line-building UX.
- No addition of real street-routing adapters in this slice.
- No simulation/economy expansion.
