# ADR 0111: Routing Adapter Results Map Into Canonical Line Route Segments

## Status

Accepted

## Context

We have established a `RoutingAdapter` interface for external routing providers (like OSRM) and a canonical `LineRouteSegment` domain type for line routes. These two type worlds are separate by design: the adapter world is focused on external provider responses, while the domain world is focused on CityOps transit simulation and display requirements.

We need a deterministic way to bridge these two worlds when a line is completed, ensuring that street-routed geometry and metrics are mapped into the domain while providing reliable fallbacks if routing fails.

## Decision

1.  **Focused Domain Helper**: We introduce a framework-independent domain helper (`buildRoutedLineRouteSegments`) that bridges the `RoutingAdapter` results to `LineRouteSegment[]`.
2.  **Type Separation**: `ResolvedRouteSegment` (adapter) and `LineRouteSegment` (domain) remain separate. Mapping is performed explicitly via `mapResolvedRouteSegmentToLineRouteSegment`.
3.  **Dwell Time Separation**: Adapter durations (in-motion travel time) are kept separate from domain dwell times. The helper is responsible for adding canonical dwell time to the routed travel time.
4.  **Deterministic Fallback**: If a routing attempt fails, the helper falls back to the existing deterministic fallback behavior (`buildFallbackSingleRouteSegment`), ensuring the line always has valid (though potentially straight-line) geometry and metrics.
5.  **Status Propagation**: Segments are explicitly marked as `routed` or `fallback-routed` to preserve truth about their origin.

## Consequences

*   **Improved Route Truth**: Lines will prefer street-linked geometry and durations when available.
*   **Resilience**: Line completion remains functional even if the routing service is unavailable or returns an error.
*   **Testability**: The mapping logic can be tested thoroughly using a mocked `RoutingAdapter` without requiring a live OSRM service.
*   **Deferred UI Integration**: The helper is established in the domain layer; wiring it into the MapLibre/React UI is deferred to a subsequent slice.
