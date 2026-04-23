# ADR 0046: Strict-secondary street snap fallback gating

## Status

Accepted

## Date

2026-04-23

## Context

Street snap selection currently evaluates direct-hit and fallback candidates using shared deterministic ranking.

Even with deterministic ordering, fallback acceptance can still be overly permissive when fallback candidates are weak or ambiguous. This can place stops on uncertain street segments when direct-hit did not produce a candidate.

## Decision

Keep stop placement scope unchanged and tighten fallback acceptance rules while preserving direct-hit precedence:

- direct-hit remains primary and short-circuits final snap resolution when present
- fallback is evaluated only when direct-hit fails
- fallback acceptance now requires all of the following:
  - candidate pixel distance is within a dedicated fallback tolerance
  - candidate feature/layer match strength is within a dedicated maximum rank
  - if a second-best fallback candidate exists, the best candidate must lead by a minimum pixel-distance advantage; otherwise fallback is rejected as ambiguous
- new fallback thresholds are centralized in `mapWorkspacePlacementConstants.ts`

## Consequences

- Fallback behavior is more conservative and rejects uncertain near-tie scenarios.
- Direct-hit behavior remains unchanged and explicitly primary.
- Placement rejection behavior is preserved when confidence is insufficient.

## Non-goals

- No changes to street eligibility detection.
- No changes to snap geometry calculations or line-building behavior.
- No expansion into additional transport modes, routing realism, persistence, or mobile support.
