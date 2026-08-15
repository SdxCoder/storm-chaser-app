import { Image, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography } from '../../../../theme/theme';
import { useAppTheme } from '../../../../theme/use-app-theme';
import { type CameraState } from '../../hooks/use-storm-draft';
import { CaptureActionButton, CaptureFieldError, CaptureSection } from './capture-ui';

type StormPhotoSectionProps = {
  camera: CameraState;
  error?: string;
  onOpenSettings: () => void;
  onTakePhoto: () => void;
  temporaryPhotoUri: string;
};

export function StormPhotoSection({
  camera,
  error,
  onOpenSettings,
  onTakePhoto,
  temporaryPhotoUri,
}: StormPhotoSectionProps) {
  const { colors } = useAppTheme();
  const actionLabel =
    camera.status === 'launching'
      ? 'Opening camera…'
      : camera.status === 'permission-denied'
        ? camera.canAskAgain
          ? 'Try camera permission again'
          : 'Camera permission required'
        : camera.status === 'unavailable'
          ? 'Try camera again'
          : temporaryPhotoUri
            ? 'Retake storm photo'
            : 'Take storm photo';

  return (
    <CaptureSection title="Storm photo">
      {temporaryPhotoUri ? (
        <Image
          accessibilityLabel="Captured storm photo preview"
          accessibilityRole="image"
          source={{ uri: temporaryPhotoUri }}
          style={[styles.preview, { backgroundColor: colors.surfaceElevated }]}
        />
      ) : (
        <View
          accessible
          accessibilityLabel="No storm photo captured"
          style={[styles.photoPlaceholder, { backgroundColor: colors.surfaceElevated }]}
        >
          <Text style={[styles.secondaryText, { color: colors.textSecondary }]}>No photo yet</Text>
        </View>
      )}
      <CaptureActionButton
        disabled={
          camera.status === 'launching' ||
          (camera.status === 'permission-denied' && !camera.canAskAgain)
        }
        label={actionLabel}
        onPress={onTakePhoto}
      />
      <CameraMessage camera={camera} onOpenSettings={onOpenSettings} />
      <CaptureFieldError message={error} />
    </CaptureSection>
  );
}

type CameraMessageProps = {
  camera: CameraState;
  onOpenSettings: () => void;
};

function CameraMessage({ camera, onOpenSettings }: CameraMessageProps) {
  const { colors } = useAppTheme();

  if (camera.status === 'idle' || camera.status === 'launching') {
    return null;
  }
  if (camera.status === 'canceled') {
    return (
      <Text accessibilityLiveRegion="polite" style={[styles.helper, { color: colors.textSecondary }]}>
        Camera closed without taking a photo. Your draft is unchanged.
      </Text>
    );
  }
  if (camera.status === 'unavailable') {
    return (
      <Text accessibilityRole="alert" style={[styles.helper, { color: colors.error }]}>
        Camera unavailable. Check that this device has an available camera, then try again.
      </Text>
    );
  }

  return (
    <View>
      <Text accessibilityRole="alert" style={[styles.helper, { color: colors.error }]}>
        Camera permission denied. Camera access is required to document a storm photo.
      </Text>
      {!camera.canAskAgain ? (
        <CaptureActionButton label="Open camera settings" onPress={onOpenSettings} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    borderRadius: radius.md,
    height: 240,
    resizeMode: 'cover',
    width: '100%',
  },
  photoPlaceholder: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 160,
    justifyContent: 'center',
  },
  secondaryText: typography.body,
  helper: { ...typography.body, marginTop: spacing.sm },
});
