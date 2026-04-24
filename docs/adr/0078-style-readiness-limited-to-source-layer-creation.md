# ADR 0078: Style-readiness limited to source/layer creation, not source setData updates

## Status

Accepted (2026-04-24)

## Context

`MapWorkspaceSurface.tsx` currently wraps reactive stop/line/vehicle synchronization effects in `runWhenMapStyleReady(...)` and executes `syncAllMapWorkspaceSources(...)` only inside that readiness callback.

This is safe for source/layer creation, but it also delays source `setData(...)` writes even when workspace source handles already exist. In practice, this can produce unnecessary update latency during style lifecycle churn where source handles are still valid.

## Decision

Split synchronization behavior into two distinct paths:

- **Creation path (style-readiness gated):** keep `runWhenMapStyleReady(...)` only around calls that may need `addSource(...)` / `addLayer(...)`.
- **Data-write path (immediate when possible):** if workspace sources already exist (`map.getSource(...)` handles are present), execute `setData(...)` updates immediately without waiting for style-readiness callbacks.

To make the distinction explicit, `mapWorkspaceSourceSync.ts` now exposes:

- `hasAllMapWorkspaceRenderSources(map)` for source-handle presence checks.
- `syncExistingMapWorkspaceSourceData(input)` for immediate source-data-only sync when handles already exist.
- `syncAllMapWorkspaceSources(input)` for full ensure-and-sync behavior (including source/layer creation).

`MapWorkspaceSurface.tsx` effects now first attempt immediate data sync and only fall back to `runWhenMapStyleReady(...)` when source handles are missing.

## Rationale

### Why split ensure/create from setData

Source/layer creation depends on style readiness and should remain guarded. `setData(...)` writes against already-resolved source handles do not require the same gating and should not be delayed.

### Why keep fallback style-ready path

Style reloads can remove sources/layers. The fallback path preserves safe re-creation semantics and keeps lifecycle robustness from ADR 0044/0077 intact.

### Why keep one canonical helper module

All source synchronization behavior remains centralized in `mapWorkspaceSourceSync.ts` so effects do not reintroduce duplicated source/layer orchestration logic.

## Consequences

- reactive stop/line/vehicle data updates run immediately whenever workspace source handles already exist
- style-readiness callbacks are now reserved for safe source/layer creation fallback paths
- diagnostic builder/source counters remain available for both immediate and style-ready paths
- no change to source/layer identifiers, rendering contracts, or interaction semantics

## Explicit non-goals

- no changes to stop placement rules
- no changes to line routing or service simulation behavior
- no changes to multimodal/mobile scope
- no persistence/import/export boundary changes
