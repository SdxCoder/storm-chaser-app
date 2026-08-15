import { useCallback, useEffect, useRef, useState } from 'react';

import {
  acquireCurrentLocation,
  type CurrentLocationResult,
} from '../../../services/location/current-location';
import { useCurrentWeather } from '../../weather/hooks/use-current-weather';
import { type WeatherSnapshot } from '../../weather/model/weather-snapshot';
import { captureStormPhoto } from '../services/storm-camera';

export { type CameraCaptureResult } from '../services/storm-camera';

export type CaptureDraftState = {
  temporaryPhotoUri: string;
  capturedAt: string;
  latitude: number | null;
  longitude: number | null;
  locationAccuracyMetres: number | null;
  weatherSnapshot: WeatherSnapshot | null;
};

export type CameraState =
  | { status: 'idle' }
  | { status: 'launching' }
  | { status: 'canceled' }
  | { status: 'permission-denied'; canAskAgain: boolean }
  | { status: 'unavailable' };

export type LocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'permission-denied'; canAskAgain: boolean }
  | { status: 'unavailable' }
  | { status: 'ready' };

const initialDraft: CaptureDraftState = {
  temporaryPhotoUri: '',
  capturedAt: '',
  latitude: null,
  longitude: null,
  locationAccuracyMetres: null,
  weatherSnapshot: null,
};

export function useStormDraft() {
  const [draft, setDraft] = useState<CaptureDraftState>(initialDraft);
  const [camera, setCamera] = useState<CameraState>({ status: 'idle' });
  const [location, setLocation] = useState<LocationState>({ status: 'idle' });
  const cameraLaunchInProgress = useRef(false);
  const latestLocationRequestId = useRef(0);
  const coordinates =
    draft.latitude === null || draft.longitude === null
      ? null
      : {
          latitude: draft.latitude,
          longitude: draft.longitude,
          locationAccuracyMetres: draft.locationAccuracyMetres,
        };
  const weather = useCurrentWeather(coordinates);

  const requestLocation = useCallback(async (requestAgainAfterDenial = false) => {
    const requestId = ++latestLocationRequestId.current;
    setLocation({ status: 'loading' });
    const result: CurrentLocationResult = await acquireCurrentLocation(requestAgainAfterDenial);

    if (requestId !== latestLocationRequestId.current) {
      return;
    }

    if (result.status === 'success') {
      setDraft((current) => ({
        ...current,
        latitude: result.coordinates.latitude,
        longitude: result.coordinates.longitude,
        locationAccuracyMetres: result.coordinates.locationAccuracyMetres,
      }));
      setLocation({ status: 'ready' });
      return;
    }

    setLocation(result);
  }, []);

  const requestCamera = useCallback(
    async (requestAgainAfterDenial = false) => {
      if (cameraLaunchInProgress.current) {
        return;
      }

      cameraLaunchInProgress.current = true;
      setCamera({ status: 'launching' });
      const result = await captureStormPhoto(requestAgainAfterDenial);

      if (result.status === 'success') {
        setDraft((current) => ({
          ...current,
          capturedAt: result.capturedAt,
          latitude: null,
          longitude: null,
          locationAccuracyMetres: null,
          temporaryPhotoUri: result.temporaryPhotoUri,
          weatherSnapshot: null,
        }));
        setCamera({ status: 'idle' });
        void requestLocation();
      } else {
        setCamera(result);
      }

      cameraLaunchInProgress.current = false;
    },
    [requestLocation],
  );

  const resetDraft = useCallback(() => {
    latestLocationRequestId.current += 1;
    setCamera({ status: 'idle' });
    setDraft({ ...initialDraft });
    setLocation({ status: 'idle' });
  }, []);

  useEffect(() => {
    const snapshot = weather.data;
    if (!snapshot || draft.latitude === null || draft.longitude === null) {
      return;
    }

    setDraft((current) =>
      current.weatherSnapshot === null
        ? { ...current, weatherSnapshot: { ...snapshot } }
        : current,
    );
  }, [draft.latitude, draft.longitude, weather.data]);

  return { camera, draft, location, requestCamera, requestLocation, resetDraft, weather };
}
