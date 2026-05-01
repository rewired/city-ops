# OpenVayra - Cities Gemini Context

Read `AGENTS.md` first.

This repository also contains task-specific agent playbooks under `.agents/skills/`.

Before making changes:

1. Inspect the current repository state.
2. Identify the task type.
3. Read only the relevant `.agents/skills/*/SKILL.md` files.
4. State a written plan before edits for any non-trivial change.
5. Keep the change inside the requested slice.

Do not import all skill files by default. Use only the skills relevant to the current task.

Core rules:

- Repository code and documentation must be English-only.
- Preserve strict TypeScript.
- Do not use `any`, `as any`, or broad unchecked casts.
- Preserve centralized constants.
- Preserve clean domain, simulation, routing, map, economy, and UI boundaries.
- Desktop-only.
- Bus-first MVP.
- Do not introduce tram, subway, S-Bahn, ferry, rail, mobile, multiplayer, backend, depot, staff, or maintenance scope unless explicitly requested.
- Do not turn OpenVayra - Cities into a real-world transit reconstruction tool.
- `DESIGN.md` is externally owned; apply it as provided and do not invent replacement design authority.
