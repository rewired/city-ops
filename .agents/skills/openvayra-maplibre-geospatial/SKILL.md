---
name: openvayra-maplibre-geospatial
description: Use this skill when modifying MapLibre integration, map sources/layers, GeoJSON builders, map interaction flows, street snapping, OSM candidates, layer registry behavior, or geospatial rendering helpers.
---

# OpenVayra MapLibre & Geospatial Skill

Map rendering is a projection surface. It must not become the owner of demand, transit network, routing, or simulation truth.

## Source of truth

Before applying this skill, respect the repository source-of-truth order from `AGENTS.md`.

This skill never overrides:
1. `PRODUCT_DEFINITION.md`
2. `FOUNDATION.md`
3. `VISION_SCOPE.md`
4. `DD.md`
5. `TDD.md`
6. `SEC.md`
7. `DESIGN.md` as externally provided
8. current repository code

If this skill appears to conflict with canonical documents or current code, surface the conflict instead of silently choosing a side.


## Use this skill when

- Editing MapLibre source/layer registration.
- Adding or changing GeoJSON builders.
- Modifying map interactions such as inspect, place-stop, build-line, or candidate adoption.
- Changing street snapping, rendered-feature queries, or stop placement anchors.
- Adding overlays or layer toggles.
- Working with OSM-derived candidates or generated scenario artifacts.

## Layer ownership

Map layers may render:

- stops
- completed lines
- draft lines
- projected vehicles
- demand previews
- OSM candidates
- routing/debug overlays

Map layers must not own:

- canonical stops
- canonical lines
- demand truth
- simulation state
- routing truth
- economy truth

## GeoJSON builder rules

Prefer pure builders that:

- Accept typed domain/projection inputs.
- Return deterministic `FeatureCollection` outputs.
- Avoid hidden mutable state.
- Expose narrow typed properties.
- Filter unsupported entities explicitly.
- Are unit-testable without MapLibre runtime.

Avoid component-local ad-hoc GeoJSON construction.

## Source/layer synchronization

Keep source registration, data updates, and layer ordering deterministic.

When possible:

- Separate ensure/register behavior from `setData(...)` updates.
- Reapply canonical layer order after style transitions.
- Keep source/layer ids centralized.
- Keep layer visibility controlled by the map layer registry/flyout.

## Map Layer Registry

Optional map overlays must register with the central map layer flyout.

Do not add standalone overlay toggle buttons unless explicitly justified.

The layer control owns UI visibility state only. It must not own domain/routing/simulation truth.

## Stop placement and anchors

Stop placement must remain street-linked.

Distinguish:

- display position
- street anchor position
- routing anchor truth
- raw OSM candidate position
- adopted canonical City/OpenVayra stop

Raw OSM objects are not canonical stops.
Grouped OSM candidates are not canonical stops.
Adoption creates canonical stops only when required readiness conditions are met.

## Geospatial data caution

External geographic data is source material.

Validate and convert at boundaries before entering canonical domain state.
Do not make external dataset structures the internal runtime truth.

## Required no-drift checks

Before completing work, verify:

- The change stayed within the requested slice.
- Repository artifacts remain English-only.
- Desktop-only scope was preserved.
- Bus-first MVP scope was preserved.
- No `any`, `as any`, or broad unchecked casts were introduced.
- Domain/simulation constants were not duplicated in UI or feature-local code.
- Public exports introduced or touched by the change include concise inline documentation.
- UI did not become the owner of domain, routing, economy, or simulation truth.

