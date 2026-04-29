# ADR 0147: Manifest-Driven Scenario Demand Generation

## Status
Accepted

## Context
Building upon the scenario demand generation pipeline established in Slice 143, we need a mechanism to drive scenario generation from structured source-material manifests (introduced in Slice 144). 

The project stance is:
1. **Source Material Manifests** configure external datasets as passive source data references.
2. **Generated Demand Artifacts** are the definitive, scenario-owned runtime truth. 
3. The CLI generator orchestrates parsing from manifests into final generated JSON schemas.

## Decision
We introduced the `--manifest` argument to the generic `build-scenario-demand.mjs` script, ensuring:
- It safely resolves enabled source entries matching a supported kind (`manual-seed`).
- Enabled unsupported source kinds (e.g. `census-grid`, `osm-extract`) fail early and clearly to avoid silent degradation.
- Disabled entries are retained purely for documentation/planning metadata and do not trigger runtime code execution or dependency failures.
- The source seed must declare the same `scenarioId` as the driving manifest.

## Consequences
- Scenarios map their source materials centrally without tight runtime dependencies on live databases.
- Real Zensus, OSM, and commuter data remain cleanly partitioned outside application core mechanics for this scope.
