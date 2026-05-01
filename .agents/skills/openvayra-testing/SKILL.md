---
name: openvayra-testing
description: Use this skill when adding, updating, or reviewing tests, fixtures, typecheck/lint verification, regression coverage, parser tests, projection tests, or deterministic helper tests.
---

# OpenVayra Testing Skill

Tests should protect deterministic behavior, boundary contracts, type safety, and regression-prone UI/domain projections without encouraging broad brittle rewrites.

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

- Adding unit tests.
- Updating fixtures.
- Repairing test failures.
- Adding parser/validator coverage.
- Testing projection helpers or simulation helpers.
- Verifying typecheck/lint behavior.
- Reviewing whether a slice is safely covered.

## Preferred test targets

Prefer tests for:

- Pure domain helpers.
- Parser/validator boundaries.
- GeoJSON builders.
- Projection helpers.
- Simulation clock and time-band helpers.
- Deterministic sorting and id generation.
- Readiness/status derivation.
- UI components where behavior or accessibility is meaningful.

Avoid tests that depend on:

- Hidden timing.
- Network calls.
- Uncontrolled browser APIs.
- MapLibre internals when pure builders can be tested instead.
- Overly broad snapshots.

## Type safety in tests

Test code must not use:

- `any`
- `as any`
- broad unchecked casts
- weak fixtures that bypass public contracts

Use:

- canonical creators
- typed fixture builders
- `unknown` plus guards when testing parsers
- `structuredClone` for fixture mutation tests
- explicit result narrowing

## Regression coverage

When fixing a bug, add coverage that would fail on the previous behavior.

Examples:

- invalid import rejection
- time-band boundary wrapping
- layer visibility mapping
- demand/projection counting
- route segment cardinality
- selected-line export validation
- parser diagnostics

## Verification

For meaningful code changes, prefer running or instructing the agent to run the relevant checks:

- package tests for touched area
- typecheck
- lint where available
- root verification script where project already provides it

Do not invent new toolchain commands if existing scripts cover the task.

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

