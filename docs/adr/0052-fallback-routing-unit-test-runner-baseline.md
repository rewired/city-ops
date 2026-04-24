# ADR 0052: Fallback routing unit test runner baseline

## Status

Accepted

## Date

2026-04-24

## Context

The web package currently has strict TypeScript checks but no dedicated unit test runner.

Fallback line routing now provides deterministic, typed segment generation behavior that benefits from direct, isolated test coverage.

## Decision

- Add a lightweight Vitest runner to `apps/web` as the unit-test baseline.
- Add package scripts for:
  - `apps/web`: `test` (single run) and `test:watch` (watch mode)
  - repository root: `test:web` and `test` aggregation entrypoints
- Add focused tests for `buildFallbackLineRouteSegments` covering:
  - two-stop to one-segment generation
  - three-stop ordered multi-segment generation
  - deterministic ids and deterministic output order
  - aggregate distance/time compatibility
  - explicit `fallback-routed` status preservation
  - explicit failure contract for insufficient stop sequences

## Consequences

- Domain routing behavior is now verifiable via fast, deterministic unit tests.
- Test execution remains aligned with existing pnpm workspace tooling and does not add backend/service dependencies.

## Non-goals

- No routing algorithm redesign is introduced.
- No UI behavior or map rendering behavior is changed.
- No simulation, demand, or economy behavior is changed.
