import { render, screen } from '@testing-library/react-native';

import { OfflineBanner } from '../src/components/offline-banner';
import { darkColors } from '../src/theme/theme';

jest.mock('../src/services/connectivity/use-online-status', () => ({
  useOnlineStatus: () => false,
}));

jest.mock('../src/theme/use-app-theme', () => ({
  useAppTheme: () => ({
    colorScheme: 'dark',
    colors: jest.requireActual('../src/theme/theme').darkColors,
  }),
}));

describe('OfflineBanner dark mode', () => {
  it('uses dark semantic surface, warning, and text tokens', () => {
    render(<OfflineBanner message="Saved records remain available." />);

    expect(screen.getByRole('alert')).toHaveStyle({
      backgroundColor: darkColors.surfaceElevated,
      borderColor: darkColors.warning,
    });
    expect(screen.getByText('Offline')).toHaveStyle({ color: darkColors.warning });
    expect(screen.getByText('Saved records remain available.')).toHaveStyle({
      color: darkColors.textPrimary,
    });
  });
});
