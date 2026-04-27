# ADR 0136: Area-Aware Stop Candidates and Complete Local Asset Pipeline

## Status

Accepted

## Context

To prepare a scenario for gameplay, several local assets must be generated: OSRM routing data, stop candidates, and the scenario registry. Previously, stop candidate generation defaulted to a legacy global path and was not integrated into the main asset preparation pipeline.

## Decision

1. **Area-Aware Stop Candidates**: `scripts/osm/start-stop-candidate-generation.ps1` now accepts an `-Area` parameter to read paths directly from `data/areas/<Area>.area.json`.
2. **Unified Orchestration**: `local-assets:prepare` is the single command that orchestrates OSRM preparation, stop candidate extraction, and scenario registry building.
3. **Non-Goals**:
   - No UI changes are made in this slice.
   - No demand generation is performed.
   - No automated scenario generation from OSM.

## Consequences

Running `pnpm local-assets:prepare -- --area <areaId>` now fully prepares a playable scenario end-to-end.
