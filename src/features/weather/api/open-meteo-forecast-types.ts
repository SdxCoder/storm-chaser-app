export type OpenMeteoDailyForecastPayload = {
  time?: unknown;
  weather_code?: unknown;
  temperature_2m_max?: unknown;
  temperature_2m_min?: unknown;
  precipitation_probability_max?: unknown;
  precipitation_sum?: unknown;
  wind_speed_10m_max?: unknown;
  wind_gusts_10m_max?: unknown;
};

export type OpenMeteoForecastResponse = {
  daily?: unknown;
  daily_units?: unknown;
};
