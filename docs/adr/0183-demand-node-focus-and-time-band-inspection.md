# ADR 0183: Demand Node Focus and Time-Band Inspection

## Status

Proposed

## Context

Players need to understand the planning context of specific demand clusters (origins and destinations) independent of aggregate demand gap ranking. While demand gaps provide a prioritized list of problems, direct inspection of nodes on the map allows for a more "bottom-up" analysis of the scenario demand model.

Furthermore, demand varies significantly across time bands. Players need to be able to inspect these variations (e.g., seeing where a workplace's demand comes from during Morning Rush vs. Midday) without forcing the simulation clock to move, which would disrupt their active planning session.

## Decision

We will implement a map-first demand node inspection workflow:

1.  **Selection State**: The shell will own a `selectedDemandNodeId` state, separate from the `focusedDemandGapId`. Clicking a scenario demand node on the map will select it.
2.  **Inspection Time Band**: A UI-only override state `inspectDemandTimeBandSelection` will be introduced. It defaults to `follow-simulation` but can be set to any canonical time band. This affects only the inspection projection.
3.  **Artifact-Wide Lookup**: The inspection projection resolves nodes directly from the full generated `ScenarioDemandArtifact`. Selection and inspection are decoupled from the top-N demand gap ranking, ensuring that any rendered node on the map remains inspectable.
4.  **Projection-Only Context**: We introduce a `demandNodeInspectionProjection` that consumes scenario demand artifacts and existing projections to provide:
    *   Node metadata (ID, role, base weight).
    *   Time-band specific active weight.
    *   Capture and service problem status.
    *   Likely context candidates (workplaces for origins, residential for destinations).
5.  **Non-Authoritative Framing**: All context candidates and guidance are explicitly labeled as planning hints derived from the scenario model, not as exact passenger flow truth.

## Consequences

*   Players can now "explore" the demand model by clicking nodes on the map.
*   The Inspector Demand tab becomes more interactive, serving as a dual-purpose tool for both aggregate gap analysis and specific node inspection.
*   Architectural boundaries are preserved by keeping the inspection logic in a pure projection, independent of simulation state or passenger flow modeling.
*   The introduction of a UI-only time-band override allows for temporal exploration without side effects on simulation or service truth.
*   "Clear selection" and "Clear focus" affordances are provided to allow players to return to a neutral state.
