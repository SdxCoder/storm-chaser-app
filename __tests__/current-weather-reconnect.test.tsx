import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { type PropsWithChildren } from 'react';

import { retrieveCurrentWeather } from '../src/features/weather/api/retrieve-current-weather';
import { useCurrentWeather } from '../src/features/weather/hooks/use-current-weather';
import { type WeatherSnapshot } from '../src/features/weather/model/weather-snapshot';

const mockDatabase = { name: 'test-database' };

jest.mock('../src/services/database/database-provider', () => ({
  useDatabase: () => mockDatabase,
}));

jest.mock('../src/features/weather/api/retrieve-current-weather', () => ({
  OfflineWeatherUnavailableError: class OfflineWeatherUnavailableError extends Error {},
  retrieveCurrentWeather: jest.fn(),
}));

const cachedWeather: WeatherSnapshot = {
  temperatureCelsius: 18,
  apparentTemperatureCelsius: null,
  relativeHumidityPercent: 70,
  surfacePressureHpa: 905,
  precipitationMm: 0,
  windSpeedKph: 25,
  windGustKph: null,
  windDirectionDegrees: 260,
  weatherCode: 95,
  observedAt: '2026-08-14T22:30:00.000Z',
  source: 'cache',
};

describe('current weather reconnect refresh', () => {
  afterEach(() => {
    onlineManager.setOnline(true);
  });

  it('requests live weather after TanStack reports connectivity restored', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { gcTime: Number.POSITIVE_INFINITY } },
    });
    jest
      .mocked(retrieveCurrentWeather)
      .mockImplementation(async (_database, _coordinates, isOnline) =>
        isOnline ? { ...cachedWeather, source: 'live' } : cachedWeather,
      );
    onlineManager.setOnline(false);
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result, unmount } = renderHook(
      () =>
        useCurrentWeather({
          latitude: 51.0447,
          longitude: -114.0719,
          locationAccuracyMetres: 10,
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.data?.source).toBe('cache'));
    expect(retrieveCurrentWeather).toHaveBeenLastCalledWith(
      mockDatabase,
      { latitude: 51.045, longitude: -114.072 },
      false,
    );

    act(() => onlineManager.setOnline(true));

    await waitFor(() => expect(result.current.data?.source).toBe('live'));
    expect(retrieveCurrentWeather).toHaveBeenLastCalledWith(
      mockDatabase,
      { latitude: 51.045, longitude: -114.072 },
      true,
    );

    unmount();
    queryClient.clear();
  });
});
