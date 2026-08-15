import { type SQLiteBindParams, type SQLiteDatabase } from 'expo-sqlite';

import { type WeatherCacheEntry } from '../model/weather-cache-entry';
import {
  normalizeWeatherCoordinates,
  type WeatherCoordinates,
  weatherLocationKey,
} from '../model/weather-location';
import { type WeatherSnapshot } from '../model/weather-snapshot';
import {
  mapWeatherCacheEntryToRow,
  mapWeatherCacheRowToEntry,
} from './weather-cache-row-mapper';
import { type WeatherCacheRow } from './weather-cache-row';

export type WeatherCacheResult<T> =
  | { status: 'success'; data: T }
  | { status: 'failure' };

const weatherCacheColumns = `
  cache_key,
  latitude,
  longitude,
  temperature_celsius,
  apparent_temperature_celsius,
  relative_humidity_percent,
  surface_pressure_hpa,
  precipitation_mm,
  wind_speed_kph,
  wind_gust_kph,
  wind_direction_degrees,
  weather_code,
  observed_at,
  cached_at
`;

export async function getCachedWeather(
  database: SQLiteDatabase,
  coordinates: WeatherCoordinates,
): Promise<WeatherCacheResult<WeatherCacheEntry | null>> {
  const normalized = normalizeWeatherCoordinates(coordinates);
  const cacheKey = weatherLocationKey(normalized);

  try {
    const row = await database.getFirstAsync<WeatherCacheRow>(
      `SELECT ${weatherCacheColumns}
       FROM weather_cache
       WHERE cache_key = $cacheKey
         AND latitude = $latitude
         AND longitude = $longitude
       LIMIT 1`,
      {
        $cacheKey: cacheKey,
        $latitude: normalized.latitude,
        $longitude: normalized.longitude,
      },
    );
    return {
      status: 'success',
      data: row === null ? null : mapWeatherCacheRowToEntry(row),
    };
  } catch {
    return { status: 'failure' };
  }
}

export async function upsertCachedWeather(
  database: SQLiteDatabase,
  coordinates: WeatherCoordinates,
  weather: WeatherSnapshot,
  cachedAt = new Date().toISOString(),
): Promise<WeatherCacheResult<WeatherCacheEntry>> {
  const normalized = normalizeWeatherCoordinates(coordinates);
  const entry: WeatherCacheEntry = {
    cacheKey: weatherLocationKey(normalized),
    latitude: normalized.latitude,
    longitude: normalized.longitude,
    weather: { ...weather, source: 'cache' },
    cachedAt,
  };
  const row = mapWeatherCacheEntryToRow(entry);
  const parameters: SQLiteBindParams = {
    $cacheKey: row.cache_key,
    $latitude: row.latitude,
    $longitude: row.longitude,
    $temperatureCelsius: row.temperature_celsius,
    $apparentTemperatureCelsius: row.apparent_temperature_celsius,
    $relativeHumidityPercent: row.relative_humidity_percent,
    $surfacePressureHpa: row.surface_pressure_hpa,
    $precipitationMm: row.precipitation_mm,
    $windSpeedKph: row.wind_speed_kph,
    $windGustKph: row.wind_gust_kph,
    $windDirectionDegrees: row.wind_direction_degrees,
    $weatherCode: row.weather_code,
    $observedAt: row.observed_at,
    $cachedAt: row.cached_at,
  };

  try {
    await database.runAsync(
      `INSERT INTO weather_cache (${weatherCacheColumns}) VALUES (
        $cacheKey,
        $latitude,
        $longitude,
        $temperatureCelsius,
        $apparentTemperatureCelsius,
        $relativeHumidityPercent,
        $surfacePressureHpa,
        $precipitationMm,
        $windSpeedKph,
        $windGustKph,
        $windDirectionDegrees,
        $weatherCode,
        $observedAt,
        $cachedAt
      )
      ON CONFLICT(cache_key) DO UPDATE SET
        latitude = excluded.latitude,
        longitude = excluded.longitude,
        temperature_celsius = excluded.temperature_celsius,
        apparent_temperature_celsius = excluded.apparent_temperature_celsius,
        relative_humidity_percent = excluded.relative_humidity_percent,
        surface_pressure_hpa = excluded.surface_pressure_hpa,
        precipitation_mm = excluded.precipitation_mm,
        wind_speed_kph = excluded.wind_speed_kph,
        wind_gust_kph = excluded.wind_gust_kph,
        wind_direction_degrees = excluded.wind_direction_degrees,
        weather_code = excluded.weather_code,
        observed_at = excluded.observed_at,
        cached_at = excluded.cached_at`,
      parameters,
    );
    return { status: 'success', data: entry };
  } catch {
    return { status: 'failure' };
  }
}
