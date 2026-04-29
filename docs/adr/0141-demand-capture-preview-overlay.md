# ADR 0141: Demand Capture Preview Overlay

## Status

Accepted

## Date

2026-04-29

## Context

The spatial distribution of demand (origin nodes and workplace destinations) requires user planning visual feedback. Simply displaying static locations without correlating them to network stop coverage leaves players unable to plan lines effectively.

## Decision

- Implement client-side projection rules tracking the absolute stop catchments of individual demand points.
- Distinguish uncaptured, network-captured, and selected-stop captured states using layered non-interactive map rings.
- Surface raw summary metrics directly under the workspace demand toggle without modifying operational persistence contracts.

## Consequences

- Immediate diagnostic clarity for network planners.
- Full parity with strict type safety checks across component props.
- Complete isolation of planning coverage checks from full-scale transport network route choice routines.
