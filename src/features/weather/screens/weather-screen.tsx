import { StyleSheet, Text } from 'react-native';

import { ScreenContainer } from '../../../components/screen-container';
import { spacing, typography } from '../../../theme/theme';
import { useAppTheme } from '../../../theme/use-app-theme';

export function WeatherScreen() {
  const { colors } = useAppTheme();

  return (
    <ScreenContainer title="Weather">
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Current local weather will appear here.
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
