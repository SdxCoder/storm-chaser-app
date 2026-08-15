import { StyleSheet, Text, View } from 'react-native';

import { useOnlineStatus } from '../services/connectivity/use-online-status';
import { radius, spacing, typography } from '../theme/theme';
import { useAppTheme } from '../theme/use-app-theme';

export function OfflineBanner({ message }: { message: string }) {
  const { colors } = useAppTheme();
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <View
      accessible
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[
        styles.banner,
        { backgroundColor: colors.surfaceElevated, borderColor: colors.warning },
      ]}
    >
      <Text style={[styles.title, { color: colors.warning }]}>Offline</Text>
      <Text style={[styles.message, { color: colors.textPrimary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    padding: spacing.md,
  },
  title: { fontSize: 16, fontWeight: '700', lineHeight: 22 },
  message: typography.body,
});
