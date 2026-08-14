import * as Location from 'expo-location';

import { acquireCurrentLocation } from '../src/services/location/current-location';

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  PermissionStatus: {
    DENIED: 'denied',
    GRANTED: 'granted',
    UNDETERMINED: 'undetermined',
  },
  getCurrentPositionAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
}));

const permission = (
  status: Location.PermissionStatus,
  canAskAgain: boolean,
): Location.LocationPermissionResponse => ({
  status,
  canAskAgain,
  expires: 'never',
  granted: status === Location.PermissionStatus.GRANTED,
});

const position: Location.LocationObject = {
  coords: {
    accuracy: 10,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    latitude: 51.0447,
    longitude: -114.0719,
    speed: null,
  },
  timestamp: 1_786_747_500_000,
};

describe('acquireCurrentLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true);
    jest.mocked(Location.getCurrentPositionAsync).mockResolvedValue(position);
  });

  it('requests an undetermined foreground permission and returns coordinates', async () => {
    jest
      .mocked(Location.getForegroundPermissionsAsync)
      .mockResolvedValue(permission(Location.PermissionStatus.UNDETERMINED, true));
    jest
      .mocked(Location.requestForegroundPermissionsAsync)
      .mockResolvedValue(permission(Location.PermissionStatus.GRANTED, true));

    await expect(acquireCurrentLocation()).resolves.toEqual({
      status: 'success',
      coordinates: { latitude: 51.0447, longitude: -114.0719 },
    });
    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('does not automatically re-request a previously denied permission', async () => {
    jest
      .mocked(Location.getForegroundPermissionsAsync)
      .mockResolvedValue(permission(Location.PermissionStatus.DENIED, true));

    await expect(acquireCurrentLocation()).resolves.toEqual({
      status: 'permission-denied',
      canAskAgain: true,
    });
    expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  });

  it('re-requests a denied permission only after an explicit retry', async () => {
    jest
      .mocked(Location.getForegroundPermissionsAsync)
      .mockResolvedValue(permission(Location.PermissionStatus.DENIED, true));
    jest
      .mocked(Location.requestForegroundPermissionsAsync)
      .mockResolvedValue(permission(Location.PermissionStatus.GRANTED, true));

    await expect(acquireCurrentLocation(true)).resolves.toMatchObject({ status: 'success' });
    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('returns unavailable when location services are disabled', async () => {
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(false);

    await expect(acquireCurrentLocation()).resolves.toEqual({ status: 'unavailable' });
    expect(Location.getForegroundPermissionsAsync).not.toHaveBeenCalled();
  });

  it('converts coordinate acquisition failures into an unavailable result', async () => {
    jest
      .mocked(Location.getForegroundPermissionsAsync)
      .mockResolvedValue(permission(Location.PermissionStatus.GRANTED, true));
    jest.mocked(Location.getCurrentPositionAsync).mockRejectedValue(new Error('provider failure'));

    await expect(acquireCurrentLocation()).resolves.toEqual({ status: 'unavailable' });
  });
});
