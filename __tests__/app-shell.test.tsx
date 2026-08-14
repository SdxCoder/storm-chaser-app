import { render, screen } from '@testing-library/react-native';

import { CaptureScreen } from '../src/features/storms/screens/capture-screen';
import { StormLogScreen } from '../src/features/storms/screens/storm-log-screen';
import { WeatherScreen } from '../src/features/weather/screens/weather-screen';

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
