---
name: openvayra-typescript
description: Use this skill when modifying TypeScript types, public contracts, branded IDs, constants, validators, domain helpers, simulation inputs/outputs, routing results, UI projections, or exported module surfaces.
---

# OpenVayra TypeScript Skill

This project treats type safety as product integrity. Strong types are not decorative; they protect domain truth, simulation behavior, imported data, and agent reliability.

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

- Adding or changing TypeScript source files.
- Touching domain IDs, time bands, directions, stops, lines, demand classes, simulation statuses, routing results, economy metrics, or UI projection contracts.
- Adding public exports.
- Writing parsers, validators, factories, or canonical helpers.
- Repairing typecheck failures.

## Hard rules

Do not introduce:

- `any`
- `as any`
- Broad unchecked casts to silence type errors.
- Weak public contracts just to satisfy implementation shortcuts.
- Duplicate informal string unions for canonical concepts.
- Magic strings or numbers for domain/simulation truth.

Prefer:

- Narrow unions derived from canonical constant tuples.
- Branded IDs for important identifiers.
- Explicit return types at public boundaries.
- Discriminated unions for result states.
- Runtime narrowing from `unknown` at external boundaries.
- Immutable input contracts where practical.
- Pure helper functions for calculations and transformations.

## Export documentation

Every exported symbol must have concise inline documentation.

Document:

- What it represents or does.
- Key input assumptions.
- Output meaning.
- Important invariants or constraints.

Do not write essay-comments. Do not leave public exports undocumented.

## Constants

If a value affects domain meaning, simulation behavior, routing behavior, economy, thresholds, or canonical UI projections, place it in the appropriate canonical constants/config module.

Do not hide defaults inside React components.

## Public boundary checklist

For every touched public boundary, check:

- Are IDs typed canonically?
- Are time bands using canonical definitions?
- Are status strings derived from canonical unions?
- Are parser inputs accepted as `unknown` and narrowed safely?
- Are invalid states rejected rather than normalized silently?
- Are exports documented?

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

