# ADR 0149: Census Grid Adapter to Generator Integration

## Status

Accepted

## Context

We need to integrate the generic census-grid CSV adapter skeleton into the manifest-driven scenario demand generator. Generated scenario artifacts serve as offline runtime truth.

## Decision

1. **Manifest Schema Extension**: Support optional `adapter` and `options` properties in the `ScenarioSourceMaterialSource` schema.
2. **Generation Coverage**: Construct standard `ScenarioDemandNode` sets derived from coordinate mapping.
3. **Deterministic Combination Rules**: Establish cross-dataset conflict resolution logic enforcing ID safety constraints.

## Consequences

- Scenario demand structures remain modular.
- Deterministic bounds eliminate local testing errors across evaluation branches.
