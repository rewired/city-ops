# ADR 0087: Selected-line inspector disclosure compaction with always-visible issue summary

## Status

Accepted (2026-04-24)

## Context

The selected-line inspector had grown to include several detail-heavy lists (readiness issues, service notes, departure lists, projected vehicle departure rows) that were visible by default. This reduced scanability of the essential planning controls and compact operational status summaries.

## Decision

1. Keep the selected-line essentials visible by default:
   - selected line identity
   - frequency editing controls
   - compact readiness, service, departure, and projected vehicle summaries
2. Add an always-visible compact blockers/warnings summary line whenever any selected-line issues are present.
3. Keep critical blockers visible without requiring disclosure expansion by showing compact error-level readiness messages in the always-visible summary section.
4. Move heavy diagnostic detail behind disclosure sections:
   - full readiness issue list
   - detailed service/debug note list
   - detailed upcoming departure list
   - detailed projected vehicle departure-minute list
5. Preserve existing projection/data wiring and keep the change presentation-only.

## Consequences

- The selected-line inspector remains information-dense but easier to scan in desktop layout.
- Blocking conditions remain visible immediately.
- Deeper diagnostics remain available on demand without removing any existing projection data.

## Explicit non-goals (Slice 033)

- no simulation, routing, or projection semantic changes
- no service-readiness rule changes
- no departure/vehicle computation changes
- no mobile or multimodal scope expansion
