# 133: Scenario JSON and Browser Registry Baseline

## Status

Accepted

## Context

OpenVayra - Cities needs to distinguish between curated playable scenarios and generated or local asset readiness. We need a way to commit scenario definitions (game truth) while allowing the web application to know whether the necessary large assets (OSRM routing data, OSM stop candidates) are available locally without failing the build if they are missing.

## Decision

We introduce:
1. **Area JSON** (`data/areas/*.area.json`): Defines geographic bounds and expected asset locations for a region (e.g., Hamburg).
2. **Scenario JSON** (`data/scenarios/*.scenario.json`): Defines playable scenarios referencing an area.
3. **Registry Generator** (`scripts/scenarios/build-scenario-registry.mjs`): A build-time script that validates configurations, checks for local asset existence, and compiles a `scenario-registry.json` for the browser.

Missing local assets will be represented as state (`status: "missing-assets"`) in the registry rather than causing build failures.

## Consequences

### Pros
- Decouples game design truth from heavy data artifacts.
- Allows the frontend to gracefully handle missing data states.
- Ensures validation of scenario configurations early in the pipeline.

### Cons
- Requires a separate build step (`pnpm scenarios:build`) to update the registry.

## Non-Goals for this Slice
- No scenario selection UI.
- No refactoring of existing routing scripts.
