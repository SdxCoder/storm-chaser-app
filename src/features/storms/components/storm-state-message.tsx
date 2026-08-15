import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography } from '../../../theme/theme';
import { useAppTheme } from '../../../theme/use-app-theme';

type StormStateMessageProps = {
  actionLabel?: string;
  message: string;
  onAction?: () => void;
};

export function StormStateMessage({ actionLabel, message, onAction }: StormStateMessageProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <Text accessibilityRole="alert" style={[styles.message, { color: colors.textSecondary }]}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [
            styles.button,
            { borderColor: colors.action },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.buttonText, { color: colors.action }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1, gap: spacing.md, justifyContent: 'center' },
  message: { ...typography.body, textAlign: 'center' },
  button: {
    alignItems: 'center',
    borderRadius: radius.sm,
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.6 },
});
