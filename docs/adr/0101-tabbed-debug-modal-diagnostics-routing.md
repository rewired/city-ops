# ADR 0101: Tabbed debug modal diagnostics routing

## Status

Accepted (2026-04-25)

## Context

The shell already exposes one global top-bar `Debug` entrypoint (ADR 0100), but diagnostics were still presented as one flat list.

That made it harder to quickly locate specific debug categories, especially when mixing:

1. Map interaction/source diagnostics.
2. Routing fallback details.
3. Service readiness details.
4. Raw shell/session/projection state snapshots.

## Decision

1. Add a new UI-only `DebugModal` component (`apps/web/src/ui/DebugModal.tsx`) with four tabs: `Overview`, `Routing`, `Service`, and `Raw state`.
2. Keep modal state ownership in `App.tsx`; `DebugModal` remains presentation-only.
3. Feed `DebugModal` exclusively from existing truthful shell/session/projection values already available in `App.tsx`.
4. Route existing map debug snapshot values and inspector-adjacent diagnostics into appropriate tabs, including:
   - tool mode
   - selected ids
   - counts
   - route fallback notes
   - readiness details
   - ordered stop ids
   - line ids

## Consequences

- Debug diagnostics become easier to scan by category without introducing new simulation or domain logic.
- Raw-state diagnostics remain available for copy/paste inspection in one dedicated tab.
- Map/inspector debug information remains centralized behind the single global debug entrypoint.

## Explicit non-goals (this slice)

- no simulation/routing backend behavior changes
- no persistence/import/export semantic changes
- no new transport modes or mobile behavior
- no inspector workflow redesign beyond diagnostics routing into the debug modal
