import {
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { OfflineBanner } from '../../../components/offline-banner';
import { ScreenContainer } from '../../../components/screen-container';
import { useOnlineStatus } from '../../../services/connectivity/use-online-status';
import { radius, spacing, typography } from '../../../theme/theme';
import { useAppTheme } from '../../../theme/use-app-theme';
import {
  OfflineWeatherUnavailableError,
  WeatherCacheReadError,
} from '../api/retrieve-current-weather';
import { WeatherMetrics } from '../components/weather-metrics';
import { useCurrentWeatherFlow } from '../hooks/use-current-weather-flow';

export function WeatherScreen() {
  const { colors } = useAppTheme();
  const isOnline = useOnlineStatus();
  const { location, requestLocation, weather } = useCurrentWeatherFlow();

  const retryLocation = () => {
    void requestLocation(true);
  };

  const openSettings = () => {
    void Linking.openSettings().catch(() => undefined);
  };

  const retryWeather = () => {
    void weather.refetch();
  };

  const locationLoading = location.status === 'loading';
  const initialWeatherLoading = location.status === 'ready' && weather.isPending;
  const showInitialLoading = locationLoading || initialWeatherLoading;

  let content;
  if (showInitialLoading) {
    content = (
      <StatusPanel
        message={
          locationLoading
            ? 'Getting your current location…'
            : weather.failureCount > 0
              ? 'The weather request failed. Trying once more…'
              : 'Loading current weather…'
        }
        title={weather.failureCount > 0 ? 'Retrying weather' : 'Loading'}
      />
    );
  } else if (location.status === 'permission-denied') {
    content = (
      <StatusPanel
        actionLabel={location.canAskAgain ? 'Try permission again' : 'Open Settings'}
        message="Location permission is needed to show weather for where you are. You can enable it in Settings."
        onAction={location.canAskAgain ? retryLocation : openSettings}
        title="Location permission denied"
      />
    );
  } else if (location.status === 'unavailable') {
    content = (
      <StatusPanel
        actionLabel="Try location again"
        message="Turn on location services and make sure the device can determine its position."
        onAction={retryLocation}
        title="Location unavailable"
      />
    );
  } else if (weather.data) {
    content = (
      <View>
        {weather.isRefetching ? (
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.refreshing, { color: colors.action }]}
          >
            Refreshing weather…
          </Text>
        ) : null}
        {weather.isError ? (
          <Text accessibilityRole="alert" style={[styles.refreshError, { color: colors.error }]}>
            Could not refresh. Showing the last weather received.
          </Text>
        ) : null}
        <WeatherMetrics weather={weather.data} />
      </View>
    );
  } else if (!isOnline && weather.error instanceof OfflineWeatherUnavailableError) {
    content = (
      <StatusPanel
        actionLabel={weather.isRefetching ? 'Checking cache…' : 'Check cache again'}
        actionDisabled={weather.isRefetching}
        message="No weather saved for this location is available offline. You can still document a storm using manual observed conditions."
        onAction={retryWeather}
        title="Offline with no cached weather"
      />
    );
  } else if (!isOnline && weather.error instanceof WeatherCacheReadError) {
    content = (
      <StatusPanel
        actionLabel={weather.isRefetching ? 'Retrying…' : 'Retry cached weather'}
        actionDisabled={weather.isRefetching}
        message="The saved weather cache could not be read. You can still document a storm using manual observed conditions."
        onAction={retryWeather}
        title="Offline weather unavailable"
      />
    );
  } else if (weather.isError) {
    content = (
      <StatusPanel
        actionLabel={weather.isRefetching ? 'Retrying…' : 'Retry weather'}
        actionDisabled={weather.isRefetching}
        message="Check your connection and try again."
        onAction={retryWeather}
        title={weather.isRefetching ? 'Retrying weather' : 'Weather unavailable'}
      />
    );
  } else {
    content = (
      <StatusPanel
        actionLabel={weather.isRefetching ? 'Retrying…' : 'Try again'}
        actionDisabled={weather.isRefetching}
        message="The weather service responded, but did not include usable current conditions for this location."
        onAction={retryWeather}
        title={weather.isRefetching ? 'Retrying weather' : 'Weather not found'}
      />
    );
  }

  return (
    <ScreenContainer title="Weather">
      <ScrollView
        alwaysBounceVertical
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            accessibilityLabel="Refresh current weather"
            colors={[colors.action]}
            enabled={location.status === 'ready'}
            onRefresh={retryWeather}
            refreshing={weather.isRefetching}
            tintColor={colors.action}
          />
        }
      >
        <OfflineBanner
          message={
            weather.data?.source === 'cache'
              ? 'Showing the last captured weather for this location.'
              : 'Live weather is unavailable. Saved storms and offline storm documentation remain available.'
          }
        />
        {content}
      </ScrollView>
    </ScreenContainer>
  );
}

type StatusPanelProps = {
  title: string;
  message: string;
  actionLabel?: string;
  actionDisabled?: boolean;
  onAction?: () => void;
};

function StatusPanel({
  actionDisabled = false,
  actionLabel,
  message,
  onAction,
  title,
}: StatusPanelProps) {
  const { colors } = useAppTheme();

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.statusPanel, { backgroundColor: colors.surface }]}
    >
      <Text accessibilityRole="header" style={[styles.statusTitle, { color: colors.textPrimary }]}>
        {title}
      </Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: actionDisabled }}
          disabled={actionDisabled}
          onPress={onAction}
          style={({ pressed }) => [
            styles.action,
            { backgroundColor: colors.action },
            (actionDisabled || pressed) && styles.actionDimmed,
          ]}
        >
          <Text style={[styles.actionText, { color: colors.background }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    gap: spacing.md,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  statusPanel: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  statusTitle: {
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 28,
  },
  description: {
    ...typography.body,
    marginTop: spacing.sm,
  },
  action: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionDimmed: {
    opacity: 0.6,
  },
  refreshing: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
  refreshError: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
});
