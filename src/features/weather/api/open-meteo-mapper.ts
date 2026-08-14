import { type WeatherSnapshot } from '../model/weather-snapshot';
import {
  type OpenMeteoCurrentPayload,
  type OpenMeteoCurrentResponse,
} from './open-meteo-types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function integer(value: unknown): number | null {
  const number = finiteNumber(value);
  return number !== null && Number.isInteger(number) ? number : null;
}

function numberInRange(value: unknown, minimum: number, maximum = Number.POSITIVE_INFINITY) {
  const number = finiteNumber(value);
  return number !== null && number >= minimum && number <= maximum ? number : null;
}

function weatherCode(value: unknown): number | null {
  const code = integer(value);
  return code !== null && code >= 0 ? code : null;
}

function toIsoTimestamp(unixSeconds: unknown): string | null {
  const seconds = finiteNumber(unixSeconds);
  if (seconds === null) {
    return null;
  }

  const date = new Date(seconds * 1000);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function mapOpenMeteoCurrentResponse(response: unknown): WeatherSnapshot | null {
  if (!isRecord(response)) {
    return null;
  }

  const transport: OpenMeteoCurrentResponse = response;
  if (!isRecord(transport.current)) {
    return null;
  }

  const current: OpenMeteoCurrentPayload = transport.current;
  const temperatureCelsius = finiteNumber(current.temperature_2m);
  const precipitationMm = numberInRange(current.precipitation, 0);
  const windSpeedKph = numberInRange(current.wind_speed_10m, 0);
  const observedAt = toIsoTimestamp(current.time);

  if (
    temperatureCelsius === null ||
    precipitationMm === null ||
    windSpeedKph === null ||
    observedAt === null
  ) {
    return null;
  }

  return {
    temperatureCelsius,
    apparentTemperatureCelsius: finiteNumber(current.apparent_temperature),
    relativeHumidityPercent: numberInRange(current.relative_humidity_2m, 0, 100),
    surfacePressureHpa: numberInRange(current.surface_pressure, 0),
    precipitationMm,
    windSpeedKph,
    windGustKph: numberInRange(current.wind_gusts_10m, 0),
    windDirectionDegrees: numberInRange(current.wind_direction_10m, 0, 360),
    weatherCode: weatherCode(current.weather_code),
    observedAt,
    source: 'live',
  };
}
