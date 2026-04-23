/**
 * Marker anchor mode for stop markers.
 *
 * `center` keeps the visual center of the circular marker aligned with the geographic stop position.
 */
export const STOP_MARKER_ANCHOR = 'center';

/**
 * Pixel offset applied to stop markers after anchor resolution.
 *
 * Zero-offset preserves a direct visual-to-geographic center mapping for trustable stop selection.
 */
export const STOP_MARKER_OFFSET: readonly [number, number] = [0, 0];
