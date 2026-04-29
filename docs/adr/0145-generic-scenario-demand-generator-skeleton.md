# ADR 0145: Generic Scenario Demand Generator Skeleton

## Status

Proposed

## Context

We need a way to generate valid `ScenarioDemandArtifact` files for scenarios without reintroducing the legacy demo demand runtime model.
The project posture dictates that:
1. External datasets are scenario source material only.
2. Generated scenario artifacts are scenario-owned runtime truth.
3. Runtime code reads scenario demand artifacts, not raw sources.

## Decision

We introduce a generic, reusable scenario demand artifact generator skeleton (`build-scenario-demand.mjs`) that compiles simple curated seed JSON input into fully valid, strongly typed `ScenarioDemandArtifact` payloads.

Key constraints:
- The generator is generic and scenario-agnostic (not an "HVV importer").
- Seed files act as source material.
- Generated demand artifacts are scenario-owned runtime truth.
- Real census/OSM parsing, map layers, simulation, flow assignment, and economy behavior are strictly out of scope for this slice.

## Consequences

- Scenario setup pipelines can orchestrate asset generation predictably.
- Browser-readable artifacts (`*.demand.json`) remain ignored by version control.
