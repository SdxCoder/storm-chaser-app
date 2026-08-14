import { useColorScheme } from 'react-native';

import { darkColors, lightColors } from './theme';

export function useAppTheme() {
  const colorScheme = useColorScheme();

  return {
    colorScheme: colorScheme === 'dark' ? 'dark' : 'light',
    colors: colorScheme === 'dark' ? darkColors : lightColors,
  } as const;
}
