/**
 * Route-cache compatibility tolerance (degrees) used when comparing route geometry endpoints
 * to referenced stop positions.
 *
 * This is NOT a stop-position precision guarantee. It exists to accept realistic endpoint deltas
 * introduced by OSRM street snapping and routing, where the geometry start/end coordinate may
 * be snapped to the nearest road node rather than the exact placed stop position.
 *
 * A delta of ~0.000222 degrees longitude (~17m at Hamburg's latitude) has been observed in
 * the committed Hamburg v3 fixture. This tolerance is set to 5e-4 (~40m) to accommodate such
 * offsets while still rejecting obviously mismatched route geometry.
 */
export const SELECTED_LINE_EXPORT_ROUTE_CACHE_ENDPOINT_TOLERANCE_DEGREES = 5e-4;

/**
 * Absolute tolerance (minutes) used when validating route-segment travel-time arithmetic.
 */
export const SELECTED_LINE_EXPORT_TRAVEL_MINUTES_TOLERANCE = 1e-6;
