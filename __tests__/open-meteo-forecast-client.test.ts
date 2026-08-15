import { fetchWeatherForecast } from '../src/features/weather/api/open-meteo-forecast-client';

describe('fetchWeatherForecast', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('requests the three daily forecast days in the location timezone', async () => {
    const fetchMock: jest.MockedFunction<typeof fetch> = jest.fn();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ daily: { time: [] } }),
    } as Response);
    global.fetch = fetchMock;

    await expect(fetchWeatherForecast(51.045, -114.072)).resolves.toEqual([]);

    const requestUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestUrl.searchParams.get('forecast_days')).toBe('3');
    expect(requestUrl.searchParams.get('timezone')).toBe('auto');
    expect(requestUrl.searchParams.get('daily')?.split(',')).toEqual([
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'precipitation_sum',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
    ]);
  });
});
