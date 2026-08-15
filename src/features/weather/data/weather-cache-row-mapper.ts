import { type WeatherCacheEntry } from '../model/weather-cache-entry';
import { weatherLocationKey } from '../model/weather-location';
import { type WeatherCacheRow } from './weather-cache-row';

function isIsoTimestamp(value: string): boolean {
  const date = new Date(value);
  return value.length > 0 && !Number.isNaN(date.getTime()) && date.toISOString() === value;
}

function isCoordinateInRange(value: number, minimum: number, maximum: number): boolean {
  return Number.isFinite(value) && value >= minimum && value <= maximum;
}

function requiredFiniteNumber(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error('Invalid numeric value in weather cache row.');
  }
  return value;
}

function optionalFiniteNumber(value: number | null): number | null {
  if (value === null || Number.isFinite(value)) {
    return value;
  }
  throw new Error('Invalid nullable numeric value in weather cache row.');
}

export function mapWeatherCacheRowToEntry(row: WeatherCacheRow): WeatherCacheEntry {
  if (
    !isCoordinateInRange(row.latitude, -90, 90) ||
    !isCoordinateInRange(row.longitude, -180, 180) ||
    row.cache_key !== weatherLocationKey(row) ||
    !isIsoTimestamp(row.observed_at) ||
    !isIsoTimestamp(row.cached_at)
  ) {
    throw new Error('Invalid weather cache row.');
  }

  const precipitationMm = requiredFiniteNumber(row.precipitation_mm);
  const windSpeedKph = requiredFiniteNumber(row.wind_speed_kph);
  if (precipitationMm < 0 || windSpeedKph < 0) {
    throw new Error('Invalid required weather value in cache row.');
  }

  return {
    cacheKey: row.cache_key,
    latitude: row.latitude,
    longitude: row.longitude,
    cachedAt: row.cached_at,
    weather: {
      temperatureCelsius: requiredFiniteNumber(row.temperature_celsius),
      apparentTemperatureCelsius: optionalFiniteNumber(row.apparent_temperature_celsius),
      relativeHumidityPercent: optionalFiniteNumber(row.relative_humidity_percent),
      surfacePressureHpa: optionalFiniteNumber(row.surface_pressure_hpa),
      precipitationMm,
      windSpeedKph,
      windGustKph: optionalFiniteNumber(row.wind_gust_kph),
      windDirectionDegrees: optionalFiniteNumber(row.wind_direction_degrees),
      weatherCode: optionalFiniteNumber(row.weather_code),
      observedAt: row.observed_at,
      source: 'cache',
    },
  };
}

export function mapWeatherCacheEntryToRow(entry: WeatherCacheEntry): WeatherCacheRow {
  const { weather } = entry;
  return {
    cache_key: entry.cacheKey,
    latitude: entry.latitude,
    longitude: entry.longitude,
    temperature_celsius: weather.temperatureCelsius,
    apparent_temperature_celsius: weather.apparentTemperatureCelsius,
    relative_humidity_percent: weather.relativeHumidityPercent,
    surface_pressure_hpa: weather.surfacePressureHpa,
    precipitation_mm: weather.precipitationMm,
    wind_speed_kph: weather.windSpeedKph,
    wind_gust_kph: weather.windGustKph,
    wind_direction_degrees: weather.windDirectionDegrees,
    weather_code: weather.weatherCode,
    observed_at: weather.observedAt,
    cached_at: entry.cachedAt,
  };
}
