---
name: openvayra-security-integrity
description: Use this skill when modifying input validation, dependency choices, local asset handling, external data ingestion, save/import flows, deterministic behavior, secret handling, or service/runtime integration.
---

# OpenVayra Security & Integrity Skill

This project is not an enterprise backend, but careless dependencies, unchecked imports, hidden services, and nondeterministic simulation behavior can still damage the game and the repo.

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

- Adding or changing dependencies.
- Parsing imports, saves, scenario files, generated artifacts, or external data.
- Handling OSM/map/routing artifacts.
- Introducing local services, Docker workflows, APIs, or tooling.
- Touching deterministic simulation behavior.
- Reviewing whether a shortcut weakens project integrity.

## Dependency discipline

Do not add dependencies unless there is explicit need and clear value.

Avoid:

- large frameworks for narrow problems
- hosted service dependencies for core gameplay
- transit/planning frameworks that distort MVP architecture
- runtime dependencies when a small pure helper is sufficient

If a dependency is added, document why it is necessary and why existing tools are insufficient.

## External services

Core gameplay should not depend on uncontrolled third-party online services.

Allowed:

- optional preprocessing tools
- local Docker routing support
- replaceable adapters
- generated local assets

Avoid:

- hosted APIs as authoritative gameplay truth
- secret-dependent core functionality
- online-only runtime assumptions

## Input validation

All non-trivial external inputs must be validated before entering canonical domain state.

Validate:

- scenario/config JSON
- generated artifacts
- OSM/map-derived data
- routing adapter results
- save/import files
- user-authored definitions crossing persistence boundaries

## Secrets

Do not commit:

- API keys
- tokens
- credentials
- private config
- environment secrets

If secrets become necessary, use environment handling outside repository history.

## Deterministic behavior

Preserve deterministic simulation behavior for the same inputs wherever practical.

Reject shortcuts that introduce hidden nondeterminism into core simulation rules.

## Licensing and attribution

OSM and map-derived data require licensing and attribution awareness.

Do not assume redistribution rights.
Preserve a path to compliant attribution and source tracking.

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

