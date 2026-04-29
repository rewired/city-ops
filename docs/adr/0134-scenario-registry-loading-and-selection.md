# 0134: Scenario Registry Loading and Selection

## Status
Proposed

## Context
Previously, OpenVayra - Cities silently defaulted all routing interactions directly onto hardcoded workspace topologies. To scale across diverse playable bounds, the interface requires selection boundaries derived dynamically. 

## Decision
1. The client fetches structured assets strictly from generated manifest pathways (`/generated/scenarios/scenario-registry.json`), ensuring sandbox definitions do not break decoupling boundaries.
2. Selection is maintained entirely as lightweight shell states, gating interactive components until validation completes.
3. Missing files indicate degraded state levels visibly to prevent downstream application crashes.

## Consequences
Gameplay setups require initial configuration updates.

### Out of Scope
- Automatic conversion pathways.
