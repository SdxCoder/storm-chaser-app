import { type WeatherSnapshot } from '../../weather/model/weather-snapshot';

export const stormTypes = [
  'thunderstorm',
  'tornado',
  'hail',
  'heavy-rain',
  'high-wind',
  'snowstorm',
  'other',
] as const;

export type StormType = (typeof stormTypes)[number];

export type StormDraft = {
  temporaryPhotoUri: string;
  capturedAt: string;
  latitude: number | null;
  longitude: number | null;
  locationAccuracyMetres: number | null;
  stormType: StormType | null;
  notes: string;
  observedConditions: string;
  weatherSnapshot: WeatherSnapshot | null;
};

export type StormMetadata = Pick<StormDraft, 'stormType' | 'notes' | 'observedConditions'>;

export type StormDraftErrors = Partial<Record<keyof StormDraft, string>>;

export const NOTES_MAX_LENGTH = 500;

export function validateStormType(stormType: StormType | null): string | null {
  return stormType === null ? 'Select a storm classification.' : null;
}

export function validateObservedConditions(observedConditions: string): string | null {
  return observedConditions.trim().length === 0 ? 'Enter the conditions you observed.' : null;
}

export function validateNotes(notes: string): string | null {
  return notes.length > NOTES_MAX_LENGTH
    ? `Notes must be ${NOTES_MAX_LENGTH} characters or fewer.`
    : null;
}

function isValidTimestamp(value: string): boolean {
  if (value.length === 0) {
    return false;
  }

  const timestamp = new Date(value);
  return !Number.isNaN(timestamp.getTime()) && timestamp.toISOString() === value;
}

function isValidLatitude(value: number | null): value is number {
  return value !== null && Number.isFinite(value) && value >= -90 && value <= 90;
}

function isValidLongitude(value: number | null): value is number {
  return value !== null && Number.isFinite(value) && value >= -180 && value <= 180;
}

export function validateStormDraft(draft: StormDraft): StormDraftErrors {
  const errors: StormDraftErrors = {};
  const stormTypeError = validateStormType(draft.stormType);
  const observedConditionsError = validateObservedConditions(draft.observedConditions);
  const notesError = validateNotes(draft.notes);

  if (draft.temporaryPhotoUri.trim().length === 0) {
    errors.temporaryPhotoUri = 'Take a storm photo before completing the draft.';
  }
  if (!isValidTimestamp(draft.capturedAt)) {
    errors.capturedAt = 'A valid capture time is required.';
  }
  if (!isValidLatitude(draft.latitude) || !isValidLongitude(draft.longitude)) {
    errors.latitude = 'Current coordinates are required. Try location again.';
  }
  if (stormTypeError) {
    errors.stormType = stormTypeError;
  }
  if (observedConditionsError) {
    errors.observedConditions = observedConditionsError;
  }
  if (notesError) {
    errors.notes = notesError;
  }

  return errors;
}

export function isStormDraftComplete(draft: StormDraft): boolean {
  return Object.keys(validateStormDraft(draft)).length === 0;
}
