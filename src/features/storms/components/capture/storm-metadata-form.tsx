import { type Control, type FieldErrors } from 'react-hook-form';
import { Pressable, StyleSheet, Text } from 'react-native';

import { radius, spacing, typography } from '../../../../theme/theme';
import { useAppTheme } from '../../../../theme/use-app-theme';
import { type StormMetadata } from '../../model/storm-draft';
import { ObservedConditionsField } from './observed-conditions-field';
import { StormClassificationField } from './storm-classification-field';
import { StormNotesField } from './storm-notes-field';

type StormMetadataFormProps = {
  control: Control<StormMetadata>;
  errors: FieldErrors<StormMetadata>;
  hasWeatherSnapshot: boolean;
  isSubmitting: boolean;
  isWeatherError: boolean;
  isWeatherLoading: boolean;
  isWeatherRetrying: boolean;
  observedAt: string | null;
  onRefreshWeather: () => void;
  onSubmit: () => void;
  saveError: string | null;
  weatherSource: 'live' | 'cache' | null;
};

export function StormMetadataForm({
  control,
  errors,
  hasWeatherSnapshot,
  isSubmitting,
  isWeatherError,
  isWeatherLoading,
  isWeatherRetrying,
  observedAt,
  onRefreshWeather,
  onSubmit,
  saveError,
  weatherSource,
}: StormMetadataFormProps) {
  const { colors } = useAppTheme();

  return (
    <>
      <ObservedConditionsField
        control={control}
        errorMessage={errors.observedConditions?.message}
        hasWeatherSnapshot={hasWeatherSnapshot}
        isWeatherError={isWeatherError}
        isWeatherLoading={isWeatherLoading}
        isWeatherRetrying={isWeatherRetrying}
        observedAt={observedAt}
        onRefreshWeather={onRefreshWeather}
        weatherSource={weatherSource}
      />
      <StormClassificationField control={control} errorMessage={errors.stormType?.message} />
      <StormNotesField control={control} errorMessage={errors.notes?.message} />

      <Pressable
        accessibilityLabel="Save storm observation"
        accessibilityRole="button"
        accessibilityState={{ disabled: isSubmitting }}
        disabled={isSubmitting}
        onPress={onSubmit}
        style={({ pressed }) => [
          styles.completeButton,
          { backgroundColor: colors.action },
          (pressed || isSubmitting) && styles.dimmed,
        ]}
      >
        <Text style={[styles.completeButtonText, { color: colors.background }]}>
          {isSubmitting ? 'Saving observation…' : 'Save observation'}
        </Text>
      </Pressable>
      {saveError ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: colors.error }]}>
          {saveError}
        </Text>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  completeButton: {
    alignItems: 'center',
    borderRadius: radius.sm,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  completeButtonText: { fontSize: 17, fontWeight: '700' },
  dimmed: { opacity: 0.55 },
  error: { ...typography.body, fontWeight: '600', textAlign: 'center' },
});
