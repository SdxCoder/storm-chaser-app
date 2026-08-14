import { useCallback, useEffect, useRef, useState } from 'react';

import {
  acquireCurrentLocation,
  type CurrentLocationResult,
  type DeviceCoordinates,
} from '../../../services/location/current-location';
import { useCurrentWeather } from './use-current-weather';

type LocationState =
  | { status: 'loading' }
  | { status: 'permission-denied'; canAskAgain: boolean }
  | { status: 'unavailable' }
  | { status: 'ready'; coordinates: DeviceCoordinates };

function toLocationState(result: CurrentLocationResult): LocationState {
  if (result.status === 'success') {
    return { status: 'ready', coordinates: result.coordinates };
  }
  return result;
}

export function useCurrentWeatherFlow() {
  const [location, setLocation] = useState<LocationState>({ status: 'loading' });
  const requestedInitially = useRef(false);
  const coordinates = location.status === 'ready' ? location.coordinates : null;
  const weather = useCurrentWeather(coordinates);

  const requestLocation = useCallback(async (requestAgainAfterDenial = false) => {
    setLocation({ status: 'loading' });
    const result = await acquireCurrentLocation(requestAgainAfterDenial);
    setLocation(toLocationState(result));
  }, []);

  useEffect(() => {
    if (requestedInitially.current) {
      return;
    }
    requestedInitially.current = true;
    void requestLocation();
  }, [requestLocation]);

  return { location, requestLocation, weather };
}
