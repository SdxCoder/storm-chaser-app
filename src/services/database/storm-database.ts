import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

export const STORM_DATABASE_NAME = 'storm-chaser.db';
export const STORM_DATABASE_VERSION = 3;

type UserVersionRow = {
  user_version: number;
};

export async function migrateStormDatabase(database: SQLiteDatabase): Promise<void> {
  await database.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const versionRow = await database.getFirstAsync<UserVersionRow>('PRAGMA user_version');
  let currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion > STORM_DATABASE_VERSION) {
    throw new Error('The storm database was created by a newer application version.');
  }

  if (currentVersion === 0) {
    await database.withExclusiveTransactionAsync(async (transaction) => {
      await transaction.execAsync(`
        CREATE TABLE IF NOT EXISTS storms (
          id TEXT PRIMARY KEY NOT NULL,
          photo_uri TEXT NOT NULL,
          captured_at TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          location_accuracy_metres REAL,
          storm_type TEXT NOT NULL CHECK (
            storm_type IN (
              'thunderstorm',
              'tornado',
              'hail',
              'heavy-rain',
              'high-wind',
              'snowstorm',
              'other'
            )
          ),
          notes TEXT NOT NULL,
          observed_conditions TEXT NOT NULL,
          weather_temperature_celsius REAL,
          weather_apparent_temperature_celsius REAL,
          weather_relative_humidity_percent REAL,
          weather_surface_pressure_hpa REAL,
          weather_precipitation_mm REAL,
          weather_wind_speed_kph REAL,
          weather_wind_gust_kph REAL,
          weather_wind_direction_degrees REAL,
          weather_code INTEGER,
          weather_observed_at TEXT,
          weather_source TEXT CHECK (weather_source IN ('live', 'cache')),
          CHECK (
            (weather_observed_at IS NULL
              AND weather_source IS NULL
              AND weather_temperature_celsius IS NULL
              AND weather_precipitation_mm IS NULL
              AND weather_wind_speed_kph IS NULL)
            OR
            (weather_observed_at IS NOT NULL
              AND weather_source IS NOT NULL
              AND weather_temperature_celsius IS NOT NULL
              AND weather_precipitation_mm IS NOT NULL
              AND weather_wind_speed_kph IS NOT NULL)
          )
        );

        CREATE INDEX IF NOT EXISTS storms_captured_at_index
          ON storms (captured_at DESC, created_at DESC);

        PRAGMA user_version = 1;
      `);
    });
    currentVersion = 1;
  }

  if (currentVersion === 1) {
    await database.withExclusiveTransactionAsync(async (transaction) => {
      await transaction.execAsync(`
        UPDATE storms
        SET photo_uri = 'storm-photo://' || substr(
          photo_uri,
          instr(photo_uri, '/storm-photos/') + length('/storm-photos/')
        )
        WHERE photo_uri LIKE 'file:%/storm-photos/%';

        PRAGMA user_version = 2;
      `);
    });
    currentVersion = 2;
  }

  if (currentVersion === 2) {
    await database.withExclusiveTransactionAsync(async (transaction) => {
      await transaction.execAsync(`
        CREATE TABLE IF NOT EXISTS weather_cache (
          cache_key TEXT PRIMARY KEY NOT NULL,
          latitude REAL NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
          longitude REAL NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
          temperature_celsius REAL NOT NULL,
          apparent_temperature_celsius REAL,
          relative_humidity_percent REAL,
          surface_pressure_hpa REAL,
          precipitation_mm REAL NOT NULL CHECK (precipitation_mm >= 0),
          wind_speed_kph REAL NOT NULL CHECK (wind_speed_kph >= 0),
          wind_gust_kph REAL,
          wind_direction_degrees REAL,
          weather_code INTEGER,
          observed_at TEXT NOT NULL,
          cached_at TEXT NOT NULL
        );

        PRAGMA user_version = 3;
      `);
    });
  }
}

export async function openStormDatabase(): Promise<SQLiteDatabase> {
  const database = await openDatabaseAsync(STORM_DATABASE_NAME);

  try {
    await migrateStormDatabase(database);
    return database;
  } catch (error: unknown) {
    await database.closeAsync().catch(() => undefined);
    throw error;
  }
}
