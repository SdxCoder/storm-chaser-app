export type OpenMeteoCurrentPayload = {
  time?: unknown;
  interval?: unknown;
  temperature_2m?: unknown;
  apparent_temperature?: unknown;
  relative_humidity_2m?: unknown;
  surface_pressure?: unknown;
  precipitation?: unknown;
  weather_code?: unknown;
  wind_speed_10m?: unknown;
  wind_direction_10m?: unknown;
  wind_gusts_10m?: unknown;
};

export type OpenMeteoCurrentResponse = {
  current?: unknown;
  current_units?: unknown;
};
