import { type WeatherSnapshot } from './weather-snapshot';

export type WeatherCacheEntry = {
  cacheKey: string;
  latitude: number;
  longitude: number;
  weather: WeatherSnapshot;
  cachedAt: string;
};
