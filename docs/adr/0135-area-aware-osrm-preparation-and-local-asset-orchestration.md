# ADR 0135: Area-Aware OSRM Preparation and Local Asset Orchestration

## Status

Accepted

## Context

Previously, local OSRM routing asset generation was hardcoded to `hamburg-latest`. As we introduce new areas and scenarios, this hardcoded workflow is fragile and does not scale. Additionally, heavier asset generation (such as Docker runs) was partially blended into commands like `scenarios:build`, making fast registry checks unnecessarily slow and resource-heavy.

## Decision

We establish the following orchestration boundaries:

1. **Single Configuration Source**: `data/areas/<Area>.area.json` defines the single source of truth for file placement, algorithms, algorithms engines, and naming.
2. **Read-Only Scenario Registry**: `pnpm scenarios:build` remains a fast, read-only validation and generation step. It will never perform Docker generation or asset mutations.
3. **Asset Orchestration Isolation**: Heavily localized asset creation is moved behind an explicit orchestration layer `pnpm local-assets:prepare -- --area <areaId>`.
4. **Ignored Data Lifecycles**: Generated OSRM assets remain excluded from repository tracking via `.gitignore`.

## Consequences

- Running OSRM pipelines must be done explicitly per area.
- Developers have programmatic safeguards against pushing volatile intermediate datasets.
