---
name: openvayra-slice-planning
description: Use this skill when writing implementation prompts, preparing coding-agent tasks, splitting work into slices, defining acceptance criteria, or reviewing whether a proposed implementation plan is too broad.
---

# OpenVayra Slice Planning Skill

This skill turns OpenVayra work into small, coherent implementation slices with explicit boundaries, hard acceptance criteria, and no-drift checks.

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

- Creating a coding-agent prompt.
- Splitting a feature into slices.
- Reviewing a plan before code edits.
- Defining acceptance criteria.
- Preventing broad "just implement it all" patches.

## Slice shape

A good slice has:

- A single clear objective.
- Relevant documents to read first.
- Mandatory plan-first step.
- Exact files/areas likely to be touched, when known.
- Hard acceptance criteria.
- Explicit non-goals.
- No-drift checks.
- Verification commands where known.

A bad slice says:

- "make it realistic"
- "implement the whole simulation"
- "clean everything up"
- "add all future modes"
- "redesign the app"
- "just fix the UI"

## Mandatory prompt structure

Implementation prompts should include:

1. Project continuation context.
2. Relevant docs to read first.
3. Current observed issue or desired outcome.
4. Scope.
5. Required plan-first instruction.
6. Implementation constraints.
7. Acceptance criteria.
8. No-drift checks.
9. Suggested verification.

## Acceptance criteria

Acceptance criteria should be testable.

Cover:

- behavior
- type safety
- boundaries
- UI state if relevant
- tests or verification
- documentation if relevant
- explicit non-goals

## No-drift criteria

Every slice should explicitly guard against:

- multimodal expansion
- mobile support
- simulation/routing/domain logic moving into React
- `any`/`as any`
- duplicate constants
- undocumented exports
- design-system invention
- fake KPIs
- excessive realism escalation

## Size control

Prefer multiple smaller slices over one broad patch.

If a slice touches many layers, define the exact boundary chain and what must not change.

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

