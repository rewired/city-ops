# ADR 0064: Line service plan projection status and summary boundary

## Status

Accepted (2026-04-24)

## Context

Slice 019 introduced the simulation clock baseline, including deterministic active time-band derivation.

Slice 018/018c introduced line service-readiness evaluation and typed diagnostics, including blocked vs warning-only classification and explicit fallback-routing diagnostics.

After those two foundations exist, the MVP now needs a separate projection surface that answers a narrower planning question: what is currently configured service in the active time band?

## Decision

Introduce a dedicated line service plan projection module that remains separate from execution simulation.

### Included

1. Add canonical projection contracts in `apps/web/src/domain/types/lineServicePlanProjection.ts`.
2. Add pure projection helpers in `apps/web/src/domain/projection/lineServicePlanProjection.ts`.
3. Reuse readiness evaluation output (`evaluateLineServiceReadiness`) instead of duplicating readiness rules.
4. Determine configured-service status from the active time-band frequency plus readiness state:
   - `blocked`: readiness is blocked.
   - `not-configured`: readiness is not blocked, but active-band frequency is unset/invalid.
   - `degraded`: active-band frequency is valid, but readiness is warning-only (`partially-ready`), including fallback-only readiness cases.
   - `configured`: active-band frequency is valid and readiness is fully ready.
5. Expose departures-per-hour only as a theoretical planning metric derived from configured headway; it is not an executed-service throughput claim.

## Rationale

### Why projection is introduced now (after clock/readiness)

Projection depends on both prerequisites that now exist:

- clock/time-band truth (Slice 019)
- readiness diagnostics truth (Slice 018/018c)

Introducing projection earlier would have required either local clock semantics or duplicate readiness logic.

### Why projection is separate from execution simulation

Projection is a planning-layer snapshot of configured intent. Execution simulation is a runtime-layer model of actual operations.

Keeping them separate prevents UI/reporting helpers from becoming de facto execution engines and avoids accidental scope expansion into vehicle movement, dispatching, or dynamic rerouting.

### Why readiness is reused instead of duplicated

Readiness already owns structural and configuration diagnostics. Projection consumes that result to resolve active-band status and summaries.

This preserves single ownership of readiness rules and avoids diverging rule copies.

### Why active time-band frequency is the configured-service determinant

MVP service configuration is time-band based. For "service now" projection, the active band's configured frequency is the correct determinant, while retaining readiness checks as a guardrail.

### Why fallback-only lines are treated as `degraded`

Fallback-only routing can still support service planning continuity, but it is explicitly lower confidence than fully ready routing.

Marking fallback-only warning states as `degraded` keeps this distinction visible without escalating to `blocked`.

### Why departures/hour remains theoretical

`departuresPerHour` is useful for planning comparison and inspector summaries, but does not represent executed trips, realized reliability, or passenger throughput.

This avoids over-claiming execution outcomes before execution simulation exists.

## Explicit non-goals

- demand simulation
- economy simulation
- passenger simulation/assignment
- vehicle simulation
- service execution simulation
- rerouting logic
- import workflows
- persistence/storage
- backend/API/server integration
- savegame systems
- scenario systems
- fixture replay
- multimodal expansion
- mobile support

## Consequences

- UI can consume deterministic service-planning projections without embedding readiness rules.
- Readiness remains the single owner of readiness diagnostics.
- Projection remains planning-only and does not imply execution-simulation completeness.
