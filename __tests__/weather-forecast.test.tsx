import { fireEvent, render, screen } from '@testing-library/react-native';

import { WeatherForecast } from '../src/features/weather/components/weather-forecast';
import { type WeatherForecastDay } from '../src/features/weather/model/weather-forecast';

const forecastDay: WeatherForecastDay = {
  date: '2026-08-16',
  weatherCode: 95,
  maximumTemperatureCelsius: 19,
  minimumTemperatureCelsius: 10,
  maximumPrecipitationProbabilityPercent: 80,
  precipitationTotalMm: 7.5,
  maximumWindSpeedKph: 35,
  maximumWindGustKph: 58,
};

describe('WeatherForecast', () => {
  it('renders storm-relevant forecast values with an accessible day summary', () => {
    render(
      <WeatherForecast
        days={[forecastDay]}
        isLoading={false}
        isOnline
        onRetry={jest.fn()}
        unavailable={false}
      />,
    );

    expect(screen.getByRole('header', { name: 'Three-day forecast' })).toBeOnTheScreen();
    expect(screen.getByText('Thunderstorm')).toBeOnTheScreen();
    expect(screen.getByText('High 19 °C · Low 10 °C')).toBeOnTheScreen();
    expect(screen.getByText('Precip 80% · 7.5 mm')).toBeOnTheScreen();
    expect(screen.getByText('Wind 35 km/h · Gusts 58 km/h')).toBeOnTheScreen();
    expect(screen.getByLabelText(/maximum gusts 58 kilometres per hour/)).toBeOnTheScreen();
  });

  it('offers an isolated retry when forecast is unavailable', () => {
    const onRetry = jest.fn();
    render(
      <WeatherForecast
        days={undefined}
        isLoading={false}
        isOnline
        onRetry={onRetry}
        unavailable
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Forecast is unavailable. Current weather is still available.',
    );
    fireEvent.press(screen.getByRole('button', { name: 'Retry forecast' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not present in-memory forecast days as offline forecast support', () => {
    render(
      <WeatherForecast
        days={[forecastDay]}
        isLoading={false}
        isOnline={false}
        onRetry={jest.fn()}
        unavailable={false}
      />,
    );

    expect(screen.getByText('Forecast is unavailable offline.')).toBeOnTheScreen();
    expect(screen.queryByText('Thunderstorm')).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Retry forecast' })).not.toBeOnTheScreen();
  });
});
