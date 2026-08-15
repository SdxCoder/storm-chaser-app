import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography } from '../../../../theme/theme';
import { useAppTheme } from '../../../../theme/use-app-theme';
import { type LocationState } from '../../hooks/use-storm-draft';
import { CaptureActionButton, CaptureFieldError, CaptureSection } from './capture-ui';

type CaptureDetailsSectionProps = {
  capturedAt: string;
  capturedAtError?: string;
  latitude: number | null;
  location: LocationState;
  locationAccuracyMetres: number | null;
  locationError?: string;
  longitude: number | null;
  onOpenSettings: () => void;
  onRetry: () => void;
};

export function CaptureDetailsSection({
  capturedAt,
  capturedAtError,
  latitude,
  location,
  locationAccuracyMetres,
  locationError,
  longitude,
  onOpenSettings,
  onRetry,
}: CaptureDetailsSectionProps) {
  return (
    <CaptureSection title="Capture details">
      <DetailRow
        label="Captured at"
        value={capturedAt ? new Date(capturedAt).toLocaleString() : 'Waiting for photo'}
      />
      <CaptureFieldError message={capturedAtError} />
      <LocationDetails
        latitude={latitude}
        location={location}
        locationAccuracyMetres={locationAccuracyMetres}
        longitude={longitude}
        onOpenSettings={onOpenSettings}
        onRetry={onRetry}
      />
      <CaptureFieldError message={locationError} />
    </CaptureSection>
  );
}

type LocationDetailsProps = {
  latitude: number | null;
  longitude: number | null;
  locationAccuracyMetres: number | null;
  location: LocationState;
  onOpenSettings: () => void;
  onRetry: () => void;
};

function LocationDetails({
  latitude,
  location,
  locationAccuracyMetres,
  longitude,
  onOpenSettings,
  onRetry,
}: LocationDetailsProps) {
  const { colors } = useAppTheme();

  if (location.status === 'ready' && latitude !== null && longitude !== null) {
    return (
      <View accessible accessibilityLabel={`Coordinates ${latitude}, ${longitude}`}>
        <DetailRow label="Latitude" value={latitude.toFixed(5)} />
        <DetailRow label="Longitude" value={longitude.toFixed(5)} />
        <DetailRow
          label="Accuracy"
          value={
            locationAccuracyMetres === null
              ? 'Unavailable'
              : `About ${Math.round(locationAccuracyMetres)} metres`
          }
        />
      </View>
    );
  }
  if (location.status === 'loading') {
    return <Text style={[styles.helper, { color: colors.textSecondary }]}>Getting coordinates…</Text>;
  }
  if (location.status === 'idle') {
    return (
      <Text style={[styles.helper, { color: colors.textSecondary }]}>
        Coordinates are requested after a photo is taken.
      </Text>
    );
  }

  const permanentlyDenied = location.status === 'permission-denied' && !location.canAskAgain;
  return (
    <View>
      <Text accessibilityRole="alert" style={[styles.helper, { color: colors.error }]}>
        {location.status === 'permission-denied'
          ? 'Location permission denied. Your photo and entries are preserved.'
          : 'Coordinates unavailable. Check location services and try again; your draft is preserved.'}
      </Text>
      <CaptureActionButton
        label={permanentlyDenied ? 'Open location settings' : 'Try location again'}
        onPress={permanentlyDenied ? onOpenSettings : onRetry}
      />
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  helper: { ...typography.body, marginTop: spacing.sm },
  detailRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  detailLabel: { ...typography.body, flex: 1 },
  detailValue: {
    ...typography.body,
    flex: 2,
    fontWeight: '600',
    textAlign: 'right',
  },
});
