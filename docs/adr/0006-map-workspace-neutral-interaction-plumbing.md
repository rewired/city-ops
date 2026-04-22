# ADR 0006: Add neutral pointer interaction plumbing to map workspace baseline

## Status

Accepted

## Date

2026-04-22

## Context

The MapLibre baseline renders and cleans up correctly, but the workspace has no typed interaction state for future slices to build on. We need minimal local interaction plumbing that captures technical pointer data without introducing gameplay semantics or cross-module event architecture.

## Decision

- Add local typed interaction structures in `apps/web/src/map-workspace/MapWorkspaceSurface.tsx` for:
  - pointer coordinates in screen space with optional geographic coordinates
  - neutral interaction status values (`idle`, `pointer-active`, `click-captured`)
- Register `mousemove` and `click` handlers in the same `useEffect` that creates the map instance.
- Keep behavior strictly technical by capturing and displaying developer-facing status/coordinate text only.
- Unsubscribe interaction handlers during effect cleanup before map removal.
- Extend the minimal `MapLibreMap` interface in `apps/web/src/map-workspace/maplibreGlobal.ts` with typed `on`/`off` interaction hooks used by this slice.

## Consequences

- The workspace now exposes minimal typed interaction state suitable for incremental map interaction features.
- Event lifecycle management remains localized and cleanup-safe.
- No stops, lines, routing, demand, simulation, or global event bus behavior is introduced.
