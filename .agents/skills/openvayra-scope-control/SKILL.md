---
name: openvayra-scope-control
description: Use this skill when planning, reviewing, or implementing any OpenVayra - Cities change that may affect MVP scope, product boundaries, transport modes, platform assumptions, or realism depth.
---

# OpenVayra Scope Control Skill

OpenVayra - Cities is a desktop-only, browser-based transit network simulation game. The first playable phase is a bus-first MVP. This skill prevents scope creep, realism escalation, and accidental conversion into a full transport engineering suite.

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

- A task proposes or touches product scope.
- A feature could accidentally introduce tram, subway, S-Bahn, ferry, rail, mobile, multiplayer, backend, depot, staff, maintenance, or city-growth scope.
- A change adds realism to routing, demand, simulation, economy, or operations.
- A coding agent is preparing a plan before edits.
- A reviewer needs to determine whether a proposed change belongs in the bus-first MVP.

## Core scope posture

Allowed MVP direction:

- Stop placement on streets.
- Ordered bus line creation.
- Direction-aware lines.
- Round-line support.
- Time-band service frequency.
- Demand from residential origins and workplace destinations.
- Believable street-linked stop-to-stop travel times.
- Aggregate-first simulation.
- Economy and passenger satisfaction feedback.
- Desktop map-centric interaction.

Out of scope unless explicitly approved:

- Active tram, subway, S-Bahn, ferry, or rail gameplay.
- Player-built rail infrastructure.
- Mobile or touch-first UX.
- Full pedestrian network access as a mandatory MVP requirement.
- Microscopic traffic simulation.
- Depot logistics.
- Staff scheduling.
- Maintenance/depreciation depth.
- Multiplayer, accounts, cloud sync, or online service architecture.
- Real-world public transport timetable reconstruction.

## Planning rules

When planning work:

1. State the exact requested slice.
2. State what will not be touched.
3. Identify which canonical documents govern the change.
4. Reject adjacent feature additions unless the user explicitly requested them.
5. Prefer a smaller slice over a broad one.

## Realism rules

Increase realism only when it materially improves the playable planning loop.

Do not silently replace MVP truths with heavier systems:

- Radius-based access must not become full pedestrian routing unless requested.
- Aggregate service evaluation must not become vehicle duty scheduling unless requested.
- Believable travel time must not become micro traffic simulation unless requested.
- Economy feedback must not become detailed accounting unless requested.

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

