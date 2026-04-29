# ADR 0143: Scenario-Owned Demand Contracts

## Status
Proposed

## Context
Previously, the project utilized disconnected demo fixtures for demand logic. To transition toward a realistic, scalable simulation based on real-world data (such as HVV census or OpenStreetMap), we need a unified posture for how demand enters the execution loop.

## Decision
We establish the **Scenario-Owned Demand Artifact** as the canonical runtime truth for transportation demand.

1. **Provenance separation**: External datasets (Zensus, OSM, commuter flows) are treated as *source material only*. They are parsed offline or via ingestion scripts to generate structured artifacts.
2. **Runtime authority**: The core engine strictly reads generated JSON demand artifacts tied to scenarios. It never interacts with raw external source schemas directly.

## Model Constraints

### Demand Nodes
Capture spatial origin/sink weight distributions.
- Active classes: `residential`, `workplace`, `gateway`.
- Temporal bounds: Weighted across canonical MVP time bands.

### Attractors & Gateways
Define structural pull targets.
- **Passive Taxonomy**: Including kinds like `ferry-terminal` or categories like `retail` is explicitly allowed for data completeness. However, this does **not** authorize multimodal execution logic, ferry routes, or complex commercial gameplay.

### Demand Capture Bounds
Demand is emitted by scenario nodes. Transit stops do **not** act as standalone demand generators; instead, stops capture regional access node weights within localized walking thresholds.

## Consequences
- Verification isolation: Core simulation layers can safely execute assuming valid input structures.
- UI decoupling: Map layers will query projection boundaries instead of extracting geographic geometries.
