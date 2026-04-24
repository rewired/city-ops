# ADR 0072: Derived vehicle projection from departure schedules and routed segments

## Status

Accepted (2026-04-24)

## Context

ADR 0067 established a deterministic current-time-band departure schedule projection. That slice answered when departures should theoretically occur, but it did not provide map-ready vehicle positions.

For the next step, we need a narrow, typed read-model that projects where buses should appear *right now* without introducing authoritative runtime vehicle entities, dispatch state, or persistence.

## Decision

Introduce a derived vehicle projection layer that runs **after** departure schedule projection and derives map-renderable vehicle features from:

1. theoretical departures from the active time-band schedule projection
2. stored completed-line route segments (`line.routeSegments`) and route timing totals

### Included

- Compute per-minute vehicle projections from schedule truth + stored route segment timing.
- Treat buses as projection artifacts (read-model output), not authoritative simulation entities.
- Keep projection deterministic and side-effect free.
- Produce map-native GeoJSON-ready output for marker rendering.
- Preserve degraded projection signaling when upstream readiness/schedule truth is degraded.

## Rationale

### Why derive vehicle projection after departure schedule projection

Departure schedule projection is the canonical source of theoretical departures for the active time band. Deriving vehicles from that existing output avoids duplicated schedule semantics and keeps one source of truth for departure availability.

### Why buses are projections, not authoritative entities

At this MVP slice, buses are a visualization concern used to communicate active service rhythm. Authoritative vehicle lifecycle/state ownership would imply dispatch/execution concerns that are explicitly outside scope. Keeping buses projection-only preserves architecture boundaries and avoids premature runtime simulation complexity.

### Why use stored route segments/timing for derivation

Using persisted route segments and timing totals allows deterministic position projection on known routed geometry without route recomputation. This keeps routing ownership where it already belongs and prevents UI layers from becoming routing authorities.

### Why map-native GeoJSON rendering

Map-native GeoJSON sources/layers align with existing MapLibre rendering architecture, support efficient incremental source updates, and keep vehicle rendering in the map layer (not DOM overlays). This preserves a clean projection-to-render boundary.

## Consequences

- Vehicle markers remain visual projections of schedule and route data, not simulation-owned entities.
- Projection can be replaced or enriched by later execution slices without breaking current UI contracts.
- The map consumes one typed GeoJSON-oriented projection contract.

## Explicit non-goals

- no demand logic
- no economy logic
- no passenger simulation or assignment
- no authoritative fleet state
- no depot modeling
- no layover modeling
- no dispatch model
- no persistence
- no backend integration
- no import pipeline
- no savegame/scenario/replay systems
- no mobile behavior
- no multimodal expansion
