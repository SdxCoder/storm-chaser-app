import { type SQLiteDatabase } from 'expo-sqlite';

import {
  migrateStormDatabase,
  STORM_DATABASE_VERSION,
} from '../src/services/database/storm-database';

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}));

function databaseWithVersion(version: number) {
  const transactionExecAsync = jest.fn().mockResolvedValue(undefined);
  const transaction = { execAsync: transactionExecAsync } as unknown as SQLiteDatabase;
  const withExclusiveTransactionAsync = jest
    .fn()
    .mockImplementation(async (task: (database: SQLiteDatabase) => Promise<void>) => {
      await task(transaction);
    });
  const database = {
    execAsync: jest.fn().mockResolvedValue(undefined),
    getFirstAsync: jest.fn().mockResolvedValue({ user_version: version }),
    withExclusiveTransactionAsync,
  } as unknown as SQLiteDatabase;

  return { database, transactionExecAsync, withExclusiveTransactionAsync };
}

describe('storm database migration', () => {
  it('creates the storms schema, upgrades photo URIs, and adds the weather cache', async () => {
    const { database, transactionExecAsync, withExclusiveTransactionAsync } =
      databaseWithVersion(0);

    await migrateStormDatabase(database);

    expect(withExclusiveTransactionAsync).toHaveBeenCalledTimes(3);
    expect(transactionExecAsync).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('CREATE TABLE IF NOT EXISTS storms'),
    );
    expect(transactionExecAsync).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('weather_relative_humidity_percent REAL'),
    );
    expect(transactionExecAsync).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('weather_surface_pressure_hpa REAL'),
    );
    expect(transactionExecAsync).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("SET photo_uri = 'storm-photo://'"),
    );
    expect(transactionExecAsync).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('CREATE TABLE IF NOT EXISTS weather_cache'),
    );
    expect(transactionExecAsync).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('cached_at TEXT NOT NULL'),
    );
    expect(transactionExecAsync).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining(`PRAGMA user_version = ${STORM_DATABASE_VERSION}`),
    );
  });

  it('upgrades legacy absolute photo URIs without rebuilding the schema', async () => {
    const { database, transactionExecAsync, withExclusiveTransactionAsync } =
      databaseWithVersion(1);

    await migrateStormDatabase(database);

    expect(withExclusiveTransactionAsync).toHaveBeenCalledTimes(2);
    expect(transactionExecAsync).toHaveBeenCalledWith(
      expect.stringContaining("WHERE photo_uri LIKE 'file:%/storm-photos/%'"),
    );
    expect(transactionExecAsync).not.toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS storms'),
    );
    expect(transactionExecAsync).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('CREATE TABLE IF NOT EXISTS weather_cache'),
    );
  });

  it('adds only the weather cache when upgrading from version two', async () => {
    const { database, transactionExecAsync, withExclusiveTransactionAsync } =
      databaseWithVersion(2);

    await migrateStormDatabase(database);

    expect(withExclusiveTransactionAsync).toHaveBeenCalledTimes(1);
    expect(transactionExecAsync).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS weather_cache'),
    );
    expect(transactionExecAsync).not.toHaveBeenCalledWith(
      expect.stringContaining("SET photo_uri = 'storm-photo://'"),
    );
  });

  it('is safe to run repeatedly once the schema is current', async () => {
    const { database, withExclusiveTransactionAsync } = databaseWithVersion(
      STORM_DATABASE_VERSION,
    );

    await migrateStormDatabase(database);
    await migrateStormDatabase(database);

    expect(withExclusiveTransactionAsync).not.toHaveBeenCalled();
  });

  it('refuses to modify a database created by a newer app version', async () => {
    const { database, withExclusiveTransactionAsync } = databaseWithVersion(
      STORM_DATABASE_VERSION + 1,
    );

    await expect(migrateStormDatabase(database)).rejects.toThrow(/newer application version/);
    expect(withExclusiveTransactionAsync).not.toHaveBeenCalled();
  });
});
