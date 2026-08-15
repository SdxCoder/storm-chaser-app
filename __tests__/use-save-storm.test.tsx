import { act, renderHook } from '@testing-library/react-native';

import { useSaveStorm } from '../src/features/storms/hooks/use-save-storm';
import { type StormDraft } from '../src/features/storms/model/storm-draft';
import { type StormRecord } from '../src/features/storms/model/storm-record';
import { saveStormDraft } from '../src/features/storms/services/save-storm-draft';

jest.mock('../src/services/database/database-provider', () => ({
  useDatabase: () => ({ databaseName: 'test' }),
}));

jest.mock('../src/features/storms/services/save-storm-draft', () => ({
  saveStormDraft: jest.fn(),
}));

const draft = {
  temporaryPhotoUri: 'file:///temporary/capture.jpg',
  capturedAt: '2026-08-14T22:40:00.000Z',
  latitude: 51.0447,
  longitude: -114.0719,
  locationAccuracyMetres: 8,
  stormType: 'hail',
  notes: '',
  observedConditions: 'Large hail',
  weatherSnapshot: null,
} satisfies StormDraft;

const record: StormRecord = {
  id: 'storm-test-123',
  photoUri: 'storm-photo://storm-test-123.jpg',
  capturedAt: draft.capturedAt,
  createdAt: '2026-08-14T22:45:00.000Z',
  updatedAt: '2026-08-14T22:45:00.000Z',
  latitude: draft.latitude,
  longitude: draft.longitude,
  locationAccuracyMetres: draft.locationAccuracyMetres,
  stormType: draft.stormType,
  notes: draft.notes,
  observedConditions: draft.observedConditions,
  weatherSnapshot: null,
};

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
}

describe('useSaveStorm', () => {
  it('prevents a second save while the first save is running', async () => {
    const pending = deferred<{ status: 'success'; record: StormRecord }>();
    jest.mocked(saveStormDraft).mockReturnValue(pending.promise);
    const { result } = renderHook(() => useSaveStorm());

    let firstSave: Promise<StormRecord | null> = Promise.resolve(null);
    let duplicateSave: Promise<StormRecord | null> = Promise.resolve(null);
    act(() => {
      firstSave = result.current.save(draft);
      duplicateSave = result.current.save(draft);
    });

    expect(saveStormDraft).toHaveBeenCalledTimes(1);
    await expect(duplicateSave).resolves.toBeNull();

    await act(async () => {
      pending.resolve({ status: 'success', record });
      await firstSave;
    });

    expect(result.current.state).toEqual({ status: 'success', record });
  });
});
