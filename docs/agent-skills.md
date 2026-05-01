# Agent Skills

## Purpose

This document explains the repository-local agent skill/playbook structure for OpenVayra - Cities.

The goal is to keep recurring agent guidance focused, task-specific, and easy to invoke without expanding every implementation prompt into a full project manual.

## Location

Task-specific skills live under:

```text
.agents/skills/<skill-name>/SKILL.md
```

Each skill is intentionally narrow and should describe when to use it, what rules apply, and which no-drift checks must be completed.

## Relationship to canonical docs

Skills do not replace canonical project documents.

The source-of-truth order remains:

1. `PRODUCT_DEFINITION.md`
2. `FOUNDATION.md`
3. `VISION_SCOPE.md`
4. `DD.md`
5. `TDD.md`
6. `SEC.md`
7. `DESIGN.md`
8. Current repository code

If a skill conflicts with canonical documentation or current code, agents must surface the conflict instead of silently choosing one side.

## Initial skill set

| Skill | Use |
| --- | --- |
| `openvayra-scope-control` | Product scope, MVP boundaries, realism depth, and no-abyss prevention. |
| `openvayra-typescript` | TypeScript contracts, branded IDs, constants, validators, and exported surfaces. |
| `openvayra-react-projections` | React/UI projection boundaries and component state discipline. |
| `openvayra-ui-information-design` | Player-facing data presentation, dense UI, KPIs, dialogs, warnings, and interaction clarity. |
| `openvayra-html-css` | Semantic markup, CSS architecture, accessibility states, layout, and design-system application. |
| `openvayra-maplibre-geospatial` | MapLibre, GeoJSON builders, layer registry, map interaction, OSM candidates, and street anchors. |
| `openvayra-simulation` | Tick progression, time bands, aggregate-first simulation, vehicle projection, and KPIs. |
| `openvayra-data-ingestion` | Scenario source material, generated artifacts, CSV/GeoJSON/OSM parsing, saves, imports, and validation. |
| `openvayra-testing` | Unit tests, parser tests, deterministic projection tests, fixtures, and verification hygiene. |
| `openvayra-docs-adrs` | Repository documentation, ADRs, README, changelog, and documentation placement. |
| `openvayra-security-integrity` | Dependency discipline, input validation, deterministic behavior, secrets, data licensing, and service boundaries. |
| `openvayra-slice-planning` | Implementation prompts, plan-first work, acceptance criteria, and no-drift checks. |

## Gemini bridge

`GEMINI.md` exists as a tool-specific context bridge. It points Gemini-style agents to `AGENTS.md` and the relevant skill files without importing every skill into the default context.

## Maintenance rules

When adding or changing skills:

- Keep each skill focused on one recurring task type.
- Keep instructions imperative and operational.
- Do not duplicate entire canonical documents.
- Do not encode temporary implementation details as permanent rules.
- Update this document if the skill set changes materially.
