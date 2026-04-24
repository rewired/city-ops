# ADR 0079: Unified completed-line foreground layer with data-driven selection paint

## Status

Accepted (2026-04-24)

## Context

Completed lines were previously rendered through two filtered foreground layers: one for `selected === false` and one for `selected === true`.

That split introduced avoidable layer duplication for one logical render surface and required duplicate interaction bindings to preserve line click selection behavior.

## Decision

Adopt one unfiltered completed-line foreground layer that renders every completed-line feature and uses data-driven paint expressions keyed by `['get', 'selected']` for color, width, and opacity.

Also introduce one optional completed-line casing layer beneath the foreground layer for contrast and visual legibility against the map basemap.

The completed-line feature click interaction remains bound to the single foreground layer so selection behavior remains feature-driven and unchanged.

## Rationale

### Why one foreground layer

A single foreground layer keeps completed-line semantics centralized and removes split filter management for selected versus non-selected variants.

### Why keep a casing layer

The casing improves edge contrast without changing domain semantics or selection rules.

### Why interaction stays on foreground only

Binding click handling to one canonical interactive foreground layer avoids duplicate event wiring and keeps feature selection entry deterministic.

## Consequences

- completed-line rendering now uses one unfiltered foreground layer with expression-based selected/non-selected styling
- selected-line emphasis is preserved without split source filters
- click-to-select completed lines remains unchanged at behavior level
- line rendered-feature diagnostics can continue to target foreground plus draft layers and avoid double counting casing

## Explicit non-goals

- no changes to line GeoJSON feature schema
- no changes to stop placement or stop interaction flows
- no routing or simulation behavior changes
- no multimodal or mobile scope expansion
