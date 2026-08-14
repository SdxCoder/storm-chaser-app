import { interpretWeatherCode } from '../src/features/weather/model/weather-condition';

describe('interpretWeatherCode', () => {
  it.each([
    [0, 'Clear sky'],
    [2, 'Partly cloudy'],
    [3, 'Overcast'],
    [45, 'Fog'],
    [53, 'Drizzle'],
    [57, 'Freezing drizzle'],
    [63, 'Rain'],
    [67, 'Freezing rain'],
    [73, 'Snowfall'],
    [77, 'Snow grains'],
    [81, 'Rain showers'],
    [86, 'Snow showers'],
    [95, 'Thunderstorm'],
    [99, 'Thunderstorm with hail'],
  ])('maps WMO code %s to %s', (code, expected) => {
    expect(interpretWeatherCode(code)).toBe(expected);
  });

  it('distinguishes a missing code from an unknown code', () => {
    expect(interpretWeatherCode(null)).toBe('Unavailable');
    expect(interpretWeatherCode(42)).toBe('Unknown conditions');
  });
});
