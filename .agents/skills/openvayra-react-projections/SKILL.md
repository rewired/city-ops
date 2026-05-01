---
name: openvayra-react-projections
description: Use this skill when modifying React components, hooks, shell state, inspector panels, dialogs, UI projections, or component-to-domain boundaries.
---

# OpenVayra React Projection Skill

React is the interaction and presentation layer. It must consume domain truth and projections; it must not become the owner of simulation, routing, economy, or canonical domain semantics.

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

- Editing React components or hooks.
- Wiring inspector, map shell, top bar, dialogs, modals, toasts, or layer controls.
- Passing domain data into UI.
- Adding UI-only state.
- Moving logic between components and domain/projection helpers.

## Allowed React responsibilities

React may own:

- UI composition.
- Editing workflow state.
- Panel/dialog/modal visibility.
- Map tool state.
- Selection state.
- Toast and user feedback state.
- Presentation of existing projections.
- User command wiring.

React must not own:

- Simulation rules.
- Routing calculations.
- Demand generation or demand truth.
- Economy logic.
- Canonical constants or domain defaults.
- Data validation for external boundaries beyond UI affordance checks.
- Map-derived truth that belongs in domain/routing adapters.

## Projection pattern

Prefer this flow:

1. Domain/simulation/routing/economy modules produce typed truth or typed projection results.
2. React receives immutable values and callbacks.
3. Components render summary-first UI.
4. User actions dispatch explicit commands/callbacks.
5. Domain-changing logic remains outside component rendering code.

## UI state vs domain state

Use UI-local state only for:

- Open/closed panels.
- Active tab.
- Dialog draft input.
- Hover/selection affordances.
- Temporary editing text.
- Layer visibility toggles.

Do not use UI-local state for canonical network, demand, service, routing, or simulation truth.

## Layout safety

Do not render raw long text directly into app chrome/header/layout containers.

Use contained surfaces:

- toast
- modal/dialog
- inspector/debug panel
- bounded inline component

If unsure, use a toast or modal instead of allowing text to escape the layout.

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

