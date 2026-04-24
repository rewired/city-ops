# ADR 0090: Switch map bootstrap style to CARTO Dark Matter GL

## Status

Accepted (2026-04-24)

## Context

The map bootstrap baseline is currently centralized in `apps/web/src/map-workspace/mapBootstrapConfig.ts` and uses the CARTO Positron style.
For dark-UI readability and map contrast, we need a dark MapLibre-compatible default style that does not require API keys or secrets.

## Decision

1. Keep all bootstrap style ownership centralized in `MAP_WORKSPACE_BOOTSTRAP_CONFIG`.
2. Replace the Positron style URL with CARTO Dark Matter GL (`https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`).
3. Preserve existing map bootstrap attribution behavior and avoid any API-key/secret-dependent style providers.

## Consequences

- Startup map rendering uses a dark no-key basemap while preserving existing bootstrap boundaries.
- No style URL sprawl is introduced into map lifecycle or React component code.
- Existing attribution behavior continues to flow through the current MapLibre setup.

## Explicit non-goals

- no map interaction behavior changes
- no simulation/domain/economy/demand scope changes
- no transport-mode or mobile scope expansion
- no style-aware layer mutation hooks unless a concrete follow-up visual regression requires them
