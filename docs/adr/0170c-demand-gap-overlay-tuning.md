# ADR 0170c: Demand Gap Overlay Visual Tuning and Legend

## Status

Proposed

## Context

The initial implementation of the demand gap map overlay (Slice 170) was found to be too subtle and difficult to interpret. The heatmap was faint due to sparse output (capped at 5 items per category), and the individual gap points lacked clear categorization context on the map.

## Decision

We will perform a visual tuning pass on the demand gap overlay and add a map-native legend:

1.  **Heatmap Tuning**:
    *   Increase `heatmap-intensity` range from `1..3` to `2..6` to make small clusters more prominent.
    *   Increase `heatmap-radius` range from `15..30` to `25..50` to bridge the gap between sparse points.
    *   Increase `heatmap-opacity` to `0.85` for better contrast over the dark basemap.
    *   Vibrant color ramp for better legibility.
2.  **Point Detail (Circle Layer)**:
    *   Fade in circle markers earlier (starting at zoom 11 instead of 13).
    *   Increase `circle-radius` from 4 to 5 pixels.
3.  **Visual Weight Normalization**:
    *   Introduce a `visualWeight` property in the GeoJSON features.
    *   `visualWeight` is calculated by clamping `activeWeight` to `[1, 20]`. This ensures that even low-weight demand nodes contribute enough "pressure" to the heatmap to be visible.
4.  **Map Legend**:
    *   Add a compact, absolute-positioned `DemandGapLegend` component.
    *   The legend explains the color coding for the three gap types (Uncaptured, Unserved, Unreachable Workplace).
    *   The legend only appears when the demand gap overlay is enabled.

## Consequences

- Improved spatial awareness of network gaps for the player.
- The overlay is now visible and useful even with the current low feature cap.
- Architectural integrity is preserved: the overlay remains projection-only and does not affect simulation math.
- Centralized constants continue to manage all map paint values.
