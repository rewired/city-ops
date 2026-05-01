---
name: openvayra-data-ingestion
description: Use this skill when modifying scenario setup, source-material manifests, OSM/GeoJSON/CSV adapters, generated artifacts, save/import parsing, validation boundaries, or local asset workflows.
---

# OpenVayra Data Ingestion Skill

External datasets are scenario source material only. Generated runtime artifacts must be validated before they influence canonical domain or simulation state.

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

- Working with scenario JSON.
- Adding or changing source-material manifests.
- Parsing OSM, GeoJSON, CSV, PBF-derived data, routing results, saves, or imports.
- Building generated browser-readable artifacts.
- Handling local assets under `data/` or `apps/web/public/generated/`.
- Creating validation errors for malformed external data.

## Boundary rule

All non-trivial external inputs must be accepted as `unknown` or file/data payloads at the boundary and narrowed through explicit validation.

Do not let external shapes enter canonical domain state directly.

## Source material vs runtime truth

Distinguish:

- raw source files
- source-material manifests
- normalized generated artifacts
- canonical domain objects
- UI projections

External source material may inspire scenario artifacts.
It must not become simulation truth by accident.

## Validation posture

Validators should:

- Reject malformed structures.
- Reject unsupported semantic values.
- Report actionable errors.
- Preserve deterministic behavior.
- Convert accepted inputs into canonical types.
- Avoid silent coercion when it hides data quality problems.

## Generated artifact policy

Respect local/generated file policy:

- Raw `.osm.pbf` files are local source material, not committed.
- OSRM graphs are generated and not committed.
- Browser-readable generated runtime assets are generated and usually not committed except placeholders.
- Curated area/scenario/source-material contracts may be committed when intentionally part of repo truth.

## OSM and map data

Preserve licensing and attribution awareness.

Do not assume that imported map-derived data may be redistributed freely.

## Save/import safety

Save files and imports must be validated before use.

Reject malformed or semantically invalid payloads.
Do not execute or evaluate unchecked imported content.
Convert accepted data into canonical domain types before runtime use.

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

