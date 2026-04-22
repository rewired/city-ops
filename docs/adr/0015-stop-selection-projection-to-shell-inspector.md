# ADR 0015: Project selected stop details from map workspace to shell inspector

## Status

Accepted

## Date

2026-04-22

## Context

The stop placement slice already supports local stop creation and stop marker clicks in the map workspace.
A follow-up slice requires the right shell inspector panel (`App.tsx`) to render minimal selected-stop details.

Keeping all selection state local to `MapWorkspaceSurface` blocks the shell from rendering stop details.
At the same time, introducing broad inspector payloads (lines, demand, economy, routing) would exceed the requested scope.

## Decision

- Keep stop placement and stop marker rendering local to `MapWorkspaceSurface`.
- Expose a narrow typed selection payload from the map surface to the shell through a callback:
  - `selectedStopId`
  - optional stop `label`
  - `lng`
  - `lat`
- Store the current selection in `App.tsx` and pass only `selectedStopId` back to the map surface for marker highlight state.
- Render a minimal right-panel inspector in `App.tsx`:
  - neutral empty state when there is no selected stop
  - minimal selected-stop details when one stop is selected

## Explicit non-goals

This decision does **not** introduce:
- line-level inspector fields
- demand metrics
- economy metrics
- routing/path details
- generalized multi-entity selection frameworks

## Consequences

- The shell now owns the inspector-facing selection state while the map remains responsible for placement interactions.
- The map-to-shell contract stays strongly typed and intentionally narrow for this MVP slice.
- Future slices can extend the inspector payload only when explicitly scoped.
