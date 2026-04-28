# ADR 0140: Scenario-Bound Demand Overlay Skeleton

## Status

Accepted

## Date

2026-04-28

## Context

Previously, demand nodes used by the transit simulation were hardcoded in memory (`mvpDemandScenario.ts`). To support multiple playable zones and realistic spatial patterns, demand datasets must be scenario-bound, dynamically loaded, and strictly typed.

## Decision

- Replace hardcoded demand constants with dynamic client-side loading from scenario JSON assets (`/generated/scenarios/{id}.demand.json`).
- Enforce strict, narrow type safety over untrusted demand payloads via small local type guards (`isRecord`, `isDemandNodeRole`, `isDemandClass`) instead of broad type casts.
- Standardize access-radius demand scoring loops to iterate strictly over canonical `MVP_TIME_BAND_IDS` instead of arbitrary object keys.
- Introduce parser-oriented test suites to protect spatial geometries and role bindings.

## Consequences

- Clean, declarative data decoupling allowing zero rebuild overhead on scenario swaps.
- Hardened boundaries against data corruption, preventing silent runtime exceptions.
- Fully compliant documentation and test standards mapping to the Slice 131 boundaries.
