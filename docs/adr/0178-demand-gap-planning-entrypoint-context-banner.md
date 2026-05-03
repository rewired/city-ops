# ADR 0178: Demand Gap Planning Entrypoint Context Banner

## Context

In Slice 177, we introduced planning entrypoints from focused demand gaps (Stop Placement or Line Planning). While functional, the immediate transition to these modes can feel abrupt. The user might lose the specific context of *why* they are now in "Place Stop" or "Build Line" mode (e.g., "I'm trying to cover this specific demand gap").

## Decision

We will implement a small, transient, shell-owned **Planning Context Banner**.

1.  **Transient UI Context Only**: The banner serves purely as a reminder and guidance interface. It does not own the domain truth for stops, lines, or demand.
2.  **Shell-Owned State**: The transient context state is managed by the application shell (e.g., `App.tsx`). It is set when a planning entrypoint is triggered and cleared when:
    *   The user explicitly dismisses it.
    *   The demand gap focus is cleared.
    *   The user manually switches back to neutral mode (e.g., "Inspect").
3.  **Non-Authoritative**: The banner and the entrypoints themselves do not automatically create stops, lines, routes, or services. They only facilitate the transition to existing manual planning tools.
4.  **Bounded Rendering**: The banner is rendered as a bounded overlay in the map workspace, ensuring it doesn't break the shell layout or interfere with map controls excessively.

## Consequences

*   **Improved Workflow Clarity**: Players receive immediate feedback and persistent guidance after triggered transitions.
*   **Minimal State Surface**: No persistence is required for this transient UI hint.
*   **Strict Separation**: Projections and simulation logic remain decoupled from this UI-only coordination layer.
