import { useQuery } from '@tanstack/react-query';

import { useOnlineStatus } from '../../../services/connectivity/use-online-status';
import { type DeviceCoordinates } from '../../../services/location/current-location';
import { fetchWeatherForecast } from '../api/open-meteo-forecast-client';
import {
  forecastQueryKey,
  normalizeWeatherCoordinates,
} from '../model/weather-location';

export function useWeatherForecast(coordinates: DeviceCoordinates | null) {
  const isOnline = useOnlineStatus();
  const roundedCoordinates =
    coordinates === null ? null : normalizeWeatherCoordinates(coordinates);

  return useQuery({
    queryKey: forecastQueryKey(coordinates),
    queryFn: () => {
      if (roundedCoordinates === null) {
        return [];
      }
      return fetchWeatherForecast(roundedCoordinates.latitude, roundedCoordinates.longitude);
    },
    enabled: roundedCoordinates !== null && isOnline,
    retry: 1,
    staleTime: 60_000,
  });
}
