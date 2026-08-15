import * as ImagePicker from 'expo-image-picker';

import { captureStormPhoto } from '../src/features/storms/services/storm-camera';

jest.mock('expo-image-picker', () => ({
  CameraType: { back: 'back' },
  PermissionStatus: {
    DENIED: 'denied',
    GRANTED: 'granted',
    UNDETERMINED: 'undetermined',
  },
  getCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
}));

function permission(
  status: ImagePicker.PermissionStatus,
  canAskAgain: boolean,
): ImagePicker.CameraPermissionResponse {
  return {
    status,
    canAskAgain,
    expires: 'never',
    granted: status === ImagePicker.PermissionStatus.GRANTED,
  };
}

describe('captureStormPhoto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('treats system-camera cancellation as a normal result', async () => {
    jest
      .mocked(ImagePicker.getCameraPermissionsAsync)
      .mockResolvedValue(permission(ImagePicker.PermissionStatus.GRANTED, true));
    jest.mocked(ImagePicker.launchCameraAsync).mockResolvedValue({ canceled: true, assets: null });

    await expect(captureStormPhoto()).resolves.toEqual({ status: 'canceled' });
  });

  it('does not automatically request a previously denied permission', async () => {
    jest
      .mocked(ImagePicker.getCameraPermissionsAsync)
      .mockResolvedValue(permission(ImagePicker.PermissionStatus.DENIED, true));

    await expect(captureStormPhoto()).resolves.toEqual({
      status: 'permission-denied',
      canAskAgain: true,
    });
    expect(ImagePicker.requestCameraPermissionsAsync).not.toHaveBeenCalled();
    expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
  });

  it('requests camera access after an explicit user retry', async () => {
    jest
      .mocked(ImagePicker.getCameraPermissionsAsync)
      .mockResolvedValue(permission(ImagePicker.PermissionStatus.DENIED, true));
    jest
      .mocked(ImagePicker.requestCameraPermissionsAsync)
      .mockResolvedValue(permission(ImagePicker.PermissionStatus.GRANTED, true));
    jest.mocked(ImagePicker.launchCameraAsync).mockResolvedValue({ canceled: true, assets: null });

    await expect(captureStormPhoto(true)).resolves.toEqual({ status: 'canceled' });
    expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('returns a temporary URI and immediate UTC timestamp after capture', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-14T23:01:02.000Z'));
    jest
      .mocked(ImagePicker.getCameraPermissionsAsync)
      .mockResolvedValue(permission(ImagePicker.PermissionStatus.GRANTED, true));
    jest.mocked(ImagePicker.launchCameraAsync).mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'file:///temporary/storm.jpg',
          width: 1200,
          height: 900,
          type: 'image',
        },
      ],
    });

    await expect(captureStormPhoto()).resolves.toEqual({
      status: 'success',
      temporaryPhotoUri: 'file:///temporary/storm.jpg',
      capturedAt: '2026-08-14T23:01:02.000Z',
    });
    expect(ImagePicker.launchCameraAsync).toHaveBeenCalledWith(
      expect.objectContaining({ allowsEditing: false, mediaTypes: ['images'] }),
    );
  });

  it('converts camera failures into an unavailable result', async () => {
    jest
      .mocked(ImagePicker.getCameraPermissionsAsync)
      .mockResolvedValue(permission(ImagePicker.PermissionStatus.GRANTED, true));
    jest.mocked(ImagePicker.launchCameraAsync).mockRejectedValue(new Error('native failure'));

    await expect(captureStormPhoto()).resolves.toEqual({ status: 'unavailable' });
  });
});
