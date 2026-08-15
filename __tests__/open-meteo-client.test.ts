import {
  fetchCurrentWeather,
  WeatherRequestError,
} from '../src/features/weather/api/open-meteo-client';

const responsePayload = {
  current: {
    time: 1_786_747_500,
    temperature_2m: 14.6,
    apparent_temperature: 14.1,
    relative_humidity_2m: 74,
    surface_pressure: 901.7,
    precipitation: 0.2,
    weather_code: 2,
    wind_speed_10m: 4,
    wind_direction_10m: 153,
    wind_gusts_10m: 6.1,
  },
};

describe('fetchCurrentWeather', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('requests storm-relevant current fields and maps the response', async () => {
    const fetchMock: jest.MockedFunction<typeof fetch> = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => responsePayload,
    } as Response);
    global.fetch = fetchMock;

    await expect(fetchCurrentWeather(51.045, -114.072)).resolves.toMatchObject({
      temperatureCelsius: 14.6,
      relativeHumidityPercent: 74,
      surfacePressureHpa: 901.7,
      source: 'live',
    });

    const requestUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestUrl.searchParams.get('latitude')).toBe('51.045');
    expect(requestUrl.searchParams.get('longitude')).toBe('-114.072');
    expect(requestUrl.searchParams.get('forecast_days')).toBe('1');
    expect(requestUrl.searchParams.get('current')?.split(',')).toEqual([
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'surface_pressure',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ]);
  });

  it('returns not-found data for a successful but unusable response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ current: {} }),
    } as Response);

    await expect(fetchCurrentWeather(51.045, -114.072)).resolves.toBeNull();
  });

  it('normalizes network and non-success responses into the public request error', async () => {
    const fetchMock: jest.MockedFunction<typeof fetch> = jest
      .fn()
      .mockRejectedValueOnce(new Error('private transport detail'))
      .mockResolvedValueOnce({ ok: false } as Response);
    global.fetch = fetchMock;

    await expect(fetchCurrentWeather(51.045, -114.072)).rejects.toBeInstanceOf(
      WeatherRequestError,
    );
    await expect(fetchCurrentWeather(51.045, -114.072)).rejects.toBeInstanceOf(
      WeatherRequestError,
    );
  });
});
