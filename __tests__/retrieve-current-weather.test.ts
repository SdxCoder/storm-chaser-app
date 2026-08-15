import { type SQLiteDatabase } from 'expo-sqlite';

import { fetchCurrentWeather } from '../src/features/weather/api/open-meteo-client';
import {
  OfflineWeatherUnavailableError,
  retrieveCurrentWeather,
} from '../src/features/weather/api/retrieve-current-weather';
import {
  getCachedWeather,
  upsertCachedWeather,
} from '../src/features/weather/data/weather-cache-repository';
import { type WeatherSnapshot } from '../src/features/weather/model/weather-snapshot';

jest.mock('../src/features/weather/api/open-meteo-client', () => ({
  fetchCurrentWeather: jest.fn(),
}));

jest.mock('../src/features/weather/data/weather-cache-repository', () => ({
  getCachedWeather: jest.fn(),
  upsertCachedWeather: jest.fn(),
}));

const database = {} as SQLiteDatabase;
const coordinates = { latitude: 51.045, longitude: -114.072 };
const liveWeather: WeatherSnapshot = {
  temperatureCelsius: 18,
  apparentTemperatureCelsius: 17,
  relativeHumidityPercent: 70,
  surfacePressureHpa: 905,
  precipitationMm: 0,
  windSpeedKph: 25,
  windGustKph: 42,
  windDirectionDegrees: 260,
  weatherCode: 95,
  observedAt: '2026-08-14T22:30:00.000Z',
  source: 'live',
};
const cachedWeather: WeatherSnapshot = { ...liveWeather, source: 'cache' };

describe('retrieveCurrentWeather', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(fetchCurrentWeather).mockResolvedValue(liveWeather);
    jest.mocked(upsertCachedWeather).mockResolvedValue({
      status: 'success',
      data: {
        cacheKey: '51.045,-114.072',
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        weather: cachedWeather,
        cachedAt: '2026-08-14T22:45:00.000Z',
      },
    });
    jest.mocked(getCachedWeather).mockResolvedValue({ status: 'success', data: null });
  });

  it('updates the matching cache after a successful live response', async () => {
    await expect(retrieveCurrentWeather(database, coordinates, true)).resolves.toBe(liveWeather);

    expect(fetchCurrentWeather).toHaveBeenCalledWith(51.045, -114.072);
    expect(upsertCachedWeather).toHaveBeenCalledWith(database, coordinates, liveWeather);
  });

  it('returns live weather even when the cache write fails', async () => {
    jest.mocked(upsertCachedWeather).mockResolvedValue({ status: 'failure' });

    await expect(retrieveCurrentWeather(database, coordinates, true)).resolves.toBe(liveWeather);
  });

  it('uses matching cached weather when the live network request fails', async () => {
    jest.mocked(fetchCurrentWeather).mockRejectedValue(new Error('network failed'));
    jest.mocked(getCachedWeather).mockResolvedValue({
      status: 'success',
      data: {
        cacheKey: '51.045,-114.072',
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        weather: cachedWeather,
        cachedAt: '2026-08-14T22:45:00.000Z',
      },
    });

    await expect(retrieveCurrentWeather(database, coordinates, true)).resolves.toEqual(
      cachedWeather,
    );
    expect(getCachedWeather).toHaveBeenCalledWith(database, coordinates);
  });

  it('reads matching cache without calling the API when offline', async () => {
    jest.mocked(getCachedWeather).mockResolvedValue({
      status: 'success',
      data: {
        cacheKey: '51.045,-114.072',
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        weather: cachedWeather,
        cachedAt: '2026-08-14T22:45:00.000Z',
      },
    });

    await expect(retrieveCurrentWeather(database, coordinates, false)).resolves.toEqual(
      cachedWeather,
    );
    expect(fetchCurrentWeather).not.toHaveBeenCalled();
  });

  it('reports an explicit offline no-cache result', async () => {
    await expect(retrieveCurrentWeather(database, coordinates, false)).rejects.toBeInstanceOf(
      OfflineWeatherUnavailableError,
    );
    expect(fetchCurrentWeather).not.toHaveBeenCalled();
  });
});
