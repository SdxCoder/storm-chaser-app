import { type WeatherSnapshot } from '../../weather/model/weather-snapshot';
import { stormTypes, type StormType } from '../model/storm-draft';
import { type StormRecord } from '../model/storm-record';
import { type StormRow } from './storm-row';

function isStormType(value: string): value is StormType {
  return stormTypes.some((stormType) => stormType === value);
}

function isIsoTimestamp(value: string): boolean {
  const date = new Date(value);
  return value.length > 0 && !Number.isNaN(date.getTime()) && date.toISOString() === value;
}

function isFiniteNumber(value: number | null): value is number {
  return value !== null && Number.isFinite(value);
}

function optionalFiniteNumber(value: number | null): number | null {
  if (value === null || Number.isFinite(value)) {
    return value;
  }
  throw new Error('Invalid nullable numeric value in storm database row.');
}

function mapWeatherSnapshot(row: StormRow): WeatherSnapshot | null {
  if (row.weather_observed_at === null && row.weather_source === null) {
    return null;
  }

  if (
    !isFiniteNumber(row.weather_temperature_celsius) ||
    !isFiniteNumber(row.weather_precipitation_mm) ||
    !isFiniteNumber(row.weather_wind_speed_kph) ||
    row.weather_observed_at === null ||
    !isIsoTimestamp(row.weather_observed_at) ||
    (row.weather_source !== 'live' && row.weather_source !== 'cache')
  ) {
    throw new Error('Invalid weather snapshot in storm database row.');
  }

  return {
    temperatureCelsius: row.weather_temperature_celsius,
    apparentTemperatureCelsius: optionalFiniteNumber(
      row.weather_apparent_temperature_celsius,
    ),
    relativeHumidityPercent: optionalFiniteNumber(row.weather_relative_humidity_percent),
    surfacePressureHpa: optionalFiniteNumber(row.weather_surface_pressure_hpa),
    precipitationMm: row.weather_precipitation_mm,
    windSpeedKph: row.weather_wind_speed_kph,
    windGustKph: optionalFiniteNumber(row.weather_wind_gust_kph),
    windDirectionDegrees: optionalFiniteNumber(row.weather_wind_direction_degrees),
    weatherCode: optionalFiniteNumber(row.weather_code),
    observedAt: row.weather_observed_at,
    source: row.weather_source,
  };
}

export function mapStormRowToRecord(row: StormRow): StormRecord {
  if (
    row.id.trim().length === 0 ||
    row.photo_uri.trim().length === 0 ||
    !isIsoTimestamp(row.captured_at) ||
    !isIsoTimestamp(row.created_at) ||
    !isIsoTimestamp(row.updated_at) ||
    !Number.isFinite(row.latitude) ||
    row.latitude < -90 ||
    row.latitude > 90 ||
    !Number.isFinite(row.longitude) ||
    row.longitude < -180 ||
    row.longitude > 180 ||
    !isStormType(row.storm_type)
  ) {
    throw new Error('Invalid storm database row.');
  }

  return {
    id: row.id,
    photoUri: row.photo_uri,
    capturedAt: row.captured_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    latitude: row.latitude,
    longitude: row.longitude,
    locationAccuracyMetres: optionalFiniteNumber(row.location_accuracy_metres),
    stormType: row.storm_type,
    notes: row.notes,
    observedConditions: row.observed_conditions,
    weatherSnapshot: mapWeatherSnapshot(row),
  };
}

export function mapStormRecordToRow(record: StormRecord): StormRow {
  const weather = record.weatherSnapshot;

  return {
    id: record.id,
    photo_uri: record.photoUri,
    captured_at: record.capturedAt,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
    latitude: record.latitude,
    longitude: record.longitude,
    location_accuracy_metres: record.locationAccuracyMetres,
    storm_type: record.stormType,
    notes: record.notes,
    observed_conditions: record.observedConditions,
    weather_temperature_celsius: weather?.temperatureCelsius ?? null,
    weather_apparent_temperature_celsius: weather?.apparentTemperatureCelsius ?? null,
    weather_relative_humidity_percent: weather?.relativeHumidityPercent ?? null,
    weather_surface_pressure_hpa: weather?.surfacePressureHpa ?? null,
    weather_precipitation_mm: weather?.precipitationMm ?? null,
    weather_wind_speed_kph: weather?.windSpeedKph ?? null,
    weather_wind_gust_kph: weather?.windGustKph ?? null,
    weather_wind_direction_degrees: weather?.windDirectionDegrees ?? null,
    weather_code: weather?.weatherCode ?? null,
    weather_observed_at: weather?.observedAt ?? null,
    weather_source: weather?.source ?? null,
  };
}
