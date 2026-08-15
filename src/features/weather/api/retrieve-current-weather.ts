import { type SQLiteDatabase } from 'expo-sqlite';

import { getCachedWeather, upsertCachedWeather } from '../data/weather-cache-repository';
import { type WeatherCoordinates } from '../model/weather-location';
import { type WeatherSnapshot } from '../model/weather-snapshot';
import { fetchCurrentWeather } from './open-meteo-client';

export class OfflineWeatherUnavailableError extends Error {
  constructor() {
    super('No matching weather is cached for offline use.');
    this.name = 'OfflineWeatherUnavailableError';
  }
}

export class WeatherCacheReadError extends Error {
  constructor() {
    super('The weather cache could not be read.');
    this.name = 'WeatherCacheReadError';
  }
}

async function readMatchingCache(
  database: SQLiteDatabase,
  coordinates: WeatherCoordinates,
): Promise<WeatherSnapshot | null> {
  const cached = await getCachedWeather(database, coordinates);
  if (cached.status === 'failure') {
    throw new WeatherCacheReadError();
  }
  return cached.data?.weather ?? null;
}

export async function retrieveCurrentWeather(
  database: SQLiteDatabase,
  coordinates: WeatherCoordinates,
  isOnline: boolean,
): Promise<WeatherSnapshot | null> {
  if (!isOnline) {
    const cachedWeather = await readMatchingCache(database, coordinates);
    if (cachedWeather === null) {
      throw new OfflineWeatherUnavailableError();
    }
    return cachedWeather;
  }

  try {
    const liveWeather = await fetchCurrentWeather(coordinates.latitude, coordinates.longitude);
    if (liveWeather === null) {
      return null;
    }

    await upsertCachedWeather(database, coordinates, liveWeather).catch(() => undefined);
    return liveWeather;
  } catch (error: unknown) {
    const cachedWeather = await readMatchingCache(database, coordinates).catch(() => null);
    if (cachedWeather !== null) {
      return cachedWeather;
    }
    throw error;
  }
}
