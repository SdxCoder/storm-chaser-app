import { type PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DatabaseProvider } from '../../services/database/database-provider';
import { QueryProvider } from './query-provider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <DatabaseProvider>
        <QueryProvider>{children}</QueryProvider>
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}
