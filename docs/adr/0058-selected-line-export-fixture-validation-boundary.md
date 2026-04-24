# ADR 0058: Selected-line export fixture validation boundary

## Status

Accepted

## Date

2026-04-24

## Context

The selected-line export slice produces JSON artifacts from UI-created, in-memory session state.

Before any future loader, import, or replay work exists, these artifacts still need a stable quality gate so fixture files can be trusted as deterministic contract examples rather than ad-hoc snapshots.

The project also needs a clear artifact location distinction:

- fixture artifacts are reviewable contract samples
- seeds imply initialization/bootstrap semantics that this slice does not introduce

## Decision

- Validate UI-created selected-line JSON fixtures immediately at export-fixture boundary time, before any future loader/import/replay pathways are considered.
- Commit selected-line fixture artifacts under `data/fixtures/selected-line-exports/` as explicit fixture data owned by contract validation and test/debug workflows.
- Do not place these artifacts under `data/seeds/`, because they are not startup initialization inputs and do not represent application seeding behavior.
- Keep validation pure and domain-level, outside React and MapLibre, so correctness rules remain deterministic, testable, and independent from rendering/runtime UI concerns.
- Keep validator responsibilities focused on structural and coherence checks only.
- Do not recompute route segments during validation; route segments are checked for coherence against payload truth instead of being regenerated.

## Consequences

- UI-generated fixtures can be committed with a consistent validation contract even before import/replay features exist.
- Fixture storage path semantics remain explicit: these are fixtures, not seeds.
- Validation behavior is reusable by future tooling without coupling to component lifecycle or map integration details.
- Route consistency checks remain stable and auditable without introducing recalculation side effects.

## Non-goals

- no import
- no persistence/backend
- no savegame/scenario loading
- no fixture replay loader
- no route recalculation
- no demand/economy/passenger/vehicle simulation
- no multimodal expansion
- no mobile behavior
