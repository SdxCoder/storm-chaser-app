import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography } from '../../../theme/theme';
import { useAppTheme } from '../../../theme/use-app-theme';
import { type StormRecord } from '../model/storm-record';
import { stormTypeLabel } from '../model/storm-type-label';

type StormCardProps = {
  onPress: () => void;
  record: StormRecord;
};

export function StormCard({ onPress, record }: StormCardProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityHint="Opens the saved storm details"
      accessibilityLabel={`${stormTypeLabel(record.stormType)} captured ${new Date(record.capturedAt).toLocaleString()}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.headingRow}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {stormTypeLabel(record.stormType)}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {new Date(record.capturedAt).toLocaleString()}
        </Text>
      </View>
      <Text numberOfLines={2} style={[styles.conditions, { color: colors.textPrimary }]}>
        {record.observedConditions}
      </Text>
      <Text style={[styles.coordinates, { color: colors.textSecondary }]}>
        {record.latitude.toFixed(5)}, {record.longitude.toFixed(5)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    padding: spacing.md,
  },
  headingRow: { gap: spacing.xs },
  title: { fontSize: 19, fontWeight: '700', lineHeight: 24 },
  date: { fontSize: 13, lineHeight: 18 },
  conditions: typography.body,
  coordinates: { fontSize: 13, lineHeight: 18 },
  pressed: { opacity: 0.65 },
});
