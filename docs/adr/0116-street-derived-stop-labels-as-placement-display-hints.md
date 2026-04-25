# ADR 0116: Street-Derived Stop Labels as Placement Display Hints

## Status

Accepted

## Context

Newly placed stops currently receive generic labels like "Stop 1", "Stop 2", etc.
During stop placement, we already snap the stop to the nearest street feature.
Many of these features carry street names in their properties (e.g., `name`, `name:de`).
Using these names as initial stop labels improves player orientation and follows real-world transit naming conventions.

## Decision

Newly placed stops on named streets will use the street name as their initial label.

1.  **Map-Derived Display Hints**: Street names are extracted from the snapped MapLibre feature properties. This is treated as a display hint, not authoritative geographic truth.
2.  **No External Geocoding**: We only use data already present in the rendered map features. No remote geocoding or additional data pipelines are introduced.
3.  **Deterministic Duplicate Handling**: If multiple stops are placed on the same named street, they receive a deterministic numeric suffix (e.g., "Street A", "Street A 1", "Street A 2").
4.  **Generic Fallback**: If no usable street name is found, we fall back to the existing deterministic generic labeling ("Stop N").
5.  **Preserve Stop IDs**: Canonical stop IDs remain deterministic (`stop-N`) and independent of the display label.
6.  **Import Preservation**: Labels are preserved during export/import and are not re-derived from map data.

## Consequences

- Players get more meaningful stop names automatically.
- Stop labeling remains deterministic and predictable.
- No network or external data dependencies are added.
- The distinction between display labels and geographic coordinates/IDs is preserved.
- The selected-stop inspector provides clear verification of derived labels.

## Update (Slice 062)

- **Nearby Label Lookup**: Added a fallback lookup that queries rendered features (e.g., symbol/text layers) in a 16px radius around the snap point if the snapped line feature lacks a name.
- **Inspector Visibility**: The selected-stop inspector now resolves the full `Stop` data from the session state to display the actual label, ID, and geographic position.
- **Placement Feedback**: The derived label is surfaced in the map debug snapshot immediately upon placement for diagnostic purposes.

## Non-Goals

- No manual stop rename UI (out of scope for this slice).
- No line naming redesign.
- No address interpolation or reverse geocoding.
- No changes to demand, economy, or passenger simulation logic.
