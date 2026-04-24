# ADR 0050: Route-segment-first completed-line GeoJSON assembly

## Status

Accepted

## Date

2026-04-24

## Context

Completed lines now persist fallback-derived `routeSegments` at line completion time, but completed-line GeoJSON rendering still projects geometry from ordered stop positions only.

That leaves persisted segment geometry unused and can introduce duplicated vertices when segment boundaries share a coordinate.

## Decision

Update `buildCompletedLineFeatureCollection` in `apps/web/src/map-workspace/lineGeoJson.ts` to:

- prefer completed-line geometry from `line.routeSegments`
- flatten `orderedGeometry` arrays strictly in segment order
- remove duplicated shared boundary coordinates between adjacent segments when the previous segment end equals the next segment start
- preserve existing completed-line feature properties (`lineId`, `selected`) for current feature-first map selection behavior
- keep `buildDraftLineFeatureCollection` unchanged as a stop-order preview path

## Consequences

- Completed-line map rendering now reflects persisted route-segment geometry when available.
- Adjacent segment joins no longer produce duplicate boundary vertices in completed line paths.
- Existing line-feature click selection behavior remains stable because feature properties are unchanged.

## Non-goals

- No changes to draft line preview rendering semantics.
- No changes to route segment generation, travel timing, or simulation behavior.
- No changes to source/layer registration or map interaction mode rules.
