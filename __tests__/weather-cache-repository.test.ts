import { type SQLiteBindParams, type SQLiteDatabase } from 'expo-sqlite';

import {
  getCachedWeather,
  upsertCachedWeather,
} from '../src/features/weather/data/weather-cache-repository';
import { type WeatherCacheRow } from '../src/features/weather/data/weather-cache-row';
import { type WeatherSnapshot } from '../src/features/weather/model/weather-snapshot';

const cachedRow: WeatherCacheRow = {
  cache_key: '51.045,-114.072',
  latitude: 51.045,
  longitude: -114.072,
  temperature_celsius: 18,
  apparent_temperature_celsius: null,
  relative_humidity_percent: 70,
  surface_pressure_hpa: 905,
  precipitation_mm: 0,
  wind_speed_kph: 25,
  wind_gust_kph: null,
  wind_direction_degrees: 260,
  weather_code: 95,
  observed_at: '2026-08-14T22:30:00.000Z',
  cached_at: '2026-08-14T22:45:00.000Z',
};

const liveWeather: WeatherSnapshot = {
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
  source: 'live',
};

describe('weather cache repository', () => {
  it('returns only the row matching the normalized coordinate key', async () => {
    const getFirstAsync = jest.fn(
      async (_sql: string, parameters: SQLiteBindParams) => {
        const namedParameters = parameters as { $cacheKey?: unknown };
        return namedParameters.$cacheKey === cachedRow.cache_key ? cachedRow : null;
      },
    );
    const database = { getFirstAsync } as unknown as SQLiteDatabase;

    const matching = await getCachedWeather(database, {
      latitude: 51.044733,
      longitude: -114.071912,
    });
    const unrelated = await getCachedWeather(database, {
      latitude: 53.5461,
      longitude: -113.4937,
    });

    expect(matching).toMatchObject({ status: 'success', data: { cacheKey: cachedRow.cache_key } });
    expect(unrelated).toEqual({ status: 'success', data: null });
    expect(getFirstAsync).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('AND latitude = $latitude'),
      {
        $cacheKey: '51.045,-114.072',
        $latitude: 51.045,
        $longitude: -114.072,
      },
    );
    expect(getFirstAsync).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      expect.objectContaining({ $cacheKey: '53.546,-113.494' }),
    );
  });

  it('upserts a live snapshot under its normalized location identity', async () => {
    const runAsync = jest.fn().mockResolvedValue(undefined);
    const database = { runAsync } as unknown as SQLiteDatabase;

    const result = await upsertCachedWeather(
      database,
      { latitude: 51.044733, longitude: -114.071912 },
      liveWeather,
      '2026-08-14T22:45:00.000Z',
    );

    expect(result).toMatchObject({
      status: 'success',
      data: { cacheKey: '51.045,-114.072', weather: { source: 'cache' } },
    });
    expect(runAsync).toHaveBeenCalledWith(
      expect.stringContaining('ON CONFLICT(cache_key) DO UPDATE SET'),
      expect.objectContaining({
        $cacheKey: '51.045,-114.072',
        $latitude: 51.045,
        $longitude: -114.072,
        $cachedAt: '2026-08-14T22:45:00.000Z',
      }),
    );
  });
});
