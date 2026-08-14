import { StyleSheet, Text } from 'react-native';

import { ScreenContainer } from '../../../components/screen-container';
import { spacing, typography } from '../../../theme/theme';
import { useAppTheme } from '../../../theme/use-app-theme';

export function CaptureScreen() {
  const { colors } = useAppTheme();

  return (
    <ScreenContainer title="Document Storm">
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Storm photo capture and observations will start here.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  description: {
    ...typography.body,
    marginTop: spacing.sm,
  },
});
