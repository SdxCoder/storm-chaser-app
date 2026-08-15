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
};

export function useStormMetadataForm({
  draft,
  locationStatus,
}: UseStormMetadataFormOptions) {
  const {
    control,
    formState: { errors, isSubmitting },
    getFieldState,
    getValues,
    handleSubmit,
    setValue,
    watch,
  } = useForm<StormMetadata>({ defaultValues: defaultMetadata, mode: 'onSubmit' });
  const [draftErrors, setDraftErrors] = useState<StormDraftErrors>({});
  const [draftComplete, setDraftComplete] = useState(false);
  const completionInProgress = useRef(false);
  const observedPrefillConsidered = useRef(false);
  const watchedMetadata = watch();

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
    completionInProgress.current = false;
    setDraftComplete(false);
  }, [watchedMetadata.notes, watchedMetadata.observedConditions, watchedMetadata.stormType]);

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

  const completeDraft: SubmitHandler<StormMetadata> = (metadata) => {
    if (completionInProgress.current) {
      return;
    }
    completionInProgress.current = true;

    const candidate: StormDraft = { ...draft, ...metadata };
    const validationErrors = validateStormDraft(candidate);
    setDraftErrors(validationErrors);
    setDraftComplete(Object.keys(validationErrors).length === 0);
    if (Object.keys(validationErrors).length > 0) {
      completionInProgress.current = false;
    }
  };

  const invalidMetadata: SubmitErrorHandler<StormMetadata> = () => {
    completionInProgress.current = false;
    setDraftErrors(validateStormDraft({ ...draft, ...getValues() }));
    setDraftComplete(false);
  };

  const resetCompletion = () => {
    completionInProgress.current = false;
    setDraftComplete(false);
  };

  return {
    control,
    draftComplete,
    draftErrors,
    errors,
    isSubmitting,
    resetCompletion,
    submitDraft: handleSubmit(completeDraft, invalidMetadata),
  };
}
