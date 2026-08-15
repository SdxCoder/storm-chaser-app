import { render, screen } from '@testing-library/react-native';

import { CaptureScreen } from '../src/features/storms/screens/capture-screen';
import { StormLogScreen } from '../src/features/storms/screens/storm-log-screen';
import { WeatherScreen } from '../src/features/weather/screens/weather-screen';

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  useRouter: () => ({ back: jest.fn(), push: jest.fn(), replace: jest.fn() }),
}));

jest.mock('../src/features/weather/hooks/use-current-weather-flow', () => ({
  useCurrentWeatherFlow: () => ({
    location: { status: 'loading' },
    requestLocation: jest.fn(),
    weather: {
      data: undefined,
      failureCount: 0,
      isError: false,
      isPending: true,
      isRefetching: false,
      refetch: jest.fn(),
    },
  }),
}));

jest.mock('../src/features/storms/hooks/use-storm-draft', () => ({
  useStormDraft: () => ({
    camera: { status: 'idle' },
    draft: {
      temporaryPhotoUri: '',
      capturedAt: '',
      latitude: null,
      longitude: null,
      locationAccuracyMetres: null,
      weatherSnapshot: null,
    },
    location: { status: 'idle' },
    requestCamera: jest.fn(),
    requestLocation: jest.fn(),
    resetDraft: jest.fn(),
    weather: {
      data: undefined,
      isError: false,
      isPending: false,
      isRefetching: false,
      refetch: jest.fn(),
    },
  }),
}));

jest.mock('../src/features/storms/hooks/use-save-storm', () => ({
  useSaveStorm: () => ({ save: jest.fn(), state: { status: 'idle' } }),
}));

jest.mock('../src/features/storms/hooks/use-storm-log', () => ({
  useStormLog: () => ({
    isRefreshing: false,
    refresh: jest.fn(),
    reload: jest.fn(),
    state: { status: 'success', records: [] },
  }),
}));

describe('application shell', () => {
  it.each([
    ['Weather', WeatherScreen],
    ['Document Storm', CaptureScreen],
    ['Storm Log', StormLogScreen],
  ])('renders the %s placeholder screen', async (title, ScreenComponent) => {
    await render(<ScreenComponent />);

    expect(screen.getByRole('header', { name: title })).toBeOnTheScreen();
  });
});
