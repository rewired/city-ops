---
name: openvayra-html-css
description: Use this skill when modifying HTML structure, CSS architecture, semantic markup, layout, accessibility states, CSS tokens, feature styles, or visual implementation details.
---

# OpenVayra HTML/CSS Skill

This skill keeps the web app's markup and styling maintainable, semantic, accessible, and aligned with the existing CSS architecture.

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

- Editing component markup.
- Adding or refactoring CSS.
- Creating layout, panel, dialog, toolbar, table, card, or map overlay styles.
- Working with focus, hover, disabled, warning, error, or loading states.
- Applying values from `DESIGN.md`.

## CSS architecture

Required:

- Keep `apps/web/src/App.css` as the ordered import entrypoint unless explicitly instructed otherwise.
- Add feature styles under `apps/web/src/styles/`.
- Organize CSS by UI concern or feature area.
- Preserve cascade order during refactors.
- Put shared custom properties in foundational/global styles.
- Reuse existing tokens/custom properties where available.

Forbidden:

- Do not rebuild a monolithic `App.css`.
- Do not dump unrelated selectors into existing large files.
- Do not introduce CSS Modules, preprocessors, runtime theme frameworks, Tailwind, or other styling dependencies unless explicitly approved.
- Do not add mobile/touch-first behavior for this desktop-only project.
- Do not rename selectors during CSS-only organization unless the task explicitly authorizes it.

## Markup rules

Prefer semantic HTML:

- Use `<button>` for actions.
- Use `<a>` only for navigation or links.
- Use `<table>` for true tabular comparison.
- Use headings in a logical hierarchy.
- Use `<fieldset>`/`<legend>` where form grouping is meaningful.
- Use native `<details>`/`<summary>` where a simple disclosure is sufficient.

## Accessibility states

Interactive controls need:

- Visible focus.
- Accessible names.
- Correct disabled semantics.
- `aria-pressed` for toggle buttons where appropriate.
- `aria-expanded` for disclosure/flyout controls where appropriate.
- Labels for inputs.

Do not rely on color alone for critical status.

## Design-system handling

`DESIGN.md` is externally owned. Apply it as provided.

Do not:

- Invent missing design authority.
- Replace the visual system with a new one.
- Let temporary styling reshape domain or architecture.
- Add colors, type systems, or token families that conflict with existing `DESIGN.md` direction without explicit approval.

## Desktop layout posture

Dense desktop information layouts are acceptable.

Prefer:

- Stable widths for clock/control surfaces.
- Bounded scroll areas for long lists.
- Contained modal surfaces for heavy details.
- Map-first layouts that do not steal core interaction space.

Avoid:

- Mobile breakpoints as a primary design driver.
- Touch target inflation that harms desktop density.
- Layouts that jitter when numbers or labels change.

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

