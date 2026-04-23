# ADR 0031: Slice 013 completed-line frequency configuration boundaries

## Status

Accepted

## Date

2026-04-23

## Scope

Document Slice 013 boundaries for completed-line frequency configuration and inspector editing behavior using canonical time-band domain primitives.

## Constraints

- Frequency configuration applies only to completed lines, never to in-progress line drafts.
- All frequency fields must be keyed by canonical `TimeBandId` values and rendered in canonical `MVP_TIME_BAND_IDS` order.
- Inspector editing remains minimal and direct, with one per-band interval input and lightweight validation feedback.
- Session state updates must preserve explicit `null` for unset per-band values.

## Decision

- Keep frequency configuration attached to completed lines only, represented as a per-time-band mapping in session state.
- Use canonical time-band ids/ordering/labels as the sole source for frequency editor generation and state keying.
- Restrict inspector editing to per-band value entry and validation, without introducing cross-band optimization, automation, or derived planning logic.
- Keep validation posture intentionally narrow: positive minutes are accepted, empty values are treated as unset, and zero/negative values are rejected.

## Inspector editing boundaries

- Inspector may edit only frequency interval values for the currently selected completed line.
- Inspector may not create/delete lines, alter line geometry, or modify stop ordering.
- Inspector may not infer service plans, suggest frequencies, or auto-fill missing bands.

## Explicit non-goals

Slice 013 does **not** introduce:

- simulation changes
- routing/pathfinding behavior
- demand-model logic
- economy-model logic
- persistence/storage or backend sync

## Consequences

- Completed-line service interval intent is now editable in a bounded, canonical form.
- Time-band consistency is preserved across domain and inspector surfaces.
- Validation remains lightweight and easy to reason about while avoiding hidden domain coupling.
