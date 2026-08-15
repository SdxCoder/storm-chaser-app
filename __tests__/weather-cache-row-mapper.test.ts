import {
  mapWeatherCacheEntryToRow,
  mapWeatherCacheRowToEntry,
} from '../src/features/weather/data/weather-cache-row-mapper';
import { type WeatherCacheRow } from '../src/features/weather/data/weather-cache-row';

const row: WeatherCacheRow = {
  cache_key: '51.045,-114.072',
  latitude: 51.045,
  longitude: -114.072,
  temperature_celsius: 18,
  apparent_temperature_celsius: 17,
  relative_humidity_percent: 70,
  surface_pressure_hpa: 905,
  precipitation_mm: 0.4,
  wind_speed_kph: 25,
  wind_gust_kph: 42,
  wind_direction_degrees: 260,
  weather_code: 95,
  observed_at: '2026-08-14T22:30:00.000Z',
  cached_at: '2026-08-14T22:45:00.000Z',
};

describe('weather cache SQLite row mapping', () => {
  it('maps every cache field and marks the domain weather as cached', () => {
    const entry = mapWeatherCacheRowToEntry(row);

    expect(entry).toMatchObject({
      cacheKey: '51.045,-114.072',
      latitude: 51.045,
      longitude: -114.072,
      cachedAt: '2026-08-14T22:45:00.000Z',
      weather: {
        relativeHumidityPercent: 70,
        surfacePressureHpa: 905,
        observedAt: '2026-08-14T22:30:00.000Z',
        source: 'cache',
      },
    });
    expect(mapWeatherCacheEntryToRow(entry)).toEqual(row);
  });

  it('rejects a row whose key does not match its coordinates', () => {
    expect(() =>
      mapWeatherCacheRowToEntry({ ...row, cache_key: '53.546,-113.494' }),
    ).toThrow(/Invalid weather cache row/);
  });
});
