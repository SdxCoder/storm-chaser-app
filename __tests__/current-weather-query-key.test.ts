import {
  currentWeatherQueryKey,
  forecastQueryKey,
  roundWeatherCoordinate,
} from '../src/features/weather/model/weather-location';

describe('current weather query identity', () => {
  it('rounds coordinates to three decimal places', () => {
    expect(roundWeatherCoordinate(51.044733)).toBe(51.045);
    expect(roundWeatherCoordinate(-114.071912)).toBe(-114.072);
  });

  it('uses rounded coordinates in the query key', () => {
    expect(
      currentWeatherQueryKey({
        latitude: 51.044733,
        longitude: -114.071912,
      }),
    ).toEqual([
      'current-weather',
      51.045,
      -114.072,
    ]);
  });

  it('keeps forecast state separate while using the same rounded location identity', () => {
    expect(forecastQueryKey({ latitude: 51.044733, longitude: -114.071912 })).toEqual([
      'weather-forecast',
      51.045,
      -114.072,
    ]);
  });
});
