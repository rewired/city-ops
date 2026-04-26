# ADR 0118: Vehicle Projection Continuity and Smooth Movement

## Context

Projected vehicle markers currently update at minute-level intervals using integer `SimulationMinuteOfDay` ticks. This causes "teleporting" behavior where markers jump from one position to another every simulation minute, which feels unpolished and makes tracking movement difficult at higher simulation speeds.

Furthermore, vehicle projection IDs currently include the active `TimeBandId`. When the simulation crosses a time-band boundary (e.g., 08:59 to 09:00), the IDs change even if the vehicle slot index remains the same. This causes MapLibre to destroy and recreate the marker features, resulting in a visible flicker or disappearance/reappearance of vehicles.

## Decision

1.  **Continuous Projection Time**:
    - Introduce `SimulationSecondOfDay` branded type to support fractional seconds.
    - Implement `deriveSimulationSecondOfDay` to compute high-precision time from simulation clock state, including carryover milliseconds.
    - Pass this continuous time into the vehicle projection logic to enable smooth coordinate interpolation.

2.  **Smooth Simulation Clock**:
    - Refactor the simulation clock controller to use `requestAnimationFrame` instead of `window.setInterval` for state updates.
    - This ensures that re-renders and re-projections occur at the display's native refresh rate, resulting in fluid marker movement.

3.  **Stable Vehicle Identity**:
    - Change projected vehicle IDs from `<lineId>:<timeBandId>:bus-<index>` to `<lineId>:vehicle-<index>`.
    - By removing the time-band dependency, vehicle markers with overlapping slot indexes maintain their identity across time-band transitions.
    - This prevents feature churn and flicker at time-band boundaries.

4.  **Preserve Determinism**:
    - Vehicles remain purely derived visual projections from the departure schedule and route segments.
    - No authoritative vehicle fleet or lifecycle state is introduced to the simulation session.

## Consequences

- Vehicle markers move smoothly along their routes at all simulation speeds.
- Marker identity is stable across time-band transitions, eliminating flicker.
- Higher CPU usage due to more frequent re-renders during active simulation, though mitigated by MapLibre's efficient GeoJSON source updates.
- Unit tests are hardened to verify smooth movement and stable identity while removing legacy `as any` technical debt.
