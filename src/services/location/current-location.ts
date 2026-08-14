import * as Location from 'expo-location';

export type DeviceCoordinates = {
  latitude: number;
  longitude: number;
};

export type CurrentLocationResult =
  | { status: 'success'; coordinates: DeviceCoordinates }
  | { status: 'permission-denied'; canAskAgain: boolean }
  | { status: 'unavailable' };

const LOCATION_TIMEOUT_MS = 15_000;

async function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Location timed out')), LOCATION_TIMEOUT_MS);
    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

export async function acquireCurrentLocation(
  requestAgainAfterDenial = false,
): Promise<CurrentLocationResult> {
  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      return { status: 'unavailable' };
    }

    let permission = await Location.getForegroundPermissionsAsync();
    if (permission.status === Location.PermissionStatus.DENIED && !requestAgainAfterDenial) {
      return { status: 'permission-denied', canAskAgain: permission.canAskAgain };
    }

    if (permission.status !== Location.PermissionStatus.GRANTED) {
      if (!permission.canAskAgain) {
        return { status: 'permission-denied', canAskAgain: false };
      }
      permission = await Location.requestForegroundPermissionsAsync();
    }

    if (permission.status !== Location.PermissionStatus.GRANTED) {
      return { status: 'permission-denied', canAskAgain: permission.canAskAgain };
    }

    const position = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
    );
    const { latitude, longitude } = position.coords;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return { status: 'unavailable' };
    }

    return { status: 'success', coordinates: { latitude, longitude } };
  } catch {
    return { status: 'unavailable' };
  }
}
