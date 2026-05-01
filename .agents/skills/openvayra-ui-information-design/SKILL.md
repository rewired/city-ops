---
name: openvayra-ui-information-design
description: Use this skill when designing or refactoring player-facing data displays, inspectors, dialogs, tables, KPIs, empty states, warnings, interaction flows, or dense desktop information layouts.
---

# OpenVayra UI Information Design Skill

This skill governs how complex simulation and planning data is shown to the player. It is not a color/style skill. `DESIGN.md` governs visual styling; this skill governs information hierarchy, interaction clarity, and usable data presentation.

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

- Adding or changing inspector content.
- Adding KPI summaries, metric cards, tables, chips, warnings, blockers, or diagnostics.
- Designing empty/loading/error states.
- Creating dialogs for service plans, departures, readiness, demand, routing, or simulation details.
- Moving raw debug information behind contained surfaces.
- Deciding what should be shown by default versus behind disclosure.

## Core principle

Show the player the next useful decision first.

The player should be able to answer:

- What is the current state?
- Is it good, bad, blocked, or incomplete?
- Why?
- What can I do next?
- Where can I inspect details if needed?

## Summary-first hierarchy

Prefer this order:

1. Primary status or outcome.
2. One or two decisive numbers.
3. Actionable blockers/warnings.
4. Supporting metrics.
5. Detailed diagnostics.
6. Raw technical detail only in debug surfaces.

Do not put raw diagnostic tables above player-facing outcomes.

## Avoid KPI soup

OpenVayra evaluates multiple axes: finance, satisfaction, demand served, waiting time, travel quality, overcrowding, unserved demand, and coverage.

Do not collapse the game into one metric.
Do not display every metric with equal visual weight.
Group metrics by decision purpose:

- Build/coverage decision.
- Service frequency decision.
- Passenger experience decision.
- Economic viability decision.
- Technical/routing/debug decision.

## Progressive disclosure

Use compact summaries by default.

Move heavy detail into:

- tabs
- dialogs
- accordions/details
- debug modal
- bounded tables

Do not make the inspector a landfill. The inspector is a cockpit, not a municipal archive basement.

## Empty, loading, warning, and error states

Every meaningful UI surface should have truthful states:

- Empty: what is missing and what to do next.
- Loading: what is being processed.
- Warning: what is degraded but usable.
- Error/blocker: what prevents the flow from working.
- Success: what was completed.

Avoid vague text like "Something went wrong" when a concrete boundary failure exists.

## Tables and dense layouts

Desktop density is allowed.

Use tables when comparison matters.
Use cards/chips when status scanning matters.
Use right-aligned numeric values where it improves scanning.
Use plain text when the value is explanatory, not numeric.

Avoid wide horizontal overflow unless the interaction explicitly needs a matrix, such as a timetable.

## Interaction design

Actions should be placed near the information they affect.

For editing workflows:

- Make the current value visible.
- Make the edit action explicit.
- Support cancel.
- Avoid implicit commit on accidental blur unless already established by component behavior.
- Show validation locally and clearly.

## Debug containment

Player-facing UI should not expose raw ids, issue codes, generated geometry counts, parser internals, or long JSON-like data by default.

Technical data belongs in debug modal/panel surfaces.

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

