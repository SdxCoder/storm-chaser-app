import { useEffect, useRef, useState } from 'react';
import {
  type SubmitErrorHandler,
  type SubmitHandler,
  useForm,
} from 'react-hook-form';

import { interpretWeatherCode } from '../../weather/model/weather-condition';
import {
  type StormDraft,
  type StormDraftErrors,
  type StormMetadata,
  validateStormDraft,
} from '../model/storm-draft';
import { type CaptureDraftState, type LocationState } from './use-storm-draft';

const defaultMetadata: StormMetadata = {
  stormType: null,
  notes: '',
  observedConditions: '',
};

type UseStormMetadataFormOptions = {
  draft: CaptureDraftState;
  locationStatus: LocationState['status'];
  onSave: (draft: StormDraft) => Promise<boolean>;
};

export function useStormMetadataForm({
  draft,
  locationStatus,
  onSave,
}: UseStormMetadataFormOptions) {
  const {
    control,
    formState: { errors, isSubmitting },
    getFieldState,
    getValues,
    handleSubmit,
    reset,
    setValue,
  } = useForm<StormMetadata>({ defaultValues: defaultMetadata, mode: 'onSubmit' });
  const [draftErrors, setDraftErrors] = useState<StormDraftErrors>({});
  const submissionInProgress = useRef(false);
  const observedPrefillConsidered = useRef(false);

  useEffect(() => {
    const snapshot = draft.weatherSnapshot;
    if (snapshot === null || observedPrefillConsidered.current) {
      return;
    }

    observedPrefillConsidered.current = true;
    if (snapshot.weatherCode !== null && !getFieldState('observedConditions').isDirty) {
      setValue('observedConditions', interpretWeatherCode(snapshot.weatherCode), {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [draft.weatherSnapshot, getFieldState, setValue]);

  useEffect(() => {
    if (draft.temporaryPhotoUri) {
      setDraftErrors((current) => ({
        ...current,
        capturedAt: undefined,
        temporaryPhotoUri: undefined,
      }));
    }
  }, [draft.temporaryPhotoUri]);

  useEffect(() => {
    if (locationStatus === 'ready') {
      setDraftErrors((current) => ({ ...current, latitude: undefined }));
    }
  }, [locationStatus]);

  const saveDraft: SubmitHandler<StormMetadata> = async (metadata) => {
    if (submissionInProgress.current) {
      return;
    }
    submissionInProgress.current = true;

    const candidate: StormDraft = { ...draft, ...metadata };
    const validationErrors = validateStormDraft(candidate);
    setDraftErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      submissionInProgress.current = false;
      return;
    }

    try {
      const saved = await onSave(candidate);
      if (saved) {
        observedPrefillConsidered.current = false;
        setDraftErrors({});
        reset(defaultMetadata);
      }
    } finally {
      submissionInProgress.current = false;
    }
  };

  const invalidMetadata: SubmitErrorHandler<StormMetadata> = () => {
    submissionInProgress.current = false;
    setDraftErrors(validateStormDraft({ ...draft, ...getValues() }));
  };

  return {
    control,
    draftErrors,
    errors,
    isSubmitting,
    submitDraft: handleSubmit(saveDraft, invalidMetadata),
  };
}
