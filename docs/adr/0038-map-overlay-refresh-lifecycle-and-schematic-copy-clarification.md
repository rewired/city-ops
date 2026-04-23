# ADR 0038: map overlay refresh lifecycle and schematic copy clarification

## Status

Accepted

## Date

2026-04-23

## Context

The map workspace line overlay previously relied on an SVG `key` remount tied to a single `move` listener to refresh projected polyline screen points.

That approach had two issues:

1. It used forced remounting instead of a stable overlay node.
2. It did not explicitly represent zoom/pan/rotate lifecycle boundaries (`start`, active, `end`) for projection refresh triggering.

The same slice also needed clearer UI language that current line visuals represent schematic stop-order connections, not street-routed geometry.

## Decision

- Replace the key-based remount pattern with explicit projection refresh triggers bound to map lifecycle events:
  - `movestart` / `move` / `moveend`
  - `zoomstart` / `zoom` / `zoomend`
  - `rotatestart` / `rotate` / `rotateend`
- Queue projection refresh updates with `requestAnimationFrame` so high-frequency events coalesce into render-safe ticks.
- Keep the existing SVG polyline overlay architecture and recompute polyline projected points from the current map transform on each refresh tick.
- Clarify line semantics in UI copy and visual styling so completed and draft overlays are explicitly labeled as schematic stop-order connections (not street-routed yet).
- Preserve line-building behavior exactly: ordered stop selection and explicit user-triggered completion.

## Consequences

### Positive

- Overlay refresh remains reliable across pan/zoom/rotate lifecycle transitions.
- No forced SVG remount is required; pointer and DOM continuity improve.
- UI intent is clearer about current MVP fidelity and non-goals around routing realism.

### Neutral / Non-goals

- No routing/pathfinding was introduced.
- No renderer replacement was introduced.
- No changes were made to line-build completion semantics.
