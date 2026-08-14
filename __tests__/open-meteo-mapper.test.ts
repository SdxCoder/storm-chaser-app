import { mapOpenMeteoCurrentResponse } from '../src/features/weather/api/open-meteo-mapper';

const completeResponse = {
  current_units: {
    time: 'unixtime',
    temperature_2m: '°C',
    apparent_temperature: '°C',
    relative_humidity_2m: '%',
    surface_pressure: 'hPa',
    precipitation: 'mm',
    weather_code: 'wmo code',
    wind_speed_10m: 'km/h',
    wind_direction_10m: '°',
    wind_gusts_10m: 'km/h',
  },
  current: {
    time: 1_786_747_500,
    interval: 900,
    temperature_2m: 14.6,
    apparent_temperature: 14.1,
    relative_humidity_2m: 74,
    surface_pressure: 901.7,
    precipitation: 0.2,
    weather_code: 2,
    wind_speed_10m: 4,
    wind_direction_10m: 153,
    wind_gusts_10m: 6.1,
  },
};

describe('mapOpenMeteoCurrentResponse', () => {
  it('maps a complete current response into a live domain snapshot', () => {
    expect(mapOpenMeteoCurrentResponse(completeResponse)).toEqual({
      temperatureCelsius: 14.6,
      apparentTemperatureCelsius: 14.1,
      relativeHumidityPercent: 74,
      surfacePressureHpa: 901.7,
      precipitationMm: 0.2,
      windSpeedKph: 4,
      windGustKph: 6.1,
      windDirectionDegrees: 153,
      weatherCode: 2,
      observedAt: '2026-08-14T22:45:00.000Z',
      source: 'live',
    });
  });

  it('maps missing or invalid optional values to null', () => {
    expect(
      mapOpenMeteoCurrentResponse({
        current: {
          time: 1_786_747_500,
          temperature_2m: 14.6,
          precipitation: 0.2,
          wind_speed_10m: 4,
          apparent_temperature: '14.1',
          relative_humidity_2m: 101,
          surface_pressure: -1,
          wind_gusts_10m: -0.1,
          wind_direction_10m: 361,
          weather_code: -1,
        },
      }),
    ).toMatchObject({
      apparentTemperatureCelsius: null,
      relativeHumidityPercent: null,
      surfacePressureHpa: null,
      windGustKph: null,
      windDirectionDegrees: null,
      weatherCode: null,
    });
  });

  it.each([
    ['missing current payload', {}],
    ['non-object current payload', { current: [] }],
    [
      'missing required temperature',
      { current: { time: 1_786_747_500, precipitation: 0, wind_speed_10m: 0 } },
    ],
    [
      'invalid required precipitation',
      {
        current: {
          time: 1_786_747_500,
          temperature_2m: 0,
          precipitation: '0',
          wind_speed_10m: 0,
        },
      },
    ],
    [
      'negative required wind speed',
      {
        current: {
          time: 1_786_747_500,
          temperature_2m: 0,
          precipitation: 0,
          wind_speed_10m: -1,
        },
      },
    ],
    [
      'missing observation time',
      { current: { temperature_2m: 0, precipitation: 0, wind_speed_10m: 0 } },
    ],
  ])('returns null for %s', (_description, response) => {
    expect(mapOpenMeteoCurrentResponse(response)).toBeNull();
  });

  it('preserves zero values instead of treating them as missing', () => {
    expect(
      mapOpenMeteoCurrentResponse({
        current: {
          time: 0,
          temperature_2m: 0,
          apparent_temperature: 0,
          relative_humidity_2m: 0,
          surface_pressure: 0,
          precipitation: 0,
          weather_code: 0,
          wind_speed_10m: 0,
          wind_direction_10m: 0,
          wind_gusts_10m: 0,
        },
      }),
    ).toEqual({
      temperatureCelsius: 0,
      apparentTemperatureCelsius: 0,
      relativeHumidityPercent: 0,
      surfacePressureHpa: 0,
      precipitationMm: 0,
      windSpeedKph: 0,
      windGustKph: 0,
      windDirectionDegrees: 0,
      weatherCode: 0,
      observedAt: '1970-01-01T00:00:00.000Z',
      source: 'live',
    });
  });
});
