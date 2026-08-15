import {
  NOTES_MAX_LENGTH,
  type StormDraft,
  isStormDraftComplete,
  validateNotes,
  validateObservedConditions,
  validateStormDraft,
  validateStormType,
} from '../src/features/storms/model/storm-draft';

const completeDraft: StormDraft = {
  temporaryPhotoUri: 'file:///temporary/capture.jpg',
  capturedAt: '2026-08-14T22:45:00.000Z',
  latitude: 51.0447,
  longitude: -114.0719,
  locationAccuracyMetres: 10,
  stormType: 'thunderstorm',
  notes: 'Moving northeast.',
  observedConditions: 'Dark rotating cloud base',
  weatherSnapshot: null,
};

describe('storm draft validation', () => {
  it('requires a storm classification', () => {
    expect(validateStormType(null)).toBe('Select a storm classification.');
    expect(validateStormType('hail')).toBeNull();
  });

  it('requires non-whitespace observed conditions', () => {
    expect(validateObservedConditions('  \n ')).toBe('Enter the conditions you observed.');
    expect(validateObservedConditions('Strong gusts')).toBeNull();
  });

  it('allows optional notes up to the documented maximum length', () => {
    expect(validateNotes('')).toBeNull();
    expect(validateNotes('a'.repeat(NOTES_MAX_LENGTH))).toBeNull();
    expect(validateNotes('a'.repeat(NOTES_MAX_LENGTH + 1))).toBe(
      `Notes must be ${NOTES_MAX_LENGTH} characters or fewer.`,
    );
  });

  it('accepts a complete draft without requiring API weather', () => {
    expect(validateStormDraft(completeDraft)).toEqual({});
    expect(isStormDraftComplete(completeDraft)).toBe(true);
  });

  it('reports incomplete capture, coordinate, and metadata fields', () => {
    const errors = validateStormDraft({
      ...completeDraft,
      temporaryPhotoUri: '',
      capturedAt: '',
      latitude: null,
      longitude: null,
      stormType: null,
      observedConditions: ' ',
    });

    expect(errors).toMatchObject({
      temporaryPhotoUri: expect.any(String),
      capturedAt: expect.any(String),
      latitude: expect.any(String),
      stormType: expect.any(String),
      observedConditions: expect.any(String),
    });
    expect(isStormDraftComplete({ ...completeDraft, latitude: null })).toBe(false);
  });
});
