import { fireEvent, render, screen } from '@testing-library/react-native';

import { useStormLog } from '../src/features/storms/hooks/use-storm-log';
import { type StormRecord } from '../src/features/storms/model/storm-record';
import { StormLogScreen } from '../src/features/storms/screens/storm-log-screen';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('../src/features/storms/hooks/use-storm-log', () => ({
  useStormLog: jest.fn(),
}));

const record: StormRecord = {
  id: 'storm-test-123',
  photoUri: 'storm-photo://storm-test-123.jpg',
  capturedAt: '2026-08-14T22:40:00.000Z',
  createdAt: '2026-08-14T22:45:00.000Z',
  updatedAt: '2026-08-14T22:45:00.000Z',
  latitude: 51.0447,
  longitude: -114.0719,
  locationAccuracyMetres: 8,
  stormType: 'tornado',
  notes: '',
  observedConditions: 'Rotating wall cloud',
  weatherSnapshot: null,
};

describe('StormLogScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows an empty state when SQLite contains no storm records', () => {
    jest.mocked(useStormLog).mockReturnValue({
      isRefreshing: false,
      refresh: jest.fn(),
      reload: jest.fn(),
      state: { status: 'success', records: [] },
    });

    render(<StormLogScreen />);

    expect(screen.getByText(/No saved storms yet/)).toBeOnTheScreen();
  });

  it('shows saved storms and opens the selected detail route', () => {
    jest.mocked(useStormLog).mockReturnValue({
      isRefreshing: false,
      refresh: jest.fn(),
      reload: jest.fn(),
      state: { status: 'success', records: [record] },
    });

    render(<StormLogScreen />);
    fireEvent.press(screen.getByRole('button', { name: /Tornado captured/ }));

    expect(screen.getByText('Rotating wall cloud')).toBeOnTheScreen();
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/storms/[id]',
      params: { id: record.id },
    });
  });

  it('shows a recoverable load failure separately from the empty state', () => {
    jest.mocked(useStormLog).mockReturnValue({
      isRefreshing: false,
      refresh: jest.fn(),
      reload: jest.fn(),
      state: { status: 'error', records: [] },
    });

    render(<StormLogScreen />);

    expect(screen.getByText(/could not be loaded/)).toBeOnTheScreen();
    expect(screen.queryByText(/No saved storms yet/)).not.toBeOnTheScreen();
  });

  it('keeps previously loaded records visible when a focus refresh fails', () => {
    jest.mocked(useStormLog).mockReturnValue({
      isRefreshing: false,
      refresh: jest.fn(),
      reload: jest.fn(),
      state: { status: 'error', records: [record] },
    });

    render(<StormLogScreen />);

    expect(screen.getByText(/latest Storm Log refresh failed/)).toBeOnTheScreen();
    expect(screen.getByText('Rotating wall cloud')).toBeOnTheScreen();
  });
});
