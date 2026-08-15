import { KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, Text } from 'react-native';

import { ScreenContainer } from '../../../components/screen-container';
import { spacing, typography } from '../../../theme/theme';
import { useAppTheme } from '../../../theme/use-app-theme';
import { CaptureDetailsSection } from '../components/capture/capture-details-section';
import { StormMetadataForm } from '../components/capture/storm-metadata-form';
import { StormPhotoSection } from '../components/capture/storm-photo-section';
import { useStormDraft } from '../hooks/use-storm-draft';
import { useStormMetadataForm } from '../hooks/use-storm-metadata-form';

export function CaptureScreen() {
  const { colors } = useAppTheme();
  const { camera, draft, location, requestCamera, requestLocation, weather } = useStormDraft();
  const metadataForm = useStormMetadataForm({
    draft,
    locationStatus: location.status,
  });

  const openSettings = () => {
    void Linking.openSettings().catch(() => undefined);
  };

  const takePhoto = () => {
    metadataForm.resetCompletion();
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
          <Text style={[styles.intro, { color: colors.textSecondary }]}>
            Take one photo, then document what you observe. Nothing is permanently saved at this
            stage.
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
            draftComplete={metadataForm.draftComplete}
            errors={metadataForm.errors}
            hasWeatherSnapshot={draft.weatherSnapshot !== null}
            isSubmitting={metadataForm.isSubmitting}
            isWeatherError={weather.isError}
            isWeatherLoading={weather.isPending && draft.latitude !== null}
            isWeatherRetrying={weather.isRefetching}
            observedAt={draft.weatherSnapshot?.observedAt ?? null}
            onRefreshWeather={() => void weather.refetch()}
            onSubmit={metadataForm.submitDraft}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { gap: spacing.md, paddingBottom: spacing.xl, paddingTop: spacing.sm },
  intro: typography.body,
});
