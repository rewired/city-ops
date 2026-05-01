---
name: openvayra-simulation
description: Use this skill when modifying simulation clock, tick progression, time bands, service evaluation, demand realization, passenger assignment, vehicle projection, KPI generation, economy effects, or deterministic simulation helpers.
---

# OpenVayra Simulation Skill

The MVP simulation is aggregate-first, deterministic where practical, and built to support a playable planning loop rather than microscopic operations realism.

## Source of truth

Before applying this skill, respect the repository source-of-truth order from `AGENTS.md`.

This skill never overrides:
1. `PRODUCT_DEFINITION.md`
2. `FOUNDATION.md`
3. `VISION_SCOPE.md`
4. `DD.md`
5. `TDD.md`
6. `SEC.md`
7. `DESIGN.md` as externally provided
8. current repository code

If this skill appears to conflict with canonical documents or current code, surface the conflict instead of silently choosing a side.


## Use this skill when

- Editing simulation clock or speed controls.
- Changing time-band resolution.
- Evaluating service availability.
- Projecting vehicles.
- Computing demand served, wait quality, travel quality, satisfaction, cost, revenue, or network KPIs.
- Adding simulation helper functions or test fixtures.

## Simulation posture

Allowed MVP posture:

- Tick-based time progression.
- Pause and speed controls.
- Time-band-aware service configuration.
- Demand-node-driven trip generation.
- Aggregate or semi-aggregate passenger/service evaluation.
- Derived visible bus motion as player feedback.
- KPI generation from canonical domain/simulation inputs.

Avoid:

- Full microscopic traffic simulation.
- Full vehicle duty scheduling.
- Depot operations.
- Staff scheduling.
- Real-time physics.
- Hidden nondeterminism.
- Simulation rules embedded in React components.

## Determinism

For the same inputs, simulation behavior should be deterministic wherever practical.

Prefer:

- Explicit tick deltas.
- Explicit time-band transitions.
- Stable sorting.
- Seeded randomness only when intentionally designed and documented.
- Pure functions for calculations.
- Immutable inputs.

Avoid:

- `Date.now()` inside core simulation helpers.
- Randomness without seed/control.
- Hidden mutable module state.
- Floating side effects inside projection helpers.

## Time bands

Use canonical time-band definitions.

Do not create local time-band ids, labels, windows, or fallback arrays.

Handle midnight wrapping explicitly.

## Visible buses

Visible buses are player feedback and may be derived from aggregate service state.

Do not force full vehicle operations truth into the simulation solely because markers are displayed on the map.

## KPI rules

Network quality must not collapse into a single metric.

Preserve multiple evaluation axes:

- financial performance
- passenger satisfaction
- demand served
- waiting time
- travel quality
- overcrowding
- unserved demand
- service coverage

## Required no-drift checks

Before completing work, verify:

- The change stayed within the requested slice.
- Repository artifacts remain English-only.
- Desktop-only scope was preserved.
- Bus-first MVP scope was preserved.
- No `any`, `as any`, or broad unchecked casts were introduced.
- Domain/simulation constants were not duplicated in UI or feature-local code.
- Public exports introduced or touched by the change include concise inline documentation.
- UI did not become the owner of domain, routing, economy, or simulation truth.

