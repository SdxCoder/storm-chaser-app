export type WeatherForecastDay = {
  date: string;
  weatherCode: number | null;
  maximumTemperatureCelsius: number | null;
  minimumTemperatureCelsius: number | null;
  maximumPrecipitationProbabilityPercent: number | null;
  precipitationTotalMm: number | null;
  maximumWindSpeedKph: number | null;
  maximumWindGustKph: number | null;
};
