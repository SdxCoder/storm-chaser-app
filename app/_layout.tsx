import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppProviders } from '../src/app/providers/app-providers';
import { useAppTheme } from '../src/theme/use-app-theme';

export default function RootLayout() {
  const { colorScheme, colors } = useAppTheme();

  return (
    <AppProviders>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerShown: false,
        }}
      />
      <StatusBar
        backgroundColor={colors.background}
        style={colorScheme === 'dark' ? 'light' : 'dark'}
      />
    </AppProviders>
  );
}
