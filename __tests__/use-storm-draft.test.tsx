import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useStormDraft } from '../src/features/storms/hooks/use-storm-draft';
import { type WeatherSnapshot } from '../src/features/weather/model/weather-snapshot';

const mockUseCurrentWeather = jest.fn();
const mockAcquireCurrentLocation = jest.fn();

jest.mock('../src/features/weather/hooks/use-current-weather', () => ({
  useCurrentWeather: (coordinates: unknown) => mockUseCurrentWeather(coordinates),
}));

jest.mock('../src/services/location/current-location', () => ({
  acquireCurrentLocation: () => mockAcquireCurrentLocation(),
}));

const firstSnapshot: WeatherSnapshot = {
  temperatureCelsius: 18,
  apparentTemperatureCelsius: 17,
  relativeHumidityPercent: 70,
  surfacePressureHpa: 905,
  precipitationMm: 0,
  windSpeedKph: 25,
  windGustKph: 42,
  windDirectionDegrees: 260,
  weatherCode: 95,
  observedAt: '2026-08-14T22:45:00.000Z',
  source: 'live',
};

describe('useStormDraft weather snapshot', () => {
  it('copies the first usable weather value and does not replace it after a refetch', async () => {
    mockAcquireCurrentLocation.mockResolvedValue({
      status: 'success',
      coordinates: {
        latitude: 51.0447,
        longitude: -114.0719,
        locationAccuracyMetres: 10,
      },
    });
    mockUseCurrentWeather.mockImplementation((coordinates: unknown) => ({
      data: coordinates === null ? undefined : firstSnapshot,
    }));
    const { result, rerender } = renderHook(() => useStormDraft());

    await act(() => result.current.requestLocation());

    await waitFor(() => expect(result.current.draft.weatherSnapshot).toEqual(firstSnapshot));
    expect(result.current.draft.weatherSnapshot).not.toBe(firstSnapshot);

    mockUseCurrentWeather.mockImplementation((coordinates: unknown) => ({
      data:
        coordinates === null
          ? undefined
          : {
              ...firstSnapshot,
              temperatureCelsius: 4,
              weatherCode: 71,
              observedAt: '2026-08-14T23:00:00.000Z',
            },
    }));
    rerender(undefined);

    await waitFor(() =>
      expect(result.current.draft.weatherSnapshot).toEqual(firstSnapshot),
    );
  });
});
