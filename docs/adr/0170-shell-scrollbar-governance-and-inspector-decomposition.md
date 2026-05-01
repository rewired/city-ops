# ADR 0170: Shell Scrollbar Governance and Inspector Decomposition

## Status

Accepted

## Context

The OpenVayra - Cities application shell was showing browser-default scrollbars on the main window during normal gameplay. This degraded the premium look of the simulation and led to inconsistent scrolling behavior where the entire Inspector panel (including its header and tab bar) would scroll out of view.

Additionally, `InspectorPanel.tsx` had grown into a large (500+ lines) mixed rendering component, making it difficult to maintain and test individual tab perspectives.

## Decision

1.  **Shell Scrollbar Governance**:
    *   Enforce a "no page-level scroll" contract at the root level (`html`, `body`, `#root`, and `.app-shell`) using `overflow: hidden` and fixed viewport heights.
    *   Introduce a centralized `.u-scrollbar` CSS utility in `styles/scrollbars.css` for slim, subtle, and dark-theme-consistent scrollbars.
    *   Restrict scrolling to explicit internal surfaces (e.g., Inspector content area, modal bodies) using `overflow-y: auto`.

2.  **Inspector Decomposition**:
    *   Refactor `InspectorPanel.tsx` into a coordinator role.
    *   Extract navigation logic into `InspectorTabBar.tsx`.
    *   Extract scrolling logic into `InspectorScrollArea.tsx`.
    *   Extract tab-specific rendering into focused components:
        *   `InspectorOverviewTab.tsx`
        *   `InspectorLinesTab.tsx`
        *   `InspectorDemandTab.tsx`
        *   `InspectorServiceTab.tsx`

3.  **CSS Organization**:
    *   Keep custom scrollbar styles in a dedicated feature-style file (`styles/scrollbars.css`) imported via `App.css`.

## Consequences

*   **Improved UX**: The main application window remains stable and fits the desktop viewport without OS-default scrollbars leaking into the chrome.
*   **Better IA Persistence**: The Inspector header and tab bar remain fixed, allowing users to switch tabs or see the title even when tab content is long.
*   **Maintainability**: Tab-specific logic is isolated, making it easier to add new projections or refine information design for specific tabs without touching the main coordinator.
*   **Type Safety**: Tab components use explicit, typed props derived from the main coordinator's input.

## Non-Goals

*   No changes to simulation or projection logic.
*   No mobile/touch-first responsive behavior.
*   No global restyling of browser-native scrollbars outside the app's control.
