# ADR 0184: Demand Node Context Candidate Locality

## Context

The Demand Node Inspection feature provides map-based planning hints for a selected demand node. These hints represent likely residential-to-workplace context (or vice versa) to help players plan new transit services.

Previous behavior sorted context candidates by global active demand weight first. In city-scale scenarios, this caused multiple workplace nodes across the map to point to the same few high-weight residential clusters, even when geographically implausible. This made the hints less useful for local planning.

## Decision

We replace global weight-first sorting with a locality-aware context score.

### Scoring Formula

We use a hyperbolic distance decay function to rank candidates:

```
contextScore = activeWeight / (1 + distanceMeters / DEMAND_NODE_CONTEXT_DISTANCE_DECAY_METERS)
```

### Ranking Priority

Candidates are sorted by:
1. Descending `contextScore` (locality-aware weight)
2. Ascending `distanceMeters` (tie-breaker favoring closer nodes)
3. Descending `activeWeight` (tie-breaker favoring higher absolute weight)
4. Ascending stable candidate ID (deterministic fallback)

### Constant Selection

We use `DEMAND_NODE_CONTEXT_DISTANCE_DECAY_METERS = 4000`. 
This baseline ensures that city-scale commute context is preserved:
- 4km distance retains 50% of weight value.
- 8km distance retains ~33% of weight value.
- 12km distance retains ~25% of weight value.

This prevents the hints from collapsing into neighborhood-only context while still penalizing extreme distances that are less likely to serve as planning context for a single node.

## Consequences

- Clicking different workplace nodes will now produce more geographically relevant residential candidates.
- Ranking remains purely deterministic.
- The projection remains a planning hint only. It does not introduce:
    - Exact OD matrices
    - Passenger-flow simulation
    - Route computation
    - Passenger assignment
- Map hint rendering remains decoupled from simulation truth.
- This change only affects the `DemandNodeInspectionProjection` used in the Inspector Demand tab; it does not change the global demand-gap ranking or capture math.
