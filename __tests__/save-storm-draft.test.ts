import { type SQLiteDatabase } from 'expo-sqlite';

import { insertStormRecord } from '../src/features/storms/data/storm-repository';
import { type StormDraft } from '../src/features/storms/model/storm-draft';
import { saveStormDraft } from '../src/features/storms/services/save-storm-draft';
import {
  copyStormPhotoToDurableStorage,
  removeDurableStormPhoto,
} from '../src/services/photo-storage/storm-photo-storage';

jest.mock('../src/features/storms/data/storm-repository', () => ({
  insertStormRecord: jest.fn(),
}));

jest.mock('../src/services/photo-storage/storm-photo-storage', () => ({
  copyStormPhotoToDurableStorage: jest.fn(),
  removeDurableStormPhoto: jest.fn(),
}));

const database = {} as unknown as SQLiteDatabase;
const draft: StormDraft = {
  temporaryPhotoUri: 'file:///temporary/capture.jpg',
  capturedAt: '2026-08-14T22:40:00.000Z',
  latitude: 51.0447,
  longitude: -114.0719,
  locationAccuracyMetres: 8,
  stormType: 'hail',
  notes: 'Moving northeast.',
  observedConditions: 'Large hail with strong wind',
  weatherSnapshot: {
    temperatureCelsius: 18,
    apparentTemperatureCelsius: 17,
    relativeHumidityPercent: null,
    surfacePressureHpa: null,
    precipitationMm: 1.2,
    windSpeedKph: 25,
    windGustKph: 42,
    windDirectionDegrees: 260,
    weatherCode: 96,
    observedAt: '2026-08-14T22:30:00.000Z',
    source: 'live',
  },
};

describe('saveStormDraft', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-08-14T22:45:00.000Z'));
    jest.mocked(copyStormPhotoToDurableStorage).mockImplementation(async (_source, stormId) => ({
      status: 'success',
      durablePhotoUri: `file:///documents/storm-photos/${stormId}.jpg`,
      storedPhotoUri: `storm-photo://${stormId}.jpg`,
    }));
    jest.mocked(insertStormRecord).mockImplementation(async (_database, record) => ({
      status: 'success',
      data: record,
    }));
    jest.mocked(removeDurableStormPhoto).mockResolvedValue({ status: 'removed' });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('copies the temporary photo before inserting a record with only the durable URI', async () => {
    const result = await saveStormDraft(database, draft);

    expect(copyStormPhotoToDurableStorage).toHaveBeenCalledWith(
      draft.temporaryPhotoUri,
      expect.stringMatching(/^storm-/),
    );
    expect(insertStormRecord).toHaveBeenCalledWith(
      database,
      expect.objectContaining({
        photoUri: expect.stringMatching(/^storm-photo:\/\/storm-/),
        createdAt: '2026-08-14T22:45:00.000Z',
        updatedAt: '2026-08-14T22:45:00.000Z',
      }),
    );
    expect(insertStormRecord).not.toHaveBeenCalledWith(
      database,
      expect.objectContaining({ photoUri: draft.temporaryPhotoUri }),
    );
    expect(removeDurableStormPhoto).not.toHaveBeenCalled();
    expect(result.status).toBe('success');
  });

  it('deletes only the newly copied durable photo after insertion fails and preserves the draft', async () => {
    const originalDraft = structuredClone(draft);
    jest.mocked(insertStormRecord).mockResolvedValue({ status: 'failure' });

    const result = await saveStormDraft(database, draft);
    const copiedUri = jest.mocked(copyStormPhotoToDurableStorage).mock.results[0]?.value;

    expect(result).toEqual({ status: 'failure', reason: 'database', cleanupFailed: false });
    expect(removeDurableStormPhoto).toHaveBeenCalledTimes(1);
    expect(removeDurableStormPhoto).toHaveBeenCalledWith(
      expect.stringContaining('/documents/storm-photos/storm-'),
    );
    expect(removeDurableStormPhoto).not.toHaveBeenCalledWith(draft.temporaryPhotoUri);
    expect(copiedUri).toBeDefined();
    expect(draft).toEqual(originalDraft);
  });

  it('does not insert a record when durable photo copying fails', async () => {
    jest.mocked(copyStormPhotoToDurableStorage).mockResolvedValue({ status: 'failure' });

    await expect(saveStormDraft(database, draft)).resolves.toEqual({
      status: 'failure',
      reason: 'photo-copy',
    });
    expect(insertStormRecord).not.toHaveBeenCalled();
    expect(removeDurableStormPhoto).not.toHaveBeenCalled();
  });
});
