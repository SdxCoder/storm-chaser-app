import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography } from '../../../theme/theme';
import { useAppTheme } from '../../../theme/use-app-theme';
import { interpretWeatherCode } from '../model/weather-condition';
import { type WeatherSnapshot } from '../model/weather-snapshot';

type WeatherMetricsProps = {
  weather: WeatherSnapshot;
};

function formatMetric(value: number | null, unit: string): string {
  return value === null
    ? 'Unavailable'
    : `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}${unit}`;
}

function formatObservedAt(observedAt: string): string {
  return new Date(observedAt).toLocaleString();
}

export function WeatherMetrics({ weather }: WeatherMetricsProps) {
  const { colors } = useAppTheme();
  const metrics = [
    ['Temperature', formatMetric(weather.temperatureCelsius, ' °C')],
    ['Feels like', formatMetric(weather.apparentTemperatureCelsius, ' °C')],
    ['Relative humidity', formatMetric(weather.relativeHumidityPercent, '%')],
    ['Surface pressure', formatMetric(weather.surfacePressureHpa, ' hPa')],
    ['Precipitation', formatMetric(weather.precipitationMm, ' mm')],
    ['Wind speed', formatMetric(weather.windSpeedKph, ' km/h')],
    ['Wind gusts', formatMetric(weather.windGustKph, ' km/h')],
    ['Wind direction', formatMetric(weather.windDirectionDegrees, '°')],
  ] as const;

  return (
    <View>
      <View
        accessible
        accessibilityLabel={`Current condition: ${interpretWeatherCode(weather.weatherCode)}`}
        style={[styles.conditionCard, { backgroundColor: colors.surface }]}
      >
        <Text
          style={[
            styles.source,
            { color: weather.source === 'cache' ? colors.warning : colors.action },
          ]}
        >
          {weather.source === 'cache' ? 'Cached weather' : 'Live weather'}
        </Text>
        <Text style={[styles.condition, { color: colors.textPrimary }]}>
          {interpretWeatherCode(weather.weatherCode)}
        </Text>
        <Text style={[styles.updated, { color: colors.textSecondary }]}>
          Observed {formatObservedAt(weather.observedAt)}
        </Text>
      </View>
      <View style={styles.grid}>
        {metrics.map(([label, value]) => (
          <View
            accessible
            accessibilityLabel={`${label}: ${value}`}
            key={label}
            style={[styles.metric, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  conditionCard: {
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  condition: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  source: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  updated: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metric: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 88,
    minWidth: '47%',
    padding: spacing.md,
    flexGrow: 1,
    flexBasis: 150,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
  },
  value: {
    fontSize: 19,
    fontWeight: '600',
    lineHeight: 26,
    marginTop: spacing.xs,
  },
});
