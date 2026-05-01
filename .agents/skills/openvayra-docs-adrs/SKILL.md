---
name: openvayra-docs-adrs
description: Use this skill when adding or editing repository documentation, ADRs, README content, changelog entries, implementation notes, or canonical project governance files.
---

# OpenVayra Documentation & ADR Skill

Repository documentation is project truth. It must remain centralized, English-only, scoped, and aligned with the existing source-of-truth hierarchy.

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

- Editing root project docs.
- Adding ADRs.
- Updating README.
- Updating CHANGELOG.
- Writing implementation notes.
- Documenting architecture or product decisions.
- Adding agent guidance files.

## Language rule

All repository documentation must be English-only.

Do not add German Markdown content to the repository.

## Root documentation placement

The repository root may contain only approved project-wide documentation and tool-specific agent context files.

Canonical root docs:

- `README.md`
- `CHANGELOG.md`
- `AGENTS.md`
- `FOUNDATION.md`
- `PRODUCT_DEFINITION.md`
- `VISION_SCOPE.md`
- `DD.md`
- `TDD.md`
- `SEC.md`
- `DESIGN.md`

Agent support exception:

- `GEMINI.md` may exist at repository root as a tool-specific context bridge.
- `.agents/skills/**/SKILL.md` may exist as task-specific agent playbooks.

All other retained documentation belongs under `/docs`.

## README rule

Keep `README.md` concise and onboarding-oriented.

Do not turn it into a manual for every architecture, domain, design, or implementation detail.

## ADR rule

Use ADRs for durable decisions affecting:

- architecture boundaries
- domain truth
- scenario/data lifecycle
- simulation posture
- routing/data adapter contracts
- agent governance
- non-obvious tradeoffs

ADRs should include:

- status
- context
- decision
- consequences
- non-goals where useful

## Changelog rule

`CHANGELOG.md` is for meaningful project-facing change history.

Do not use it for scratch notes, planning fragments, or implementation diaries.

## Canonical conflict handling

If docs and code disagree, surface the conflict.

Do not silently rewrite canonical docs to match accidental implementation drift.

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

