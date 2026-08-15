import { useRouter } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, Text } from 'react-native';

import { ScreenContainer } from '../../../components/screen-container';
import { spacing, typography } from '../../../theme/theme';
import { useAppTheme } from '../../../theme/use-app-theme';
import { StormCard } from '../components/storm-card';
import { StormStateMessage } from '../components/storm-state-message';
import { useStormLog } from '../hooks/use-storm-log';

export function StormLogScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { isRefreshing, refresh, reload, state } = useStormLog();

  if (state.status === 'loading' && state.records.length === 0) {
    return (
      <ScreenContainer title="Storm Log">
        <StormStateMessage message="Loading saved storms…" />
      </ScreenContainer>
    );
  }

  if (state.status === 'error' && state.records.length === 0) {
    return (
      <ScreenContainer title="Storm Log">
        <StormStateMessage
          actionLabel="Try Storm Log again"
          message="Saved storms could not be loaded. Your records remain on this device."
          onAction={reload}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer title="Storm Log">
      {state.status === 'error' ? (
        <Text accessibilityRole="alert" style={[styles.refreshError, { color: colors.error }]}>
          The latest Storm Log refresh failed. Previously loaded records are still shown.
        </Text>
      ) : null}
      <FlatList
        contentContainerStyle={[
          styles.listContent,
          state.records.length === 0 && styles.emptyListContent,
        ]}
        data={state.records}
        keyExtractor={(record) => record.id}
        ListEmptyComponent={
          <StormStateMessage message="No saved storms yet. Document and save an observation to start your Storm Log." />
        }
        refreshControl={
          <RefreshControl
            colors={[colors.action]}
            onRefresh={refresh}
            refreshing={isRefreshing}
            tintColor={colors.action}
          />
        }
        renderItem={({ item }) => (
          <StormCard
            onPress={() =>
              router.push({ pathname: '/storms/[id]', params: { id: item.id } })
            }
            record={item}
          />
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: { gap: spacing.md, paddingBottom: spacing.xl, paddingTop: spacing.sm },
  emptyListContent: { flexGrow: 1 },
  refreshError: { ...typography.body, marginTop: spacing.sm },
});
