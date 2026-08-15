import { type Control, Controller } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing } from '../../../../theme/theme';
import { useAppTheme } from '../../../../theme/use-app-theme';
import {
  type StormMetadata,
  type StormType,
  stormTypes,
  validateStormType,
} from '../../model/storm-draft';
import { CaptureFieldError, CaptureSection } from './capture-ui';

const stormTypeLabels: Record<StormType, string> = {
  thunderstorm: 'Thunderstorm',
  tornado: 'Tornado',
  hail: 'Hail',
  'heavy-rain': 'Heavy rain',
  'high-wind': 'High wind',
  snowstorm: 'Snowstorm',
  other: 'Other',
};

type StormClassificationFieldProps = {
  control: Control<StormMetadata>;
  errorMessage?: string;
};

export function StormClassificationField({
  control,
  errorMessage,
}: StormClassificationFieldProps) {
  const { colors } = useAppTheme();

  return (
    <CaptureSection title="Storm classification">
      <Controller
        control={control}
        name="stormType"
        rules={{ validate: (value) => validateStormType(value) ?? true }}
        render={({ field: { onChange, value } }) => (
          <View accessibilityRole="radiogroup" style={styles.optionGrid}>
            {stormTypes.map((stormType) => {
              const selected = value === stormType;
              return (
                <Pressable
                  accessibilityLabel={stormTypeLabels[stormType]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  key={stormType}
                  onPress={() => onChange(stormType)}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: selected ? colors.action : colors.surface,
                      borderColor: selected ? colors.action : colors.border,
                    },
                    pressed && styles.dimmed,
                  ]}
                >
                  <Text style={{ color: selected ? colors.background : colors.textPrimary }}>
                    {stormTypeLabels[stormType]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      />
      <CaptureFieldError message={errorMessage} />
    </CaptureSection>
  );
}

const styles = StyleSheet.create({
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  option: {
    alignItems: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  dimmed: { opacity: 0.55 },
});
