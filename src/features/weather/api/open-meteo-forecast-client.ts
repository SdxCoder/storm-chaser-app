import { type WeatherForecastDay } from '../model/weather-forecast';
import { mapOpenMeteoForecastResponse } from './open-meteo-forecast-mapper';

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 12_000;
const DAILY_FIELDS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_probability_max',
  'precipitation_sum',
  'wind_speed_10m_max',
  'wind_gusts_10m_max',
].join(',');

export class ForecastRequestError extends Error {
  constructor() {
    super('Forecast request failed');
    this.name = 'ForecastRequestError';
  }
}

export async function fetchWeatherForecast(
  latitude: number,
  longitude: number,
): Promise<WeatherForecastDay[]> {
  const parameters = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: DAILY_FIELDS,
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
    timezone: 'auto',
    forecast_days: '3',
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${OPEN_METEO_URL}?${parameters.toString()}`, {
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new ForecastRequestError();
    }

    const payload: unknown = await response.json();
    return mapOpenMeteoForecastResponse(payload);
  } catch (error: unknown) {
    if (error instanceof ForecastRequestError) {
      throw error;
    }
    throw new ForecastRequestError();
  } finally {
    clearTimeout(timeout);
  }
}
