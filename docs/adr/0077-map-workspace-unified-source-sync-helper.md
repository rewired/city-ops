# ADR 0077: Map workspace unified source synchronization helper

## Status

Accepted (2026-04-24)

## Context

`MapWorkspaceSurface.tsx` evolved multiple lifecycle-specific source/layer orchestration paths:

- map `load` handler
- stop synchronization effect
- line synchronization effect
- vehicle synchronization effect
- style-readiness gated update path

These paths duplicated source/layer ensure calls and per-domain source data updates. Duplication increased lifecycle drift risk (for example, one path ensuring only a subset of sources/layers) and made diagnostic readback behavior inconsistent.

## Decision

Introduce one local helper module, `mapWorkspaceSourceSync.ts`, with `syncAllMapWorkspaceSources(...)` as the single synchronization entry point.

### Included

- one shared helper that always:
  - ensures stop/completed-line/draft-line/vehicle sources and layers exist
  - writes stop source data when stop-sync input is provided
  - writes completed-line and draft-line source data when line-sync input is provided
  - writes vehicle source data when vehicle-sync input is provided
  - enforces deterministic custom layer ordering after ensure passes
  - returns source readback diagnostic counts plus optional builder counts
- replace duplicated load/effect orchestration in `MapWorkspaceSurface.tsx` with helper calls
- keep style-readiness gating via existing `runWhenMapStyleReady(...)` and execute helper inside those callbacks

## Rationale

### Why one helper

A single helper keeps map lifecycle behavior consistent across load-time and reactive updates. It reduces maintenance overhead and lowers regression risk when adding or adjusting map-owned layers/sources.

### Why optional sync payload blocks

Stop, line, and vehicle updates can remain independently triggered by current React effects while still sharing one ensure/order/readback orchestration core.

### Why enforce custom layer order each pass

Style reloads and incremental layer registration can shift ordering. Reapplying canonical layer order maintains deterministic z-order semantics without coupling ordering to a single lifecycle event.

### Why include readback diagnostics

Source readback counts improve troubleshooting by exposing whether feature-building and source registration/write paths succeeded even when rendered output may still be blocked by style/viewport timing.

## Consequences

- map load and all style-ready update paths now share identical ensure/order behavior
- stop/line/vehicle sync paths stay decoupled in React effects while converging on one map mutation helper
- line/vehicle diagnostics in the HUD continue to update from helper-provided builder/source counts
- layer ordering is deterministic after each synchronization pass

## Explicit non-goals

- no changes to routing semantics
- no changes to simulation/economy/passenger logic
- no changes to line selection behavior contracts
- no persistence/import/export scope expansion
- no multimodal/mobile scope expansion
