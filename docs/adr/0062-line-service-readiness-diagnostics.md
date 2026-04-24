# ADR 0062: Line service readiness diagnostics

## Status

Accepted

## Date

2026-04-24

## Context

The selected-line workflow now has a pure domain readiness evaluator and an inspector projection that expose whether a completed line is structurally and operationally ready for future simulation entry.

This project needs an explicit ADR that explains *why* readiness diagnostics exist as their own pre-simulation step and why this boundary is intentionally separate from selected-line export JSON validation.

## Decision

- Introduce and retain readiness diagnostics as a pre-simulation gate that runs before any simulation execution.
- Keep readiness diagnostics separate from selected-line export JSON validation.
- Treat fallback-routed handling as warning-level and allow fallback-only lines to resolve to `partially-ready` (not fully `ready`).
- Treat missing frequency configuration as a blocker for full readiness.
- Keep the readiness evaluator pure and outside React.
- Keep the inspector as a projection-only surface that displays evaluator results without owning readiness rules.

## Rationale

### Why readiness diagnostics are introduced before simulation execution

Readiness diagnostics provide a deterministic structural/configuration gate before simulation exists in this slice. This gives the app one canonical answer to whether a line is serviceable enough to *enter* simulation later, while preventing simulation-entry checks from being duplicated across UI paths.

### Why readiness is separate from selected-line export JSON validation

Readiness answers domain-operational questions (can this line run service from a structural/configuration perspective), while export validation answers payload-shape/contract questions (is this JSON export valid as data). Mixing them would blur boundaries and couple simulation-entry semantics to serialization concerns.

### Fallback-routed handling decision (warning + fallback-only => partially-ready)

Fallback-routed segments are still usable for MVP continuity, so they should not hard-block service. But fallback-only routing indicates reduced confidence/quality versus primary routing. Therefore, fallback-only is explicitly downgraded to `partially-ready` with warning diagnostics rather than elevated to fully `ready`.

### Why missing frequency configuration blocks full readiness

A line without valid configured frequencies across canonical time bands cannot represent a runnable service plan. This is a core operational prerequisite, not an optional quality metric, so missing/unset frequency configuration must block full readiness.

### Why evaluator is pure and outside React

Readiness must remain a deterministic domain rule that is independently testable, reusable, and not tied to component lifecycle/rendering concerns. A pure evaluator also prevents UI-local drift in readiness semantics.

### Why inspector displays readiness as projection only

The inspector is a read-only consumer of readiness output. It should display status, counts, and issues produced by the evaluator, but never redefine readiness logic. This preserves architecture boundaries (domain truth in domain layer; UI as projection).

## Consequences

- Simulation-entry readiness has a stable, typed, domain-owned contract.
- Export validation remains independently evolvable without affecting readiness semantics.
- UI surfaces can present readiness consistently while avoiding rule duplication.
- Fallback routing remains usable in MVP but is clearly signaled as lower-confidence readiness.

## Non-goals

- no simulation execution
- no demand/economy/passenger/vehicle model
- no new route calculation
- no import/persistence/backend/savegame/scenario/fixture replay loading
- no multimodal/mobile expansion
