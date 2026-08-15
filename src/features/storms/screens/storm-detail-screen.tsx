import { type ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '../../../components/screen-container';
import { radius, spacing, typography } from '../../../theme/theme';
import { useAppTheme } from '../../../theme/use-app-theme';
import { interpretWeatherCode } from '../../weather/model/weather-condition';
import { StormRecordPhoto } from '../components/storm-record-photo';
import { StormStateMessage } from '../components/storm-state-message';
import { useStormDetail } from '../hooks/use-storm-detail';
import { type StormRecord } from '../model/storm-record';
import { stormTypeLabel } from '../model/storm-type-label';

export function StormDetailScreen({ recordId }: { recordId: string | null }) {
  const router = useRouter();
  const { retry, state } = useStormDetail(recordId);

  return (
    <ScreenContainer title="Storm Detail">
      <BackButton onPress={() => router.back()} />
      {state.status === 'invalid-id' ? (
        <StormStateMessage message="This storm link has a missing or invalid record ID." />
      ) : state.status === 'loading' ? (
        <StormStateMessage message="Loading storm details…" />
      ) : state.status === 'not-found' ? (
        <StormStateMessage message="This saved storm record could not be found." />
      ) : state.status === 'error' ? (
        <StormStateMessage
          actionLabel="Try storm detail again"
          message="Storm details could not be loaded. Try again."
          onAction={retry}
        />
      ) : (
        <StormDetailContent record={state.record} />
      )}
    </ScreenContainer>
  );
}

function BackButton({ onPress }: { onPress: () => void }) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel="Back to Storm Log"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
    >
      <Text style={[styles.backText, { color: colors.action }]}>Back to Storm Log</Text>
    </Pressable>
  );
}

function StormDetailContent({ record }: { record: StormRecord }) {
  const { colors } = useAppTheme();
  const weather = record.weatherSnapshot;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <StormRecordPhoto photoUri={record.photoUri} />
      <DetailSection title="Observation">
        <DetailRow label="Classification" value={stormTypeLabel(record.stormType)} />
        <DetailRow label="Captured" value={new Date(record.capturedAt).toLocaleString()} />
        <DetailRow label="Created" value={new Date(record.createdAt).toLocaleString()} />
        <DetailRow label="Last updated" value={new Date(record.updatedAt).toLocaleString()} />
        <DetailRow label="Observation ID" value={record.id} />
      </DetailSection>
      <DetailSection title="Location">
        <DetailRow label="Latitude" value={record.latitude.toFixed(5)} />
        <DetailRow label="Longitude" value={record.longitude.toFixed(5)} />
        <DetailRow
          label="Accuracy"
          value={
            record.locationAccuracyMetres === null
              ? 'Unavailable'
              : `About ${Math.round(record.locationAccuracyMetres)} metres`
          }
        />
      </DetailSection>
      <DetailSection title="Observed conditions">
        <Text style={[styles.longText, { color: colors.textPrimary }]}>
          {record.observedConditions}
        </Text>
      </DetailSection>
      <DetailSection title="Notes">
        <Text style={[styles.longText, { color: colors.textPrimary }]}>
          {record.notes.trim().length === 0 ? 'No notes recorded.' : record.notes}
        </Text>
      </DetailSection>
      <DetailSection title="Weather snapshot">
        {weather === null ? (
          <Text style={[styles.longText, { color: colors.textSecondary }]}>No weather attached.</Text>
        ) : (
          <>
            <DetailRow label="Condition" value={interpretWeatherCode(weather.weatherCode)} />
            <DetailRow label="Temperature" value={`${weather.temperatureCelsius.toFixed(1)} °C`} />
            <DetailRow
              label="Feels like"
              value={formatOptionalMetric(weather.apparentTemperatureCelsius, '°C')}
            />
            <DetailRow
              label="Humidity"
              value={formatOptionalMetric(weather.relativeHumidityPercent, '%')}
            />
            <DetailRow
              label="Surface pressure"
              value={formatOptionalMetric(weather.surfacePressureHpa, 'hPa')}
            />
            <DetailRow label="Precipitation" value={`${weather.precipitationMm.toFixed(1)} mm`} />
            <DetailRow label="Wind speed" value={`${weather.windSpeedKph.toFixed(1)} km/h`} />
            <DetailRow
              label="Wind gust"
              value={formatOptionalMetric(weather.windGustKph, 'km/h')}
            />
            <DetailRow
              label="Wind direction"
              value={formatOptionalMetric(weather.windDirectionDegrees, '°')}
            />
            <DetailRow
              label="Weather code"
              value={weather.weatherCode === null ? 'Unavailable' : String(weather.weatherCode)}
            />
            <DetailRow label="Observed" value={new Date(weather.observedAt).toLocaleString()} />
            <DetailRow label="Source" value={weather.source === 'live' ? 'Live' : 'Cached'} />
          </>
        )}
      </DetailSection>
    </ScrollView>
  );
}

function formatOptionalMetric(value: number | null, unit: string): string {
  return value === null ? 'Unavailable' : `${value.toFixed(1)} ${unit}`;
}

function DetailSection({ children, title }: { children: ReactNode; title: string }) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <Text
        accessibilityRole="header"
        style={[styles.sectionTitle, { color: colors.textPrimary }]}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text selectable style={[styles.value, { color: colors.textPrimary }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: { alignSelf: 'flex-start', justifyContent: 'center', minHeight: 48 },
  backText: { fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.6 },
  scrollContent: { gap: spacing.md, paddingBottom: spacing.xl },
  section: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    padding: spacing.md,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', lineHeight: 26 },
  row: { flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between' },
  label: { ...typography.body, flex: 1 },
  value: { ...typography.body, flex: 2, fontWeight: '600', textAlign: 'right' },
  longText: typography.body,
});
