import { fireEvent, render, screen } from '@testing-library/react-native';

import { StormRecordPhoto } from '../src/features/storms/components/storm-record-photo';
import { useStormDetail } from '../src/features/storms/hooks/use-storm-detail';
import { StormDetailScreen } from '../src/features/storms/screens/storm-detail-screen';
import { resolveDurableStormPhotoUri } from '../src/services/photo-storage/storm-photo-storage';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

jest.mock('../src/features/storms/hooks/use-storm-detail', () => ({
  useStormDetail: jest.fn(),
}));

jest.mock('../src/services/photo-storage/storm-photo-storage', () => ({
  resolveDurableStormPhotoUri: jest.fn(),
}));

describe('StormDetailScreen', () => {
  beforeEach(() => {
    jest.mocked(resolveDurableStormPhotoUri).mockReturnValue(
      'file:///current/documents/storm-photos/storm-test-123.jpg',
    );
  });

  it('shows a missing-record state distinct from load failure', () => {
    jest.mocked(useStormDetail).mockReturnValue({
      retry: jest.fn(),
      state: { status: 'not-found' },
    });

    render(<StormDetailScreen recordId="storm-missing-123" />);

    expect(screen.getByText('This saved storm record could not be found.')).toBeOnTheScreen();
    expect(screen.queryByText(/could not be loaded/)).not.toBeOnTheScreen();
  });

  it('shows an invalid-ID state without presenting a missing record as valid', () => {
    jest.mocked(useStormDetail).mockReturnValue({
      retry: jest.fn(),
      state: { status: 'invalid-id' },
    });

    render(<StormDetailScreen recordId={null} />);

    expect(screen.getByText(/missing or invalid record ID/)).toBeOnTheScreen();
  });
});

describe('StormRecordPhoto', () => {
  beforeEach(() => {
    jest.mocked(resolveDurableStormPhotoUri).mockReturnValue(
      'file:///current/documents/storm-photos/storm-test-123.jpg',
    );
  });

  it('renders a stable stored photo URI from the current app container', () => {
    render(<StormRecordPhoto photoUri="storm-photo://storm-test-123.jpg" />);

    expect(screen.getByLabelText('Saved storm photo')).toHaveProp('source', {
      uri: 'file:///current/documents/storm-photos/storm-test-123.jpg',
    });
  });

  it('keeps metadata usable and identifies a missing durable photo', () => {
    render(<StormRecordPhoto photoUri="storm-photo://missing.jpg" />);

    fireEvent(screen.getByLabelText('Saved storm photo'), 'error');

    expect(screen.getByLabelText('Saved storm photo is missing')).toBeOnTheScreen();
    expect(screen.getByText(/storm metadata is still available/)).toBeOnTheScreen();
  });

  it('shows the missing-photo state when a stored locator is invalid', () => {
    jest.mocked(resolveDurableStormPhotoUri).mockReturnValue(null);

    render(<StormRecordPhoto photoUri="storm-photo://../outside.jpg" />);

    expect(screen.getByLabelText('Saved storm photo is missing')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Saved storm photo')).not.toBeOnTheScreen();
  });
});
