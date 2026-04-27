# ADR 0137: Scenario Setup Bootstrap and BBBike Helper

## Status

Proposed

## Context

Setting up a new playable scenario area requires multiple manual steps, including creating JSON configuration files for areas and scenarios, downloading OpenStreetMap data, and running local asset pipelines. This friction slows down development and onboarding.

## Decision

We introduce a dependency-free Node.js script `scripts/scenarios/setup-scenario.mjs` to automate the bootstrapping of scenario areas from named presets.

Key aspects:
- **Preset-based Bootstrap:** The script generates `data/areas/<areaId>.area.json` and `data/scenarios/<scenarioId>.scenario.json` from hardcoded presets if missing.
- **BBBike Helper:** Generates a local HTML file with explicit instructions and bounding box coordinates to assist the user in downloading the correct `.osm.pbf` file from BBBike.
- **Conditional Asset Pipeline:** Orchestrates `scripts/local-assets/prepare-local-assets.mjs` only if the required PBF file is present.

Ergonomics:
- `pnpm scenario:setup:hamburg` wraps the command with the first preset `hamburg-core-mvp`.

## Consequences

- Reduced manual JSON editing.
- Clearer guidance for external data requirements.
- No changes to runtime scenario loading or UI.

## Non-Goals

- No automated BBBike scraping or remote extraction.
- No UI modifications in this slice.
- No automated demand generation.
