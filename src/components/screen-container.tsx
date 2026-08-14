import { type PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing, typography } from '../theme/theme';
import { useAppTheme } from '../theme/use-app-theme';

type ScreenContainerProps = PropsWithChildren<{
  title: string;
}>;

export function ScreenContainer({ children, title }: ScreenContainerProps) {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.textPrimary }]}>
          {title}
        </Text>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    ...typography.screenTitle,
  },
});
