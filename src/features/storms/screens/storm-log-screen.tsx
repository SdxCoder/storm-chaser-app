import { StyleSheet, Text } from 'react-native';

import { ScreenContainer } from '../../../components/screen-container';
import { spacing, typography } from '../../../theme/theme';
import { useAppTheme } from '../../../theme/use-app-theme';

export function StormLogScreen() {
  const { colors } = useAppTheme();

  return (
    <ScreenContainer title="Storm Log">
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Saved storm observations will appear here.
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
