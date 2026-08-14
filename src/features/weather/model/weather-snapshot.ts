export type WeatherSnapshot = {
  temperatureCelsius: number;
  apparentTemperatureCelsius: number | null;
  relativeHumidityPercent: number | null;
  surfacePressureHpa: number | null;
  precipitationMm: number;
  windSpeedKph: number;
  windGustKph: number | null;
  windDirectionDegrees: number | null;
  weatherCode: number | null;
  observedAt: string;
  source: 'live' | 'cache';
};
