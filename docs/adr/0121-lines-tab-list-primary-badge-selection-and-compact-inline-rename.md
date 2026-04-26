# ADR 0121: Lines-Tab List Primary Badge Selection and Compact Inline Rename

- Status: Accepted
- Date: 2026-04-26

## Context

The completed-lines list in the Inspector Lines tab used a generic "View" action button and combined line id plus label text as plain row copy.

Slice 073 requires:

- a compact, explicit primary selection target,
- readable non-primary label text,
- row-level inline rename without accidental selection side effects.

The existing rename command path and normalization behavior (`normalizeAcceptedLineLabel`) already exist in session logic and must remain canonical.

## Decision

Update Lines tab list rows to:

- use a compact line-id badge button as the only primary row select/focus control,
- render line label as non-primary readable text,
- embed `InlineRenameField` in each row for direct rename access.

To keep row density and avoid duplicated label rendering, extend `InlineRenameField` with an idle display mode that can render an edit trigger without repeating value text (`edit-only`).

Selection and rename interaction boundaries are preserved by keeping selection only on the badge button and using existing inline rename event propagation controls.

## Consequences

- Selection intent is visually clear and easier to target.
- Label readability improves without turning text itself into the main action affordance.
- Rename behavior stays on existing callback and normalization paths with no new domain/session mutation routes.
- No simulation logic, transport scope, or persistence behavior changes are introduced.
