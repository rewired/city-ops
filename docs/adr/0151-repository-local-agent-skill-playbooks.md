# ADR 0151: Repository-Local Agent Skill Playbooks

## Status

Proposed

## Context

OpenVayra - Cities is expected to be implemented with heavy coding-agent assistance.

The project already has strong canonical governance documents, including product scope, technical rules, security/integrity rules, domain boundaries, and design-system handling. However, implementation prompts repeatedly need to restate the same operational guidance for TypeScript, UI information design, React projection boundaries, CSS organization, MapLibre handling, simulation discipline, data ingestion, testing, and no-drift checks.

Repeating all of that guidance in every prompt creates noise, increases drift risk, and makes it harder for coding agents to apply the right guidance at the right time.

## Decision

Add repository-local task-specific agent playbooks under:

```text
.agents/skills/<skill-name>/SKILL.md
```

The initial skill set covers:

- scope control
- TypeScript
- React projections
- UI information design
- HTML/CSS
- MapLibre/geospatial work
- simulation
- data ingestion
- testing
- documentation/ADRs
- security/integrity
- slice planning

Add `GEMINI.md` as a repository-root tool-specific context bridge that directs Gemini-style agents to read `AGENTS.md` and then only the relevant skill files.

Add `docs/agent-skills.md` as the maintained human-readable overview of the skill set.

## Consequences

Benefits:

- Agent prompts can stay smaller and more focused.
- Repeated project rules become easier to invoke consistently.
- Skills provide task-specific guardrails without replacing canonical docs.
- The project can support multiple agent tools with a shared playbook structure.

Costs:

- Skills require maintenance when canonical project rules evolve.
- Poorly scoped skills could become stale or contradictory if treated as source-of-truth documents.
- Agents may still need explicit prompting to read relevant skill files, especially tools without native skill support.

## Rules

Skills do not override canonical project documents.

The source-of-truth order remains defined by `AGENTS.md`.

If a skill conflicts with canonical documents or current code, the agent must surface the conflict instead of silently choosing one side.

## Non-goals

This decision does not:

- Add runtime application behavior.
- Add dependencies.
- Change product scope.
- Change TypeScript compiler configuration.
- Replace `AGENTS.md`.
- Replace `DESIGN.md`.
- Make all agent tools behave identically.
