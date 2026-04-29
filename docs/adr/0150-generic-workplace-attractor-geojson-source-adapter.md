# ADR 0150: Generic Workplace Attractor GeoJSON Source Adapter

## Status
Accepted

## Context
We need to ingest workplace destination/attraction data to build balanced scenario demand models for the transport MVP. In line with the project posture that external datasets serve solely as scenario source material, while runtime truth lives exclusively in generated scenario artifacts, we are establishing an adapter mechanism for pre-processed local GeoJSON files representing workplace distribution points.

## Decision
We have introduced a generic, scenario-agnostic GeoJSON workplace attractor source adapter.

Key constraints:
1. **Source Material Posture**: Raw GeoJSON payloads are used strictly as source material for the scenario generator and never parsed directly at runtime by the UI or simulation layer.
2. **Geometry Simplification**: Supports `Point`, `Polygon`, and `MultiPolygon` features. For non-point geometries, simple deterministic bounding-box centroids are generated.
3. **Scenario Agnostic**: This is not an area-specific or OSM-dependent extractor. Custom attribute mappings (`idProperty`, `weightProperty`, etc.) can be fed in dynamically via manifest overrides.
4. **Scope Limits**: Does not implement complex flow assignments, commuter matrix aggregators, or heatmaps. 

## Consequences
Scenarios can supply distinct workplace metrics independently. The generated payload maps attractors seamlessly without runtime bloat.
