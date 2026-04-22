# ADR 0012: Keep stop-placement feature queries on a narrow typed MapLibre contract

## Status

Accepted

## Date

2026-04-22

## Context

`MapWorkspaceSurface` validates stop placement using feature queries at click locations. The existing MapLibre typing covered style inspection and rendered-feature querying, but did not expose a typed source-feature query path.

For this MVP slice, we need stricter typing around feature query inputs/outputs without introducing a broad or speculative MapLibre model.

## Decision

- Extend `maplibreGlobal.ts` with minimal exported feature-query types:
  - line-relevant geometry shape
  - rendered/source feature shapes
  - source reference shape derived from style layers
- Add `querySourceFeatures(...)` to the minimal `MapLibreMap` contract.
- Provide a small typed helper (`getSourceRefsForLayerIds`) that derives source query references from style/layer ids.
- Update stop-placement eligibility checks to use:
  - rendered feature query at click point first
  - source-feature query fallback through typed source refs
  - explicit line-geometry gating (`LineString` / `MultiLineString`)

## Consequences

- Stop-placement validation remains local and lightweight while gaining stricter typed contracts.
- The MapLibre boundary stays intentionally narrow, avoiding over-modeling beyond current stop-placement needs.
- Feature query semantics used by placement validation are now explicit at the map global contract boundary.
