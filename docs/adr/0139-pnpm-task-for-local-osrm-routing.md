# ADR 0139: Reliable pnpm task for local OSRM routing service

## Status

Accepted

## Date

2026-04-28

## Context

The local Dockerized OSRM routing container was previously started via a PowerShell script (`scripts/routing/start-osrm.ps1`), which was brittle, Windows-specific, and did not verify service readiness. We need a cross-platform, developer-friendly workflow that starts OSRM reliably and provides actionable diagnostics.

## Decision

- Introduce a Node.js orchestration script (`scripts/routing/start-osrm.mjs`) to manage OSRM startup.
- Add root-level pnpm tasks (`routing:start`, `routing:start:hamburg`, etc.) to expose the workflow.
- Update `docker-compose.yml` to use a robust fallback path and fail loudly instead of flapping on failure.
- Implement bounded readiness checking against the OSRM HTTP endpoint before claiming success.

## Consequences

- Developers can start routing via standard `pnpm routing:start:hamburg`.
- Startup fails clearly if data assets are missing or Docker is down.
- Readiness checks prevent race conditions where tests run before OSRM is fully loaded.
