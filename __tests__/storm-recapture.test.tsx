import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { CaptureScreen } from '../src/features/storms/screens/capture-screen';
import { type WeatherSnapshot } from '../src/features/weather/model/weather-snapshot';
import { type CurrentLocationResult } from '../src/services/location/current-location';

const mockAcquireCurrentLocation = jest.fn();
const mockCaptureStormPhoto = jest.fn();
const mockRefetchWeather = jest.fn();
const mockUseCurrentWeather = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));

jest.mock('../src/features/storms/services/storm-camera', () => ({
  captureStormPhoto: () => mockCaptureStormPhoto(),
}));

jest.mock('../src/services/location/current-location', () => ({
  acquireCurrentLocation: () => mockAcquireCurrentLocation(),
}));

jest.mock('../src/features/weather/hooks/use-current-weather', () => ({
  useCurrentWeather: (coordinates: unknown) => mockUseCurrentWeather(coordinates),
}));

jest.mock('../src/features/storms/hooks/use-save-storm', () => ({
  useSaveStorm: () => ({ save: jest.fn(), state: { status: 'idle' } }),
}));

const firstWeatherSnapshot: WeatherSnapshot = {
  temperatureCelsius: 18,
  apparentTemperatureCelsius: 17,
  relativeHumidityPercent: 70,
  surfacePressureHpa: 905,
  precipitationMm: 0,
  windSpeedKph: 25,
  windGustKph: 42,
  windDirectionDegrees: 260,
  weatherCode: 95,
  observedAt: '2026-08-14T22:45:00.000Z',
  source: 'live',
};

function createDeferred<T>() {
  let resolve: (value: T) => void = (_value: T): void => undefined;
  const promise = new Promise<T>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
}

describe('storm recapture', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('starts fresh capture metadata while preserving React Hook Form metadata', async () => {
    const secondLocationPending = new Promise<never>(() => undefined);
    mockCaptureStormPhoto
      .mockResolvedValueOnce({
        status: 'success',
        temporaryPhotoUri: 'file:///temporary/first-storm.jpg',
        capturedAt: '2026-08-14T23:01:02.000Z',
      })
      .mockResolvedValueOnce({
        status: 'success',
        temporaryPhotoUri: 'file:///temporary/second-storm.jpg',
        capturedAt: '2026-08-14T23:08:09.000Z',
      });
    mockAcquireCurrentLocation
      .mockResolvedValueOnce({
        status: 'success',
        coordinates: {
          latitude: 51.0447,
          longitude: -114.0719,
          locationAccuracyMetres: 10,
        },
      })
      .mockImplementationOnce(() => secondLocationPending);
    mockUseCurrentWeather.mockImplementation((coordinates: unknown) => ({
      data: coordinates === null ? undefined : firstWeatherSnapshot,
      isError: false,
      isPending: false,
      isRefetching: false,
      refetch: mockRefetchWeather,
    }));

    render(<CaptureScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Take storm photo' }));

    await screen.findByText('51.04470');
    await screen.findByRole('button', { name: 'Refresh current weather' });
    fireEvent.changeText(screen.getByLabelText('Observed conditions'), 'User-observed wall cloud');
    fireEvent.changeText(screen.getByLabelText('Storm notes'), 'Moving northeast quickly.');
    fireEvent.press(screen.getByRole('radio', { name: 'Thunderstorm' }));

    fireEvent.press(screen.getByRole('button', { name: 'Retake storm photo' }));

    await waitFor(() =>
      expect(screen.getByLabelText('Captured storm photo preview')).toHaveProp('source', {
        uri: 'file:///temporary/second-storm.jpg',
      }),
    );
    expect(screen.getByText(new Date('2026-08-14T23:08:09.000Z').toLocaleString())).toBeOnTheScreen();
    expect(mockUseCurrentWeather).toHaveBeenLastCalledWith(null);
    expect(screen.queryByText(/Live weather attached from/)).not.toBeOnTheScreen();
    expect(screen.getByLabelText('Observed conditions')).toHaveProp(
      'value',
      'User-observed wall cloud',
    );
    expect(screen.getByLabelText('Storm notes')).toHaveProp('value', 'Moving northeast quickly.');
    expect(screen.getByRole('radio', { name: 'Thunderstorm' })).toHaveProp(
      'accessibilityState',
      { checked: true },
    );
  });

  it('ignores a superseded location result that resolves after the recapture location', async () => {
    const firstLocation = createDeferred<CurrentLocationResult>();
    mockCaptureStormPhoto
      .mockResolvedValueOnce({
        status: 'success',
        temporaryPhotoUri: 'file:///temporary/first-storm.jpg',
        capturedAt: '2026-08-14T23:01:02.000Z',
      })
      .mockResolvedValueOnce({
        status: 'success',
        temporaryPhotoUri: 'file:///temporary/second-storm.jpg',
        capturedAt: '2026-08-14T23:08:09.000Z',
      });
    mockAcquireCurrentLocation
      .mockImplementationOnce(() => firstLocation.promise)
      .mockResolvedValueOnce({
        status: 'success',
        coordinates: {
          latitude: 52,
          longitude: -113,
          locationAccuracyMetres: 8,
        },
      });
    mockUseCurrentWeather.mockReturnValue({
      data: undefined,
      isError: false,
      isPending: false,
      isRefetching: false,
      refetch: mockRefetchWeather,
    });

    render(<CaptureScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Take storm photo' }));
    await screen.findByRole('button', { name: 'Retake storm photo' });
    fireEvent.press(screen.getByRole('button', { name: 'Retake storm photo' }));

    expect(await screen.findByText('52.00000')).toBeOnTheScreen();
    expect(screen.getByText('-113.00000')).toBeOnTheScreen();

    await act(async () => {
      firstLocation.resolve({
        status: 'success',
        coordinates: {
          latitude: 51.0447,
          longitude: -114.0719,
          locationAccuracyMetres: 10,
        },
      });
      await firstLocation.promise;
    });

    expect(screen.getByText('52.00000')).toBeOnTheScreen();
    expect(screen.getByText('-113.00000')).toBeOnTheScreen();
    expect(screen.queryByText('51.04470')).not.toBeOnTheScreen();
    expect(mockAcquireCurrentLocation).toHaveBeenCalledTimes(2);
  });
});
