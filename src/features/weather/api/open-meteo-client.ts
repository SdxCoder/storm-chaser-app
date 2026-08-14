import { mapOpenMeteoCurrentResponse } from './open-meteo-mapper';
import { type WeatherSnapshot } from '../model/weather-snapshot';

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 12_000;
const CURRENT_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'surface_pressure',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
].join(',');

export class WeatherRequestError extends Error {
  constructor() {
    super('Weather request failed');
    this.name = 'WeatherRequestError';
  }
}

export async function fetchCurrentWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherSnapshot | null> {
  const parameters = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: CURRENT_FIELDS,
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
    timeformat: 'unixtime',
    forecast_days: '1',
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${OPEN_METEO_URL}?${parameters.toString()}`, {
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new WeatherRequestError();
    }

    const payload: unknown = await response.json();
    return mapOpenMeteoCurrentResponse(payload);
  } catch (error: unknown) {
    if (error instanceof WeatherRequestError) {
      throw error;
    }
    throw new WeatherRequestError();
  } finally {
    clearTimeout(timeout);
  }
}
