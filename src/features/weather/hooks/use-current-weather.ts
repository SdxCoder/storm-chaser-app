import { useQuery } from '@tanstack/react-query';

import { type DeviceCoordinates } from '../../../services/location/current-location';
import { fetchCurrentWeather } from '../api/open-meteo-client';

const COORDINATE_PRECISION = 3;

export function roundWeatherCoordinate(coordinate: number): number {
  return Number(coordinate.toFixed(COORDINATE_PRECISION));
}

export function currentWeatherQueryKey(coordinates: DeviceCoordinates | null) {
  return [
    'current-weather',
    coordinates === null ? null : roundWeatherCoordinate(coordinates.latitude),
    coordinates === null ? null : roundWeatherCoordinate(coordinates.longitude),
  ] as const;
}

export function useCurrentWeather(coordinates: DeviceCoordinates | null) {
  const roundedCoordinates =
    coordinates === null
      ? null
      : {
          latitude: roundWeatherCoordinate(coordinates.latitude),
          longitude: roundWeatherCoordinate(coordinates.longitude),
        };

  return useQuery({
    queryKey: currentWeatherQueryKey(coordinates),
    queryFn: () => {
      if (roundedCoordinates === null) {
        return null;
      }
      return fetchCurrentWeather(roundedCoordinates.latitude, roundedCoordinates.longitude);
    },
    enabled: roundedCoordinates !== null,
    retry: 1,
    staleTime: 60_000,
  });
}
