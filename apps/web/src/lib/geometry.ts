/**
 * Centralized generic geometry and coordinate math helpers.
 * These helpers are deterministic and pure, and must not depend on domain logic.
 */

const EARTH_RADIUS_METERS = 6_371_000;

/**
 * Converts decimal degrees to radians.
 */
export const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * Coordinate tuple representing [longitude, latitude] in WGS84 decimal degrees.
 */
export type GeometryCoordinate = readonly [number, number];

/**
 * Deterministically calculates the great-circle distance between two geographic coordinates
 * using the Haversine formula, returning the distance in meters.
 */
export const calculateGreatCircleDistanceMeters = (
  fromCoordinate: GeometryCoordinate,
  toCoordinate: GeometryCoordinate
): number => {
  const [fromLng, fromLat] = fromCoordinate;
  const [toLng, toLat] = toCoordinate;

  const latitudeDelta = toRadians(toLat - fromLat);
  const longitudeDelta = toRadians(toLng - fromLng);
  const fromLatitudeRadians = toRadians(fromLat);
  const toLatitudeRadians = toRadians(toLat);

  const haversineA =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitudeRadians) * Math.cos(toLatitudeRadians) * Math.sin(longitudeDelta / 2) ** 2;
  const centralAngle = 2 * Math.atan2(Math.sqrt(haversineA), Math.sqrt(1 - haversineA));

  return EARTH_RADIUS_METERS * centralAngle;
};
