import {
  mapStormRecordToRow,
  mapStormRowToRecord,
} from '../src/features/storms/data/storm-row-mapper';
import { type StormRecord } from '../src/features/storms/model/storm-record';

const record: StormRecord = {
  id: 'storm-test-123',
  photoUri: 'storm-photo://storm-test-123.jpg',
  capturedAt: '2026-08-14T22:40:00.000Z',
  createdAt: '2026-08-14T22:45:00.000Z',
  updatedAt: '2026-08-14T22:45:00.000Z',
  latitude: 51.0447,
  longitude: -114.0719,
  locationAccuracyMetres: 8.5,
  stormType: 'thunderstorm',
  notes: 'Moving northeast.',
  observedConditions: 'Rotating cloud base and strong gusts',
  weatherSnapshot: {
    temperatureCelsius: 18,
    apparentTemperatureCelsius: null,
    relativeHumidityPercent: null,
    surfacePressureHpa: 905.2,
    precipitationMm: 0.4,
    windSpeedKph: 25,
    windGustKph: null,
    windDirectionDegrees: 260,
    weatherCode: 95,
    observedAt: '2026-08-14T22:30:00.000Z',
    source: 'live',
  },
};

describe('storm SQLite row mapping', () => {
  it('maps every domain field to a platform-independent SQLite row and back', () => {
    const row = mapStormRecordToRow(record);

    expect(row).toMatchObject({
      id: record.id,
      photo_uri: record.photoUri,
      captured_at: record.capturedAt,
      latitude: record.latitude,
      longitude: record.longitude,
      storm_type: 'thunderstorm',
      weather_relative_humidity_percent: null,
      weather_surface_pressure_hpa: 905.2,
    });
    expect(mapStormRowToRecord(row)).toEqual(record);
  });

  it('preserves nullable humidity and surface pressure independently', () => {
    if (record.weatherSnapshot === null) {
      throw new Error('Test fixture requires a weather snapshot.');
    }
    const row = mapStormRecordToRow({
      ...record,
      weatherSnapshot: {
        ...record.weatherSnapshot,
        relativeHumidityPercent: 0,
        surfacePressureHpa: null,
      },
    });

    expect(row.weather_relative_humidity_percent).toBe(0);
    expect(row.weather_surface_pressure_hpa).toBeNull();
    expect(mapStormRowToRecord(row).weatherSnapshot).toMatchObject({
      relativeHumidityPercent: 0,
      surfacePressureHpa: null,
    });
  });

  it('round-trips an absent weather snapshot without fabricating weather', () => {
    const withoutWeather = { ...record, weatherSnapshot: null };
    const row = mapStormRecordToRow(withoutWeather);

    expect(row.weather_temperature_celsius).toBeNull();
    expect(row.weather_observed_at).toBeNull();
    expect(mapStormRowToRecord(row)).toEqual(withoutWeather);
  });
});
