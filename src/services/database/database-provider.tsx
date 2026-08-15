import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type SQLiteDatabase } from 'expo-sqlite';

import { radius, spacing, typography } from '../../theme/theme';
import { useAppTheme } from '../../theme/use-app-theme';
import { openStormDatabase } from './storm-database';

const DatabaseContext = createContext<SQLiteDatabase | null>(null);

type DatabaseState =
  | { status: 'loading' }
  | { status: 'ready'; database: SQLiteDatabase }
  | { status: 'error' };

export function DatabaseProvider({ children }: PropsWithChildren) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<DatabaseState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    let openedDatabase: SQLiteDatabase | null = null;

    setState({ status: 'loading' });
    void openStormDatabase()
      .then((database) => {
        openedDatabase = database;
        if (active) {
          setState({ status: 'ready', database });
        } else {
          void database.closeAsync().catch(() => undefined);
        }
      })
      .catch(() => {
        if (active) {
          setState({ status: 'error' });
        }
      });

    return () => {
      active = false;
      if (openedDatabase) {
        void openedDatabase.closeAsync().catch(() => undefined);
      }
    };
  }, [attempt]);

  if (state.status === 'loading') {
    return <DatabaseStatus message="Preparing saved storms…" />;
  }

  if (state.status === 'error') {
    return (
      <DatabaseStatus
        actionLabel="Try database again"
        message="Saved storms could not be opened. Try again before documenting a storm."
        onAction={() => setAttempt((current) => current + 1)}
      />
    );
  }

  return <DatabaseContext.Provider value={state.database}>{children}</DatabaseContext.Provider>;
}

export function useDatabase(): SQLiteDatabase {
  const database = useContext(DatabaseContext);

  if (database === null) {
    throw new Error('useDatabase must be used within DatabaseProvider.');
  }

  return database;
}

type DatabaseStatusProps = {
  actionLabel?: string;
  message: string;
  onAction?: () => void;
};

function DatabaseStatus({ actionLabel, message, onAction }: DatabaseStatusProps) {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.statusContent}>
        <Text accessibilityRole="alert" style={[styles.message, { color: colors.textPrimary }]}>
          {message}
        </Text>
        {actionLabel && onAction ? (
          <Pressable
            accessibilityRole="button"
            onPress={onAction}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.action },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.buttonText, { color: colors.background }]}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  statusContent: {
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  message: { ...typography.body, textAlign: 'center' },
  button: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: radius.sm,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.7 },
});
