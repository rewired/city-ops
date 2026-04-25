import type { RouteGeometryCoordinate } from '../types/lineRoute';

/**
 * Maps a single raw coordinate tuple into a canonical branded RouteGeometryCoordinate.
 * Ensures the order is explicitly preserved as [longitude, latitude].
 *
 * @param coordinate - The raw [longitude, latitude] tuple from a routing provider.
 * @returns A canonical RouteGeometryCoordinate.
 */
export const toLineRouteCoordinate = (
  coordinate: readonly [number, number]
): RouteGeometryCoordinate => [coordinate[0], coordinate[1]];

/**
 * Maps an array of raw coordinate tuples into a canonical array of branded RouteGeometryCoordinates.
 * Rebuilds the array to avoid unchecked casts and ensure type safety.
 *
 * @param coordinates - The raw coordinates from a routing provider.
 * @returns A canonical array of RouteGeometryCoordinates.
 */
export const toLineRouteGeometry = (
  coordinates: readonly (readonly [number, number])[]
): RouteGeometryCoordinate[] => coordinates.map(toLineRouteCoordinate);
