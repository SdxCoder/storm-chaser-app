import { render, screen } from '@testing-library/react-native';

import { type WeatherSnapshot } from '../src/features/weather/model/weather-snapshot';
import { WeatherScreen } from '../src/features/weather/screens/weather-screen';

jest.mock('../src/services/connectivity/use-online-status', () => ({
  useOnlineStatus: () => true,
}));

jest.mock('../src/features/weather/hooks/use-current-weather-flow', () => ({
  useCurrentWeatherFlow: () => ({
    location: {
      status: 'ready',
      coordinates: { latitude: 51.045, longitude: -114.072, locationAccuracyMetres: 10 },
    },
    requestLocation: jest.fn(),
    weather: {
      data: currentWeather,
      failureCount: 0,
      isError: false,
      isPending: false,
      isRefetching: false,
      refetch: jest.fn(),
    },
  }),
}));

jest.mock('../src/features/weather/hooks/use-weather-forecast', () => ({
  useWeatherForecast: () => ({
    data: undefined,
    isError: true,
    isFetching: false,
    isPending: false,
    refetch: jest.fn(),
  }),
}));

const currentWeather: WeatherSnapshot = {
  temperatureCelsius: 18,
  apparentTemperatureCelsius: 17,
  relativeHumidityPercent: 70,
  surfacePressureHpa: 905,
  precipitationMm: 0,
  windSpeedKph: 25,
  windGustKph: 42,
  windDirectionDegrees: 260,
  weatherCode: 2,
  observedAt: '2026-08-14T22:30:00.000Z',
  source: 'live',
};

describe('forecast failure isolation', () => {
  it('keeps current weather usable when the forecast query fails', () => {
    render(<WeatherScreen />);

    expect(screen.getByText('Live weather')).toBeOnTheScreen();
    expect(screen.getByText('Partly cloudy')).toBeOnTheScreen();
    expect(screen.getByLabelText('Temperature: 18 °C')).toBeOnTheScreen();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Forecast is unavailable. Current weather is still available.',
    );
  });
});
