import { type Control, Controller } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { useOnlineStatus } from '../../../../services/connectivity/use-online-status';
import { spacing, typography } from '../../../../theme/theme';
import { useAppTheme } from '../../../../theme/use-app-theme';
import { type StormMetadata, validateObservedConditions } from '../../model/storm-draft';
import {
  CaptureActionButton,
  CaptureFieldError,
  CaptureSection,
  CaptureTextArea,
} from './capture-ui';

type ObservedConditionsFieldProps = {
  control: Control<StormMetadata>;
  errorMessage?: string;
  hasWeatherSnapshot: boolean;
  isWeatherError: boolean;
  isWeatherLoading: boolean;
  isWeatherRetrying: boolean;
  observedAt: string | null;
  onRefreshWeather: () => void;
  weatherSource: 'live' | 'cache' | null;
};

export function ObservedConditionsField({
  control,
  errorMessage,
  hasWeatherSnapshot,
  isWeatherError,
  isWeatherLoading,
  isWeatherRetrying,
  observedAt,
  onRefreshWeather,
  weatherSource,
}: ObservedConditionsFieldProps) {
  return (
    <CaptureSection title="Observed conditions">
      <Controller
        control={control}
        name="observedConditions"
        rules={{ validate: (value) => validateObservedConditions(value) ?? true }}
        render={({ field: { onBlur, onChange, value } }) => (
          <CaptureTextArea
            accessibilityHint={errorMessage}
            accessibilityLabel="Observed conditions"
            hasError={Boolean(errorMessage)}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="For example: rotating dark cloud base with strong gusts"
            value={value}
          />
        )}
      />
      <CaptureFieldError message={errorMessage} />
      <WeatherDraftStatus
        hasSnapshot={hasWeatherSnapshot}
        isError={isWeatherError}
        isLoading={isWeatherLoading}
        isRetrying={isWeatherRetrying}
        observedAt={observedAt}
        onRetry={onRefreshWeather}
        source={weatherSource}
      />
    </CaptureSection>
  );
}

type WeatherDraftStatusProps = {
  hasSnapshot: boolean;
  isError: boolean;
  isLoading: boolean;
  isRetrying: boolean;
  observedAt: string | null;
  onRetry: () => void;
  source: 'live' | 'cache' | null;
};

function WeatherDraftStatus({
  hasSnapshot,
  isError,
  isLoading,
  isRetrying,
  observedAt,
  onRetry,
  source,
}: WeatherDraftStatusProps) {
  const { colors } = useAppTheme();
  const isOnline = useOnlineStatus();

  if (hasSnapshot && observedAt) {
    return (
      <View>
        <Text style={[styles.helper, { color: colors.textSecondary }]}>
          {source === 'cache' ? 'Cached' : 'Live'} weather attached from{' '}
          {new Date(observedAt).toLocaleString()}. This snapshot will not be replaced by later
          refreshes.
        </Text>
        <CaptureActionButton
          disabled={isRetrying}
          label={isRetrying ? 'Refreshing current weather…' : 'Refresh current weather'}
          onPress={onRetry}
        />
      </View>
    );
  }
  if (isLoading) {
    return <Text style={[styles.helper, { color: colors.textSecondary }]}>Loading current weather…</Text>;
  }
  if (!isOnline) {
    return (
      <View>
        <Text accessibilityRole="alert" style={[styles.helper, { color: colors.warning }]}>
          {isError
            ? 'Offline with no captured weather for this location. Enter observed conditions manually; saving this storm does not require internet access.'
            : 'Offline. The last captured weather will be attached after coordinates are available. You can enter observed conditions manually.'}
        </Text>
        {isError ? (
          <CaptureActionButton
            disabled={isRetrying}
            label={isRetrying ? 'Checking cached weather…' : 'Check cached weather again'}
            onPress={onRetry}
          />
        ) : null}
      </View>
    );
  }
  if (isError) {
    return (
      <View>
        <Text accessibilityRole="alert" style={[styles.helper, { color: colors.warning }]}>
          Current weather is unavailable. Enter observed conditions manually or retry.
        </Text>
        <CaptureActionButton
          disabled={isRetrying}
          label={isRetrying ? 'Retrying weather…' : 'Retry weather'}
          onPress={onRetry}
        />
      </View>
    );
  }

  return (
    <Text style={[styles.helper, { color: colors.textSecondary }]}>
      Enter conditions manually. Current weather will be attached if it becomes available.
    </Text>
  );
}

const styles = StyleSheet.create({
  helper: { ...typography.body, marginTop: spacing.sm },
});
