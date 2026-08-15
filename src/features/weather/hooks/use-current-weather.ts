import { onlineManager, useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { useOnlineStatus } from '../../../services/connectivity/use-online-status';
import { useDatabase } from '../../../services/database/database-provider';
import { type DeviceCoordinates } from '../../../services/location/current-location';
import {
  OfflineWeatherUnavailableError,
  retrieveCurrentWeather,
} from '../api/retrieve-current-weather';
import {
  currentWeatherQueryKey,
  normalizeWeatherCoordinates,
} from '../model/weather-location';

export { currentWeatherQueryKey, roundWeatherCoordinate } from '../model/weather-location';

export function useCurrentWeather(coordinates: DeviceCoordinates | null) {
  const database = useDatabase();
  const isOnline = useOnlineStatus();
  const wasOnline = useRef(isOnline);
  const roundedCoordinates =
    coordinates === null
      ? null
      : normalizeWeatherCoordinates(coordinates);

  const query = useQuery({
    queryKey: currentWeatherQueryKey(coordinates),
    queryFn: () => {
      if (roundedCoordinates === null) {
        return null;
      }
      return retrieveCurrentWeather(database, roundedCoordinates, onlineManager.isOnline());
    },
    enabled: roundedCoordinates !== null,
    networkMode: 'always',
    refetchOnReconnect: 'always',
    retry: (failureCount, error) =>
      onlineManager.isOnline() &&
      !(error instanceof OfflineWeatherUnavailableError) &&
      failureCount < 1,
    staleTime: 60_000,
  });

  const latitude = roundedCoordinates?.latitude ?? null;
  const longitude = roundedCoordinates?.longitude ?? null;
  const refetch = query.refetch;
  useEffect(() => {
    const wentOffline = wasOnline.current && !isOnline;
    wasOnline.current = isOnline;
    if (wentOffline && latitude !== null && longitude !== null) {
      void refetch();
    }
  }, [isOnline, latitude, longitude, refetch]);

  return query;
}
