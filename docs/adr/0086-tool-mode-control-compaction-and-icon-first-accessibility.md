# ADR 0086: Tool mode control compaction and icon-first accessibility

## Status

Accepted (2026-04-24)

## Context

The left panel tool-mode selector in `App.tsx` used repeated descriptive button labels and a verbose "Current mode" sentence. The desktop shell already reserves limited horizontal/vertical space for control density, and the tool selector needed a tighter footprint without changing workspace mode behavior.

## Decision

1. Keep all existing tool modes (`inspect`, `place-stop`, `build-line`) and existing selection behavior unchanged.
2. Introduce a compact current-mode status row with:
   - a short static label (`Mode`)
   - a small active-mode badge/chip using a short mode token (`INSP`, `STOP`, `LINE`)
3. Switch tool selection buttons to icon-first compact buttons.
   - Keep explicit active state via `aria-pressed`.
   - Preserve accessible names using both `aria-label` and `title`.
4. Tighten `.tool-mode-control*` spacing and button sizing while preserving keyboard focus visibility through an explicit `:focus-visible` outline.

## Consequences

- Left-panel mode controls are denser and easier to scan in the desktop shell.
- Accessibility semantics remain explicit for screen-reader and keyboard users.
- Tool and workspace behavior contracts remain unchanged.

## Explicit non-goals (Slice 032)

- no addition/removal of tool modes
- no workspace interaction behavior changes
- no simulation/domain/economy logic changes
- no mobile-specific layout behavior
