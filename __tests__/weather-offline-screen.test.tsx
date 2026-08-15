import { render, screen } from '@testing-library/react-native';

import { OfflineWeatherUnavailableError } from '../src/features/weather/api/retrieve-current-weather';
import { WeatherMetrics } from '../src/features/weather/components/weather-metrics';
import { type WeatherSnapshot } from '../src/features/weather/model/weather-snapshot';
import { WeatherScreen } from '../src/features/weather/screens/weather-screen';

const mockUseCurrentWeatherFlow = jest.fn();

jest.mock('../src/services/connectivity/use-online-status', () => ({
  useOnlineStatus: () => false,
}));

jest.mock('../src/features/weather/hooks/use-current-weather-flow', () => ({
  useCurrentWeatherFlow: () => mockUseCurrentWeatherFlow(),
}));

jest.mock('../src/features/weather/hooks/use-weather-forecast', () => ({
  useWeatherForecast: () => ({
    data: undefined,
    isError: false,
    isFetching: false,
    isPending: true,
    refetch: jest.fn(),
  }),
}));

const cachedWeather: WeatherSnapshot = {
  temperatureCelsius: 18,
  apparentTemperatureCelsius: 17,
  relativeHumidityPercent: 70,
  surfacePressureHpa: 905,
  precipitationMm: 0,
  windSpeedKph: 25,
  windGustKph: 42,
  windDirectionDegrees: 260,
  weatherCode: 95,
  observedAt: '2026-08-14T22:30:00.000Z',
  source: 'cache',
};

describe('offline weather presentation', () => {
  it('labels cached weather and displays its observation timestamp', () => {
    render(<WeatherMetrics weather={cachedWeather} />);

    expect(screen.getByText('Cached weather')).toBeOnTheScreen();
    expect(
      screen.getByText(`Observed ${new Date(cachedWeather.observedAt).toLocaleString()}`),
    ).toBeOnTheScreen();
  });

  it('explains the offline no-cache state and manual documentation fallback', () => {
    mockUseCurrentWeatherFlow.mockReturnValue({
      location: {
        status: 'ready',
        coordinates: {
          latitude: 51.0447,
          longitude: -114.0719,
          locationAccuracyMetres: 10,
        },
      },
      requestLocation: jest.fn(),
      weather: {
        data: undefined,
        error: new OfflineWeatherUnavailableError(),
        failureCount: 1,
        isError: true,
        isPending: false,
        isRefetching: false,
        refetch: jest.fn(),
      },
    });

    render(<WeatherScreen />);

    expect(screen.getByRole('header', { name: 'Offline with no cached weather' })).toBeOnTheScreen();
    expect(screen.getByText(/manual observed conditions/)).toBeOnTheScreen();
    expect(screen.getByRole('alert', { name: /Live weather is unavailable/ })).toBeOnTheScreen();
  });
});
