# ADR 0132: OSM Stop Candidate Adoption

## Context

Previous slices introduced OSM stop candidates and grouped them into stop-facility candidates. We also implemented street-anchor resolution to find safe routing points for these candidates.
The player now needs a way to "adopt" these candidates into the canonical CityOps network as playable stops.

## Decision

We will allow players to select an OSM candidate group in "Inspect" mode.
When selected, the inspector will show details about the candidate group and its resolved street anchor.
If the street anchor is in the `ready` status and not too close to an existing stop (threshold: 15m), the player can "Adopt" the stop.

Adoption performs the following:
1. Converts the candidate group into a canonical CityOps `Stop`.
2. Uses the `streetAnchorPosition` as the stop's location (not the original OSM display position).
3. Adds the stop to the session's stop collection.
4. Tracks the adoption in a session-only set of `adoptedOsmCandidateGroupIds`.
5. Adopted candidates are filtered out of the map overlay to avoid visual duplicates with the new canonical stop.

## Consequences

- Players can quickly build out a network using existing real-world transit data.
- Adoption is limited to "safe" candidates (those with a resolved street anchor).
- Candidates that are "review" or "blocked" cannot be adopted until they are resolved (future work).
- Adoption is session-persistent but not yet part of any long-term save (as per MVP scope).
