# ADR 0169: Icon-Tab Inspector Information Architecture Repair

## Status

Proposed

## Context

Slice 168 introduced collapsible sections via `InspectorDisclosure` to manage visual density in the Inspector. However, the `Network` tab remained overloaded, serving as a dumping ground for disparate concerns (KPIs, demand, service pressure, gaps, inventory). This resulted in a long vertical stack that was difficult to scan and navigate.

Additionally, the `InspectorDisclosure` component suffered from poor contrast in the dark inspector theme, often rendering dark text on a dark blue background.

## Decision

We will refactor the Inspector to use an icon-first tabbed navigation and split the overloaded `Network` tab into three focused perspectives.

### Icon-First Navigation

- The top-level inspector navigation is changed from text-based tabs to compact icon-first buttons.
- Tabs use Material Icons with visible tooltips (`title`) and `aria-label` for accessibility.
- Icons used:
    - **Overview**: `monitoring` (High-level KPIs and inventory)
    - **Lines**: `route` (Line management)
    - **Demand**: `groups` (Demand capture, service, and gaps)
    - **Service**: `speed` (Service pressure and network readiness)

### Information Split

- **Overview Tab**: Contains primary network KPIs (stops, lines, vehicles, active band) and the "Network inventory" disclosure. This is the default tab.
- **Demand Tab**: Groups all demand-related projections, including Capture, Served demand, and Identify gaps (ranking).
- **Service Tab**: Contains Service pressure and related service-specific summaries.
- **Lines Tab**: Preserves existing line-list and selected-line detail behavior.

### Contrast Repair

- Migration of all `InspectorDisclosure` and `inspector-demand-gaps` styles to canonical CSS variables (`--openvayra-cities-color-*`).
- Summary text color changed from `rgba(0, 0, 0, 0.7)` to `var(--openvayra-cities-color-text-secondary)`.
- Borders and arrows updated to use subtle, accessible muted colors compatible with the dark inspector surface.

## Consequences

- **Pros**:
    - Significantly improved scanability by separating unrelated concerns.
    - Reduced vertical scroll pressure on any single tab.
    - Professional, "icon-first" desktop UI aesthetic.
    - Accessible and high-contrast labels for all players.
- **Cons**:
    - Requires players to switch tabs to see detailed Demand or Service data that was previously visible in a single scroll.

## Non-Goals

- No changes to projection semantics or math.
- No new simulation rules or domain truth in UI.
- No map-based heatmaps or overlays.
- No mobile/touch optimization.
