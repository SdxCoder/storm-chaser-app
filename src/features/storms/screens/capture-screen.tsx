import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, Text } from 'react-native';

import { OfflineBanner } from '../../../components/offline-banner';
import { ScreenContainer } from '../../../components/screen-container';
import { spacing, typography } from '../../../theme/theme';
import { useAppTheme } from '../../../theme/use-app-theme';
import { CaptureDetailsSection } from '../components/capture/capture-details-section';
import { StormMetadataForm } from '../components/capture/storm-metadata-form';
import { StormPhotoSection } from '../components/capture/storm-photo-section';
import { useStormDraft } from '../hooks/use-storm-draft';
import { useStormMetadataForm } from '../hooks/use-storm-metadata-form';
import { useSaveStorm } from '../hooks/use-save-storm';
import { type StormDraft } from '../model/storm-draft';

export function CaptureScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { camera, draft, location, requestCamera, requestLocation, resetDraft, weather } =
    useStormDraft();
  const { save, state: saveState } = useSaveStorm();
  const saveDraft = useCallback(
    async (candidate: StormDraft) => {
      const record = await save(candidate);
      if (record === null) {
        return false;
      }

      resetDraft();
      router.replace('/(tabs)/storm-log');
      return true;
    },
    [resetDraft, router, save],
  );
  const metadataForm = useStormMetadataForm({
    draft,
    locationStatus: location.status,
    onSave: saveDraft,
  });

  const openSettings = () => {
    void Linking.openSettings().catch(() => undefined);
  };

  const takePhoto = () => {
    void requestCamera(camera.status === 'permission-denied' && camera.canAskAgain);
  };

  const retryLocation = () => {
    void requestLocation(location.status === 'permission-denied' && location.canAskAgain);
  };

  return (
    <ScreenContainer title="Document Storm">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={spacing.md}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <OfflineBanner
            message="Storms can still be captured and saved using the last captured weather or manual observed conditions."
          />
          <Text style={[styles.intro, { color: colors.textSecondary }]}>
            Take one photo, document what you observe, then save it securely on this device.
          </Text>

          <StormPhotoSection
            camera={camera}
            error={metadataForm.draftErrors.temporaryPhotoUri}
            onOpenSettings={openSettings}
            onTakePhoto={takePhoto}
            temporaryPhotoUri={draft.temporaryPhotoUri}
          />
          <CaptureDetailsSection
            capturedAt={draft.capturedAt}
            capturedAtError={metadataForm.draftErrors.capturedAt}
            latitude={draft.latitude}
            location={location}
            locationAccuracyMetres={draft.locationAccuracyMetres}
            locationError={metadataForm.draftErrors.latitude}
            longitude={draft.longitude}
            onOpenSettings={openSettings}
            onRetry={retryLocation}
          />
          <StormMetadataForm
            control={metadataForm.control}
            errors={metadataForm.errors}
            hasWeatherSnapshot={draft.weatherSnapshot !== null}
            isSubmitting={metadataForm.isSubmitting}
            isWeatherError={weather.isError}
            isWeatherLoading={weather.isPending && draft.latitude !== null}
            isWeatherRetrying={weather.isRefetching}
            observedAt={draft.weatherSnapshot?.observedAt ?? null}
            onRefreshWeather={() => void weather.refetch()}
            onSubmit={metadataForm.submitDraft}
            saveError={saveErrorMessage(saveState)}
            weatherSource={draft.weatherSnapshot?.source ?? null}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function saveErrorMessage(saveState: ReturnType<typeof useSaveStorm>['state']): string | null {
  if (saveState.status !== 'error') {
    return null;
  }

  if (saveState.reason === 'photo-copy') {
    return 'The photo could not be copied into durable storage. Your draft is preserved; try Save again.';
  }
  if (saveState.reason === 'invalid-draft') {
    return 'The observation is incomplete. Review the highlighted fields and try again.';
  }
  if (saveState.cleanupFailed) {
    return 'The record could not be saved. Your draft is preserved, but automatic photo cleanup was incomplete. Try Save again.';
  }
  return 'The record could not be saved. Your draft and temporary photo are preserved; try Save again.';
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { gap: spacing.md, paddingBottom: spacing.xl, paddingTop: spacing.sm },
  intro: typography.body,
});
