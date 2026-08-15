import { type WeatherForecastDay } from '../model/weather-forecast';
import {
  type OpenMeteoDailyForecastPayload,
  type OpenMeteoForecastResponse,
} from './open-meteo-forecast-types';

const FORECAST_DAY_LIMIT = 3;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function arrayValue(value: unknown, index: number): unknown {
  return Array.isArray(value) ? value[index] : undefined;
}

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function numberInRange(value: unknown, minimum: number, maximum = Number.POSITIVE_INFINITY) {
  const number = finiteNumber(value);
  return number !== null && number >= minimum && number <= maximum ? number : null;
}

function weatherCode(value: unknown): number | null {
  const number = finiteNumber(value);
  return number !== null && Number.isInteger(number) && number >= 0 ? number : null;
}

function forecastDate(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [yearText, monthText, dayText] = value.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? value
    : null;
}

export function mapOpenMeteoForecastResponse(response: unknown): WeatherForecastDay[] {
  if (!isRecord(response)) {
    return [];
  }

  const transport: OpenMeteoForecastResponse = response;
  if (!isRecord(transport.daily)) {
    return [];
  }

  const daily: OpenMeteoDailyForecastPayload = transport.daily;
  if (!Array.isArray(daily.time)) {
    return [];
  }

  return daily.time.slice(0, FORECAST_DAY_LIMIT).flatMap((dateValue, index) => {
    const date = forecastDate(dateValue);
    if (date === null) {
      return [];
    }

    let maximumTemperatureCelsius = finiteNumber(
      arrayValue(daily.temperature_2m_max, index),
    );
    let minimumTemperatureCelsius = finiteNumber(
      arrayValue(daily.temperature_2m_min, index),
    );
    if (
      maximumTemperatureCelsius !== null &&
      minimumTemperatureCelsius !== null &&
      maximumTemperatureCelsius < minimumTemperatureCelsius
    ) {
      maximumTemperatureCelsius = null;
      minimumTemperatureCelsius = null;
    }

    return [{
      date,
      weatherCode: weatherCode(arrayValue(daily.weather_code, index)),
      maximumTemperatureCelsius,
      minimumTemperatureCelsius,
      maximumPrecipitationProbabilityPercent: numberInRange(
        arrayValue(daily.precipitation_probability_max, index),
        0,
        100,
      ),
      precipitationTotalMm: numberInRange(arrayValue(daily.precipitation_sum, index), 0),
      maximumWindSpeedKph: numberInRange(arrayValue(daily.wind_speed_10m_max, index), 0),
      maximumWindGustKph: numberInRange(arrayValue(daily.wind_gusts_10m_max, index), 0),
    }];
  });
}
