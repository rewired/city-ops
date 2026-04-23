# ADR 0039: stop-marker anchor/offset typing and visual-center alignment

## Status

Accepted

## Date

2026-04-23

## Context

Stop markers are used for placement and selection workflows where players expect the geographic stop position to match the marker's visual center.

The workspace used a minimal local MapLibre marker constructor typing that only included `element`, while marker construction relied on runtime defaults for anchor behavior. This left the anchor contract implicit and less trustworthy at the type boundary.

The same slice needed a single source of truth for marker anchor/offset display intent so construction code and CSS styling communicate the same center-aligned marker semantics.

## Decision

- Extend the local MapLibre marker constructor options typing to include explicit `anchor` and `offset` fields.
- Centralize stop-marker anchor/offset values in a dedicated map-workspace constants module.
- Pass explicit anchor/offset constants from `createStopMarker(...)` when creating map markers.
- Keep stop-marker CSS center semantics explicit by using border-box marker sizing and centered affordance transform origin.

## Consequences

### Positive

- Marker construction is now explicit and strongly typed for anchor/offset behavior.
- Visual and runtime center alignment are easier to audit and maintain from a single constants source.
- Stop placement/select trustworthiness improves because center alignment is intentional rather than default-driven.

### Neutral / Non-goals

- No new interaction modes were added.
- No placement-rule, routing, or simulation behavior changed.
- No non-stop marker APIs were expanded beyond this narrow typing need.
