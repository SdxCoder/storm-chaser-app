import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { CaptureScreen } from '../src/features/storms/screens/capture-screen';
import { type WeatherSnapshot } from '../src/features/weather/model/weather-snapshot';

const mockRequestCamera = jest.fn();
const mockRequestLocation = jest.fn();
const mockRefetchWeather = jest.fn();
const mockUseStormDraft = jest.fn();

jest.mock('../src/features/storms/hooks/use-storm-draft', () => ({
  useStormDraft: () => mockUseStormDraft(),
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
    mockUseStormDraft.mockReturnValue(stormDraftState());
  });

  it('preserves manually entered values after incomplete-draft validation fails', async () => {
    render(<CaptureScreen />);
    const conditions = screen.getByLabelText('Observed conditions');
    const notes = screen.getByLabelText('Storm notes');

    fireEvent.changeText(conditions, 'Shelf cloud with strong inflow');
    fireEvent.changeText(notes, 'Moving toward the northeast.');
    fireEvent.press(screen.getByRole('radio', { name: 'High wind' }));
    fireEvent.press(screen.getByRole('button', { name: 'Complete storm draft' }));

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

  it('validates a complete in-memory draft without persisting it', async () => {
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
    fireEvent.press(screen.getByRole('button', { name: 'Complete storm draft' }));

    expect(
      await screen.findByText('Draft complete. It remains in memory and has not been permanently saved.'),
    ).toBeOnTheScreen();
  });
});
