export type WeatherCacheRow = {
  cache_key: string;
  latitude: number;
  longitude: number;
  temperature_celsius: number;
  apparent_temperature_celsius: number | null;
  relative_humidity_percent: number | null;
  surface_pressure_hpa: number | null;
  precipitation_mm: number;
  wind_speed_kph: number;
  wind_gust_kph: number | null;
  wind_direction_degrees: number | null;
  weather_code: number | null;
  observed_at: string;
  cached_at: string;
};
