import { type SQLiteDatabase } from 'expo-sqlite';

import {
  copyStormPhotoToDurableStorage,
  removeDurableStormPhoto,
} from '../../../services/photo-storage/storm-photo-storage';
import { insertStormRecord } from '../data/storm-repository';
import { type StormDraft, validateStormDraft } from '../model/storm-draft';
import { type StormRecord } from '../model/storm-record';

export type SaveStormDraftResult =
  | { status: 'success'; record: StormRecord }
  | { status: 'failure'; reason: 'invalid-draft' | 'photo-copy' | 'database'; cleanupFailed?: boolean };

export function createStormRecordId(now = Date.now(), random = Math.random()): string {
  const timePart = now.toString(36);
  const randomPart = Math.floor(random * Number.MAX_SAFE_INTEGER)
    .toString(36)
    .padStart(11, '0');
  return `storm-${timePart}-${randomPart}`;
}

export async function saveStormDraft(
  database: SQLiteDatabase,
  draft: StormDraft,
): Promise<SaveStormDraftResult> {
  const errors = validateStormDraft(draft);
  if (
    Object.keys(errors).length > 0 ||
    draft.stormType === null ||
    draft.latitude === null ||
    draft.longitude === null
  ) {
    return { status: 'failure', reason: 'invalid-draft' };
  }

  const id = createStormRecordId();
  const copiedPhoto = await copyStormPhotoToDurableStorage(draft.temporaryPhotoUri, id);
  if (copiedPhoto.status === 'failure') {
    return { status: 'failure', reason: 'photo-copy' };
  }

  const timestamp = new Date().toISOString();
  const record: StormRecord = {
    id,
    photoUri: copiedPhoto.storedPhotoUri,
    capturedAt: draft.capturedAt,
    createdAt: timestamp,
    updatedAt: timestamp,
    latitude: draft.latitude,
    longitude: draft.longitude,
    locationAccuracyMetres: draft.locationAccuracyMetres,
    stormType: draft.stormType,
    notes: draft.notes,
    observedConditions: draft.observedConditions,
    weatherSnapshot: draft.weatherSnapshot === null ? null : { ...draft.weatherSnapshot },
  };

  const insertion = await insertStormRecord(database, record).catch(
    () => ({ status: 'failure' }) as const,
  );
  if (insertion.status === 'failure') {
    const cleanup = await removeDurableStormPhoto(copiedPhoto.durablePhotoUri).catch(
      () => ({ status: 'failure' }) as const,
    );
    return {
      status: 'failure',
      reason: 'database',
      cleanupFailed: cleanup.status === 'failure',
    };
  }

  return { status: 'success', record };
}
