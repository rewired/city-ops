# ADR 0183: Map Demand Gap Focus Interaction

## Status

Accepted

## Context

After implementing the Demand Gap Overlay (Slices 170-181), players can see planning pressure and OD hints on the map. However, focusing a specific demand gap to reveal its planning summary and OD context was previously only possible via the Inspector's list view. This is counter-intuitive for a map-centric game where players naturally want to interact with what they see on the map.

## Decision

We will allow players to focus a demand gap directly from the map by clicking on its point-level feature.

### Interaction Logic

1.  **Target Layers**: The click interaction targets the circle layers representing individual gaps:
    - `MAP_LAYER_ID_DEMAND_GAP_OVERLAY_CIRCLE`
    - `MAP_LAYER_ID_DEMAND_GAP_OVERLAY_FOCUS`
2.  **Heatmap Exclusion**: The heatmap layer (`MAP_LAYER_ID_DEMAND_GAP_OVERLAY_HEATMAP`) remains non-interactive. Heatmap cells are aggregate visual artifacts and do not correspond to stable domain entities that can be focused.
3.  **Priority**: Demand gap clicks preserve the priority of existing interactive features. If a stop or a completed line is also at the click point, those entities take precedence if the interaction pipeline is configured to return early.
4.  **Mode Constraint**: Map-based focus is active in `inspect` mode.

### Architectural Boundary

- **Command Only**: Map-based focus is a UI interaction command that triggers the existing `onDemandGapFocus(gapId)` path.
- **No Model Changes**: This change does not alter demand generation, ranking, capture, or simulation logic.
- **Projection Ownership**: Projections continue to own the planning summary, OD context, and lifecycle feedback driven by the focused gap ID.

## Consequences

- Players can more fluidly transition from observing pressure on the map to inspecting the underlying demand context.
- The UI feels more responsive and "map-first".
- Pointer cursor affordance on demand gap circles provides clear feedback that they are interactive.
- Clear separation between aggregate heatmap visuals (non-interactive) and point-level gap entities (interactive) is maintained.
