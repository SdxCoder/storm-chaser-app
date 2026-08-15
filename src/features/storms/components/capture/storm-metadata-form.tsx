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
  draftComplete: boolean;
  errors: FieldErrors<StormMetadata>;
  hasWeatherSnapshot: boolean;
  isSubmitting: boolean;
  isWeatherError: boolean;
  isWeatherLoading: boolean;
  isWeatherRetrying: boolean;
  observedAt: string | null;
  onRefreshWeather: () => void;
  onSubmit: () => void;
};

export function StormMetadataForm({
  control,
  draftComplete,
  errors,
  hasWeatherSnapshot,
  isSubmitting,
  isWeatherError,
  isWeatherLoading,
  isWeatherRetrying,
  observedAt,
  onRefreshWeather,
  onSubmit,
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
      />
      <StormClassificationField control={control} errorMessage={errors.stormType?.message} />
      <StormNotesField control={control} errorMessage={errors.notes?.message} />

      <Pressable
        accessibilityLabel="Complete storm draft"
        accessibilityRole="button"
        accessibilityState={{ disabled: isSubmitting || draftComplete }}
        disabled={isSubmitting || draftComplete}
        onPress={onSubmit}
        style={({ pressed }) => [
          styles.completeButton,
          { backgroundColor: colors.action },
          (pressed || isSubmitting || draftComplete) && styles.dimmed,
        ]}
      >
        <Text style={[styles.completeButtonText, { color: colors.background }]}>
          {draftComplete ? 'Draft complete' : 'Complete draft'}
        </Text>
      </Pressable>
      {draftComplete ? (
        <Text accessibilityRole="alert" style={[styles.success, { color: colors.textPrimary }]}>
          Draft complete. It remains in memory and has not been permanently saved.
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
  success: { ...typography.body, fontWeight: '600', textAlign: 'center' },
});
