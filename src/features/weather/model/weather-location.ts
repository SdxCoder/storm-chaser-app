const COORDINATE_PRECISION = 3;

export type WeatherCoordinates = {
  latitude: number;
  longitude: number;
};

export function roundWeatherCoordinate(coordinate: number): number {
  return Number(coordinate.toFixed(COORDINATE_PRECISION));
}

export function normalizeWeatherCoordinates(
  coordinates: WeatherCoordinates,
): WeatherCoordinates {
  return {
    latitude: roundWeatherCoordinate(coordinates.latitude),
    longitude: roundWeatherCoordinate(coordinates.longitude),
  };
}

export function weatherLocationKey(coordinates: WeatherCoordinates): string {
  const normalized = normalizeWeatherCoordinates(coordinates);
  return `${normalized.latitude.toFixed(COORDINATE_PRECISION)},${normalized.longitude.toFixed(COORDINATE_PRECISION)}`;
}

export function currentWeatherQueryKey(coordinates: WeatherCoordinates | null) {
  const normalized = coordinates === null ? null : normalizeWeatherCoordinates(coordinates);
  return [
    'current-weather',
    normalized?.latitude ?? null,
    normalized?.longitude ?? null,
  ] as const;
}

export function forecastQueryKey(coordinates: WeatherCoordinates | null) {
  const normalized = coordinates === null ? null : normalizeWeatherCoordinates(coordinates);
  return [
    'weather-forecast',
    normalized?.latitude ?? null,
    normalized?.longitude ?? null,
  ] as const;
}
