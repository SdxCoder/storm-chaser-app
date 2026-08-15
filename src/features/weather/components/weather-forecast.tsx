import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography } from '../../../theme/theme';
import { useAppTheme } from '../../../theme/use-app-theme';
import { interpretWeatherCode } from '../model/weather-condition';
import { type WeatherForecastDay } from '../model/weather-forecast';

type WeatherForecastProps = {
  days: WeatherForecastDay[] | undefined;
  isLoading: boolean;
  isOnline: boolean;
  onRetry: () => void;
  unavailable: boolean;
};

function formatDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatMetric(value: number | null, unit: string): string {
  return value === null
    ? 'Unavailable'
    : `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}${unit}`;
}

function forecastAccessibilityLabel(day: WeatherForecastDay): string {
  return [
    formatDate(day.date),
    interpretWeatherCode(day.weatherCode),
    `high ${formatMetric(day.maximumTemperatureCelsius, ' degrees Celsius')}`,
    `low ${formatMetric(day.minimumTemperatureCelsius, ' degrees Celsius')}`,
    `maximum precipitation probability ${formatMetric(day.maximumPrecipitationProbabilityPercent, ' percent')}`,
    `precipitation total ${formatMetric(day.precipitationTotalMm, ' millimetres')}`,
    `maximum wind ${formatMetric(day.maximumWindSpeedKph, ' kilometres per hour')}`,
    `maximum gusts ${formatMetric(day.maximumWindGustKph, ' kilometres per hour')}`,
  ].join(', ');
}

export function WeatherForecast({
  days,
  isLoading,
  isOnline,
  onRetry,
  unavailable,
}: WeatherForecastProps) {
  const { colors } = useAppTheme();
  const hasDays = days !== undefined && days.length > 0;

  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={[styles.heading, { color: colors.textPrimary }]}>
        Three-day forecast
      </Text>
      {hasDays ? (
        <View style={styles.days}>
          {days.map((day) => (
            <View
              accessible
              accessibilityLabel={forecastAccessibilityLabel(day)}
              key={day.date}
              style={[styles.day, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.dayHeading}>
                <Text style={[styles.date, { color: colors.textPrimary }]}>{formatDate(day.date)}</Text>
                <Text style={[styles.condition, { color: colors.textSecondary }]}>
                  {interpretWeatherCode(day.weatherCode)}
                </Text>
              </View>
              <Text style={[styles.metric, { color: colors.textPrimary }]}>
                High {formatMetric(day.maximumTemperatureCelsius, ' °C')} · Low{' '}
                {formatMetric(day.minimumTemperatureCelsius, ' °C')}
              </Text>
              <Text style={[styles.metric, { color: colors.textPrimary }]}>
                Precip {formatMetric(day.maximumPrecipitationProbabilityPercent, '%')} ·{' '}
                {formatMetric(day.precipitationTotalMm, ' mm')}
              </Text>
              <Text style={[styles.metric, { color: colors.textPrimary }]}>
                Wind {formatMetric(day.maximumWindSpeedKph, ' km/h')} · Gusts{' '}
                {formatMetric(day.maximumWindGustKph, ' km/h')}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.status, { backgroundColor: colors.surface }]}>
          <Text
            accessibilityLiveRegion="polite"
            accessibilityRole={unavailable ? 'alert' : undefined}
            style={[styles.statusText, { color: unavailable ? colors.error : colors.textSecondary }]}
          >
            {!isOnline
              ? 'Forecast is unavailable offline.'
              : isLoading
                ? 'Loading forecast…'
                : 'Forecast is unavailable. Current weather is still available.'}
          </Text>
          {isOnline && unavailable ? (
            <Pressable
              accessibilityRole="button"
              onPress={onRetry}
              style={({ pressed }) => [
                styles.retry,
                { borderColor: colors.action },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.retryText, { color: colors.action }]}>Retry forecast</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  heading: {
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 28,
  },
  days: {
    gap: spacing.sm,
  },
  day: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    padding: spacing.md,
  },
  dayHeading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
  },
  condition: {
    fontSize: 15,
    lineHeight: 22,
  },
  metric: {
    fontSize: 15,
    lineHeight: 22,
  },
  status: {
    borderRadius: radius.md,
    padding: spacing.md,
  },
  statusText: {
    ...typography.body,
  },
  retry: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.6,
  },
});
