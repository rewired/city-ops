# 0177. Focused Demand Gap Planning Action Entrypoints

## Status

Accepted

## Context

After adding the focused demand gap planning summary (ADR 0175) and candidate list (ADR 0176), the Demand tab provides guidance on how to address specific demand gaps. However, players must manually exit the inspector, navigate to the tool mode rail, and switch modes to start acting on this guidance.

Slice 176 introduces a UI workflow convenience: a compact action entrypoint inside the planning summary that transitions the workspace directly into the appropriate planning tool mode while keeping the map focused on the gap.

## Decision

We will add a single action entrypoint button to the focused planning summary when actionable guidance is available.

- For **coverage gaps**, the action transitions the workspace to the existing `place-stop` mode and focuses the map on the gap position.
- For **connectivity/reachability gaps**, the action transitions the workspace to the existing `build-line` mode and focuses the map on the gap position.

### Strict Non-Authoritative Workflow Constraint

The action entrypoints are strictly UI workflow conveniences. They must not:
1. Create stops automatically.
2. Create, append to, or modify lines automatically.
3. Create routes, services, or timetables.
4. Modify demand, passenger assignments, or simulation state.

The Inspector emits a strictly typed request to the shell (e.g., `start-stop-placement-near-gap`), and the shell translates this into standard, existing workspace tool mode changes and map focus intents. The shell retains full ownership of tool mode state.

## Consequences

- **Improved UX**: Players experience a smoother transition from identifying a problem to planning a solution.
- **Maintained Boundaries**: No simulation or domain state logic is leaked into the UI or altered.
- **Shell Ownership Preserved**: The Inspector remains a pure consumer of projections and emitter of intents. The app shell continues to govern tool modes.
