# ADR 0167: Scenario Routing Coverage and Pan Guardrails

## Context

The OpenVayra - Cities map-runtime previously allowed players to pan indefinitely and attempt to place stops outside the prepared routing coverage of a scenario. This resulted in undefined behavior, routing failures, or confusing UX when interacting with areas where the OSRM engine has no data.

## Decision

We will implement a scenario-owned routing coverage contract to define valid gameplay boundaries.

1.  **Contract**: Scenarios must explicitly define their routing coverage (initially as a bounding box).
2.  **Visualization**: Areas outside the routing coverage will be visually dimmed using a GeoJSON mask overlay (inverted polygon).
3.  **Pan Guardrails**: The map viewport will be restricted using `map.setMaxBounds()` based on the scenario's coverage, plus a standard padding of 0.05 degrees.
4.  **Placement Rejection**: Stop placement attempts outside the routing coverage will be rejected with "invalid-target" feedback.

## Rationale

- **UX Clarity**: Dimming non-routable areas provides immediate visual feedback on where the game can be played.
- **System Stability**: Preventing interactions outside coverage avoids sending invalid coordinates to the OSRM routing engine.
- **MVP Scope**: A simple bounding box is sufficient for the bus-first MVP and avoids the complexity of extracting precise convex hulls from the routing graph.

## Consequences

- Scenarios must be updated to include `routingCoverage` metadata.
- Panning is now intentionally limited, which might feel restrictive if the coverage is too tight; padding is provided to alleviate this.
- Stop placement logic now depends on scenario metadata in addition to street-snapping availability.
