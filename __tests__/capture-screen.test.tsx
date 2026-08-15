import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { CaptureScreen } from '../src/features/storms/screens/capture-screen';
import { type WeatherSnapshot } from '../src/features/weather/model/weather-snapshot';

const mockRequestCamera = jest.fn();
const mockRequestLocation = jest.fn();
const mockRefetchWeather = jest.fn();
const mockUseStormDraft = jest.fn();
const mockUseSaveStorm = jest.fn();
const mockSave = jest.fn();
const mockReplace = jest.fn();
const mockResetDraft = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('../src/features/storms/hooks/use-storm-draft', () => ({
  useStormDraft: () => mockUseStormDraft(),
}));

jest.mock('../src/features/storms/hooks/use-save-storm', () => ({
  useSaveStorm: () => mockUseSaveStorm(),
}));

const weatherSnapshot: WeatherSnapshot = {
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

const emptyDraft = {
  temporaryPhotoUri: '',
  capturedAt: '',
  latitude: null,
  longitude: null,
  locationAccuracyMetres: null,
  weatherSnapshot: null,
};

function stormDraftState(overrides: Record<string, unknown> = {}) {
  return {
    camera: { status: 'idle' },
    draft: emptyDraft,
    location: { status: 'idle' },
    requestCamera: mockRequestCamera,
    requestLocation: mockRequestLocation,
    resetDraft: mockResetDraft,
    weather: {
      data: undefined,
      isError: false,
      isPending: false,
      isRefetching: false,
      refetch: mockRefetchWeather,
    },
    ...overrides,
  };
}

describe('CaptureScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSave.mockResolvedValue(null);
    mockUseSaveStorm.mockReturnValue({ save: mockSave, state: { status: 'idle' } });
    mockUseStormDraft.mockReturnValue(stormDraftState());
  });

  it('preserves manually entered values after incomplete-draft validation fails', async () => {
    render(<CaptureScreen />);
    const conditions = screen.getByLabelText('Observed conditions');
    const notes = screen.getByLabelText('Storm notes');

    fireEvent.changeText(conditions, 'Shelf cloud with strong inflow');
    fireEvent.changeText(notes, 'Moving toward the northeast.');
    fireEvent.press(screen.getByRole('radio', { name: 'High wind' }));
    fireEvent.press(screen.getByRole('button', { name: 'Save storm observation' }));

    expect(await screen.findByText('Take a storm photo before completing the draft.')).toBeOnTheScreen();
    expect(screen.getByText('Current coordinates are required. Try location again.')).toBeOnTheScreen();
    expect(conditions).toHaveProp('value', 'Shelf cloud with strong inflow');
    expect(notes).toHaveProp('value', 'Moving toward the northeast.');
    expect(screen.getByRole('radio', { name: 'High wind' })).toHaveProp('accessibilityState', {
      checked: true,
    });
  });

  it('allows manual observed conditions when API weather is unavailable', () => {
    mockUseStormDraft.mockReturnValue(
      stormDraftState({
        weather: {
          data: undefined,
          isError: true,
          isPending: false,
          isRefetching: false,
          refetch: mockRefetchWeather,
        },
      }),
    );
    render(<CaptureScreen />);

    fireEvent.changeText(screen.getByLabelText('Observed conditions'), 'Hail around 2 cm across');

    expect(screen.getByLabelText('Observed conditions')).toHaveProp(
      'value',
      'Hail around 2 cm across',
    );
    expect(screen.getByText(/Current weather is unavailable/)).toBeOnTheScreen();
  });

  it('prefills conditions once when weather arrives while the field is untouched', async () => {
    const view = render(<CaptureScreen />);
    mockUseStormDraft.mockReturnValue(
      stormDraftState({ draft: { ...emptyDraft, weatherSnapshot } }),
    );

    view.rerender(<CaptureScreen />);

    await waitFor(() =>
      expect(screen.getByLabelText('Observed conditions')).toHaveProp('value', 'Thunderstorm'),
    );
  });

  it('labels a cached weather snapshot with its observation time', async () => {
    const cachedSnapshot: WeatherSnapshot = { ...weatherSnapshot, source: 'cache' };
    const view = render(<CaptureScreen />);
    mockUseStormDraft.mockReturnValue(
      stormDraftState({ draft: { ...emptyDraft, weatherSnapshot: cachedSnapshot } }),
    );

    view.rerender(<CaptureScreen />);

    expect(
      await screen.findByText(
        new RegExp(
          `Cached weather attached from ${new Date(cachedSnapshot.observedAt).toLocaleString()}`,
        ),
      ),
    ).toBeOnTheScreen();
  });

  it('does not overwrite user-entered conditions after delayed weather arrives or rerenders', async () => {
    const view = render(<CaptureScreen />);
    const conditions = screen.getByLabelText('Observed conditions');
    fireEvent.changeText(conditions, 'Observed rotating wall cloud');

    mockUseStormDraft.mockReturnValue(
      stormDraftState({ draft: { ...emptyDraft, weatherSnapshot } }),
    );
    view.rerender(<CaptureScreen />);
    view.rerender(<CaptureScreen />);

    await waitFor(() =>
      expect(screen.getByLabelText('Observed conditions')).toHaveProp(
        'value',
        'Observed rotating wall cloud',
      ),
    );
  });

  it('does not overwrite an edited weather prefill when current weather is refreshed', async () => {
    const view = render(<CaptureScreen />);
    mockUseStormDraft.mockReturnValue(
      stormDraftState({ draft: { ...emptyDraft, weatherSnapshot } }),
    );
    view.rerender(<CaptureScreen />);
    await waitFor(() =>
      expect(screen.getByLabelText('Observed conditions')).toHaveProp('value', 'Thunderstorm'),
    );

    fireEvent.changeText(screen.getByLabelText('Observed conditions'), 'Observed rain-wrapped base');
    fireEvent.press(screen.getByRole('button', { name: 'Refresh current weather' }));
    view.rerender(<CaptureScreen />);

    expect(mockRefetchWeather).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Observed conditions')).toHaveProp(
      'value',
      'Observed rain-wrapped base',
    );
  });

  it('presents an explicit retry after camera permission denial', () => {
    mockUseStormDraft.mockReturnValue(
      stormDraftState({ camera: { status: 'permission-denied', canAskAgain: true } }),
    );
    render(<CaptureScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Try camera permission again' }));

    expect(mockRequestCamera).toHaveBeenCalledWith(true);
    expect(screen.getByText(/Camera permission denied/)).toBeOnTheScreen();
  });

  it('submits a complete draft to the save workflow', async () => {
    mockUseStormDraft.mockReturnValue(
      stormDraftState({
        draft: {
          ...emptyDraft,
          temporaryPhotoUri: 'file:///temporary/storm.jpg',
          capturedAt: '2026-08-14T23:01:02.000Z',
          latitude: 51.0447,
          longitude: -114.0719,
          locationAccuracyMetres: 10,
        },
        location: { status: 'ready' },
      }),
    );
    render(<CaptureScreen />);

    fireEvent.changeText(screen.getByLabelText('Observed conditions'), 'Strong gusts and hail');
    fireEvent.press(screen.getByRole('radio', { name: 'Hail' }));
    fireEvent.press(screen.getByRole('button', { name: 'Save storm observation' }));

    await waitFor(() =>
      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          temporaryPhotoUri: 'file:///temporary/storm.jpg',
          stormType: 'hail',
          observedConditions: 'Strong gusts and hail',
        }),
      ),
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('clears the in-memory draft and navigates to the Storm Log only after Save succeeds', async () => {
    mockSave.mockResolvedValue({
      id: 'storm-test-123',
      photoUri: 'storm-photo://storm-test-123.jpg',
    });
    mockUseStormDraft.mockReturnValue(
      stormDraftState({
        draft: {
          ...emptyDraft,
          temporaryPhotoUri: 'file:///temporary/storm.jpg',
          capturedAt: '2026-08-14T23:01:02.000Z',
          latitude: 51.0447,
          longitude: -114.0719,
          locationAccuracyMetres: 10,
        },
        location: { status: 'ready' },
      }),
    );
    render(<CaptureScreen />);

    fireEvent.changeText(screen.getByLabelText('Observed conditions'), 'Strong gusts and hail');
    fireEvent.press(screen.getByRole('radio', { name: 'Hail' }));
    fireEvent.press(screen.getByRole('button', { name: 'Save storm observation' }));

    await waitFor(() => expect(mockResetDraft).toHaveBeenCalledTimes(1));
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/storm-log');
  });

  it('preserves the completed form and temporary photo after a recoverable save failure', async () => {
    mockUseSaveStorm.mockReturnValue({
      save: mockSave,
      state: { status: 'error', reason: 'database', cleanupFailed: false },
    });
    mockUseStormDraft.mockReturnValue(
      stormDraftState({
        draft: {
          ...emptyDraft,
          temporaryPhotoUri: 'file:///temporary/storm.jpg',
          capturedAt: '2026-08-14T23:01:02.000Z',
          latitude: 51.0447,
          longitude: -114.0719,
          locationAccuracyMetres: 10,
        },
        location: { status: 'ready' },
      }),
    );
    render(<CaptureScreen />);

    fireEvent.changeText(screen.getByLabelText('Observed conditions'), 'Strong gusts and hail');
    fireEvent.changeText(screen.getByLabelText('Storm notes'), 'Still tracking northeast.');
    fireEvent.press(screen.getByRole('radio', { name: 'Hail' }));
    fireEvent.press(screen.getByRole('button', { name: 'Save storm observation' }));

    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
    expect(screen.getByLabelText('Captured storm photo preview')).toHaveProp('source', {
      uri: 'file:///temporary/storm.jpg',
    });
    expect(screen.getByLabelText('Observed conditions')).toHaveProp(
      'value',
      'Strong gusts and hail',
    );
    expect(screen.getByLabelText('Storm notes')).toHaveProp(
      'value',
      'Still tracking northeast.',
    );
    expect(screen.getByText(/draft and temporary photo are preserved/)).toBeOnTheScreen();
  });

  it('prevents rapid duplicate Save submissions at the form boundary', async () => {
    let resolveSave: (value: null) => void = () => undefined;
    mockSave.mockReturnValue(
      new Promise<null>((resolve) => {
        resolveSave = resolve;
      }),
    );
    mockUseStormDraft.mockReturnValue(
      stormDraftState({
        draft: {
          ...emptyDraft,
          temporaryPhotoUri: 'file:///temporary/storm.jpg',
          capturedAt: '2026-08-14T23:01:02.000Z',
          latitude: 51.0447,
          longitude: -114.0719,
          locationAccuracyMetres: 10,
        },
        location: { status: 'ready' },
      }),
    );
    render(<CaptureScreen />);

    fireEvent.changeText(screen.getByLabelText('Observed conditions'), 'Strong gusts and hail');
    fireEvent.press(screen.getByRole('radio', { name: 'Hail' }));
    const saveButton = screen.getByRole('button', { name: 'Save storm observation' });
    fireEvent.press(saveButton);
    fireEvent.press(saveButton);

    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
    await act(async () => {
      resolveSave(null);
      await Promise.resolve();
    });
  });
});
