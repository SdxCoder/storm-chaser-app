import { mapOpenMeteoForecastResponse } from '../src/features/weather/api/open-meteo-forecast-mapper';

describe('mapOpenMeteoForecastResponse', () => {
  it('maps parallel daily arrays into at most three forecast-day domain objects', () => {
    expect(
      mapOpenMeteoForecastResponse({
        daily: {
          time: ['2026-08-15', '2026-08-16', '2026-08-17', '2026-08-18'],
          weather_code: [2, 61, 95, 0],
          temperature_2m_max: [22.4, 19, 17.2, 20],
          temperature_2m_min: [12.1, 10.5, 8, 9],
          precipitation_probability_max: [10, 65, 90, 0],
          precipitation_sum: [0, 4.6, 12.2, 0],
          wind_speed_10m_max: [24, 31.5, 45, 5],
          wind_gusts_10m_max: [39, 52, 70.2, 8],
        },
      }),
    ).toEqual([
      {
        date: '2026-08-15',
        weatherCode: 2,
        maximumTemperatureCelsius: 22.4,
        minimumTemperatureCelsius: 12.1,
        maximumPrecipitationProbabilityPercent: 10,
        precipitationTotalMm: 0,
        maximumWindSpeedKph: 24,
        maximumWindGustKph: 39,
      },
      {
        date: '2026-08-16',
        weatherCode: 61,
        maximumTemperatureCelsius: 19,
        minimumTemperatureCelsius: 10.5,
        maximumPrecipitationProbabilityPercent: 65,
        precipitationTotalMm: 4.6,
        maximumWindSpeedKph: 31.5,
        maximumWindGustKph: 52,
      },
      {
        date: '2026-08-17',
        weatherCode: 95,
        maximumTemperatureCelsius: 17.2,
        minimumTemperatureCelsius: 8,
        maximumPrecipitationProbabilityPercent: 90,
        precipitationTotalMm: 12.2,
        maximumWindSpeedKph: 45,
        maximumWindGustKph: 70.2,
      },
    ]);
  });

  it('maps missing, invalid, null, and mismatched values to null by day', () => {
    expect(
      mapOpenMeteoForecastResponse({
        daily: {
          time: ['2026-08-15', '2026-08-16', 'not-a-date'],
          weather_code: [null, -1],
          temperature_2m_max: [10, 4],
          temperature_2m_min: [12, '2'],
          precipitation_probability_max: [101],
          precipitation_sum: [-1, null],
          wind_speed_10m_max: [Number.NaN],
          wind_gusts_10m_max: [20],
        },
      }),
    ).toEqual([
      {
        date: '2026-08-15',
        weatherCode: null,
        maximumTemperatureCelsius: null,
        minimumTemperatureCelsius: null,
        maximumPrecipitationProbabilityPercent: null,
        precipitationTotalMm: null,
        maximumWindSpeedKph: null,
        maximumWindGustKph: 20,
      },
      {
        date: '2026-08-16',
        weatherCode: null,
        maximumTemperatureCelsius: 4,
        minimumTemperatureCelsius: null,
        maximumPrecipitationProbabilityPercent: null,
        precipitationTotalMm: null,
        maximumWindSpeedKph: null,
        maximumWindGustKph: null,
      },
    ]);
  });

  it.each([
    ['non-object response', null],
    ['missing daily payload', {}],
    ['non-object daily payload', { daily: [] }],
    ['missing dates', { daily: { weather_code: [2] } }],
  ])('returns an empty forecast for a %s', (_description, response) => {
    expect(mapOpenMeteoForecastResponse(response)).toEqual([]);
  });
});
