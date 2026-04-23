# ADR 0032: Slice 014 static network summary KPIs from planning structure only

## Status

Accepted

## Date

2026-04-23

## Scope

Document Slice 014 boundaries for introducing a small static network summary based only on current in-memory planning structure.

## Constraints

- KPI values must come only from existing structural planning state (placed stops, completed lines, selected completed line stop ids, and selected line time-band frequency assignment state).
- No simulation, demand, routing, travel-time, economy, or persistence semantics may be introduced.
- KPI labels must remain honest and structural.
- The KPI surface must remain compact and desktop-shell aligned.

## Decision

- Add a minimal static network summary section in the right inspector panel.
- Project only these structural KPIs:
  - total stop count
  - completed line count
  - selected completed line stop count (when a line is selected)
  - selected completed line configured and unconfigured canonical time-band counts
- Keep KPI projection as a narrow typed function in the shell and avoid introducing a larger analytics or dashboard architecture.
- Expose placed-stop count from map workspace to shell through a minimal callback boundary so shell-level summaries can be rendered without adding persistence.

## Explicit non-goals

Slice 014 does **not** introduce:

- service simulation metrics
- demand or passenger metrics
- travel-time or routing metrics
- economy or cost metrics
- charting, trend tracking, or reporting systems
- save/load or backend state sync

## Consequences

- The player receives immediate structural network feedback while planning.
- KPI semantics remain truthful to current game state knowledge.
- The implementation stays small and compatible with future simulation slices.
