# ADR 0007: Add explicit resize handling for map workspace runtime wiring

## Status

Accepted

## Date

2026-04-22

## Context

The MapLibre workspace lifecycle currently mounts and unmounts correctly, but size changes are not explicitly observed. In responsive desktop layouts, panel toggles and window resize events can change the map container dimensions, requiring a runtime `map.resize()` call to keep rendering aligned.

## Decision

- Add a local `handleMapResize` callback in `MapWorkspaceSurface` that safely calls `mapInstance.resize()` only when a map instance exists.
- Keep resize wiring inside the existing map `useEffect` lifecycle where map creation and teardown are already managed.
- Prefer `ResizeObserver` on the map container when available.
- Fallback to a `window` `resize` listener when `ResizeObserver` is unavailable.
- Cleanup observer/listener registration in the same effect cleanup path.
- Extend the `MapLibreMap` interface with a typed `resize(): void` contract.

## Consequences

- Map canvas sizing remains correct for both container-driven and viewport-driven size changes.
- Resize handling stays local to map workspace runtime wiring and does not introduce global state or domain logic.
- Type safety improves by documenting `resize()` on the minimal MapLibre surface.
