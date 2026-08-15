import { type SQLiteBindParams, type SQLiteDatabase } from 'expo-sqlite';

import { type StormRecord } from '../model/storm-record';
import { mapStormRecordToRow, mapStormRowToRecord } from './storm-row-mapper';
import { type StormRow } from './storm-row';

export type StormRepositoryResult<T> =
  | { status: 'success'; data: T }
  | { status: 'failure' };

const stormColumns = `
  id,
  photo_uri,
  captured_at,
  created_at,
  updated_at,
  latitude,
  longitude,
  location_accuracy_metres,
  storm_type,
  notes,
  observed_conditions,
  weather_temperature_celsius,
  weather_apparent_temperature_celsius,
  weather_relative_humidity_percent,
  weather_surface_pressure_hpa,
  weather_precipitation_mm,
  weather_wind_speed_kph,
  weather_wind_gust_kph,
  weather_wind_direction_degrees,
  weather_code,
  weather_observed_at,
  weather_source
`;

export async function insertStormRecord(
  database: SQLiteDatabase,
  record: StormRecord,
): Promise<StormRepositoryResult<StormRecord>> {
  const row = mapStormRecordToRow(record);
  const parameters: SQLiteBindParams = {
    $id: row.id,
    $photoUri: row.photo_uri,
    $capturedAt: row.captured_at,
    $createdAt: row.created_at,
    $updatedAt: row.updated_at,
    $latitude: row.latitude,
    $longitude: row.longitude,
    $locationAccuracyMetres: row.location_accuracy_metres,
    $stormType: row.storm_type,
    $notes: row.notes,
    $observedConditions: row.observed_conditions,
    $weatherTemperatureCelsius: row.weather_temperature_celsius,
    $weatherApparentTemperatureCelsius: row.weather_apparent_temperature_celsius,
    $weatherRelativeHumidityPercent: row.weather_relative_humidity_percent,
    $weatherSurfacePressureHpa: row.weather_surface_pressure_hpa,
    $weatherPrecipitationMm: row.weather_precipitation_mm,
    $weatherWindSpeedKph: row.weather_wind_speed_kph,
    $weatherWindGustKph: row.weather_wind_gust_kph,
    $weatherWindDirectionDegrees: row.weather_wind_direction_degrees,
    $weatherCode: row.weather_code,
    $weatherObservedAt: row.weather_observed_at,
    $weatherSource: row.weather_source,
  };

  try {
    await database.runAsync(
      `INSERT INTO storms (${stormColumns}) VALUES (
        $id,
        $photoUri,
        $capturedAt,
        $createdAt,
        $updatedAt,
        $latitude,
        $longitude,
        $locationAccuracyMetres,
        $stormType,
        $notes,
        $observedConditions,
        $weatherTemperatureCelsius,
        $weatherApparentTemperatureCelsius,
        $weatherRelativeHumidityPercent,
        $weatherSurfacePressureHpa,
        $weatherPrecipitationMm,
        $weatherWindSpeedKph,
        $weatherWindGustKph,
        $weatherWindDirectionDegrees,
        $weatherCode,
        $weatherObservedAt,
        $weatherSource
      )`,
      parameters,
    );
    return { status: 'success', data: record };
  } catch {
    return { status: 'failure' };
  }
}

export async function listStormRecords(
  database: SQLiteDatabase,
): Promise<StormRepositoryResult<StormRecord[]>> {
  try {
    const rows = await database.getAllAsync<StormRow>(
      `SELECT ${stormColumns} FROM storms ORDER BY captured_at DESC, created_at DESC`,
    );
    return { status: 'success', data: rows.map(mapStormRowToRecord) };
  } catch {
    return { status: 'failure' };
  }
}

export async function getStormRecordById(
  database: SQLiteDatabase,
  id: string,
): Promise<StormRepositoryResult<StormRecord | null>> {
  try {
    const row = await database.getFirstAsync<StormRow>(
      `SELECT ${stormColumns} FROM storms WHERE id = $id LIMIT 1`,
      { $id: id },
    );
    return { status: 'success', data: row === null ? null : mapStormRowToRecord(row) };
  } catch {
    return { status: 'failure' };
  }
}
