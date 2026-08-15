import * as ImagePicker from 'expo-image-picker';

export type CameraCaptureResult =
  | { status: 'success'; temporaryPhotoUri: string; capturedAt: string }
  | { status: 'canceled' }
  | { status: 'permission-denied'; canAskAgain: boolean }
  | { status: 'unavailable' };

export async function captureStormPhoto(
  requestAgainAfterDenial = false,
): Promise<CameraCaptureResult> {
  try {
    let permission = await ImagePicker.getCameraPermissionsAsync();

    if (permission.status === ImagePicker.PermissionStatus.DENIED && !requestAgainAfterDenial) {
      return { status: 'permission-denied', canAskAgain: permission.canAskAgain };
    }

    if (!permission.granted) {
      if (!permission.canAskAgain) {
        return { status: 'permission-denied', canAskAgain: false };
      }
      permission = await ImagePicker.requestCameraPermissionsAsync();
    }

    if (!permission.granted) {
      return { status: 'permission-denied', canAskAgain: permission.canAskAgain };
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      cameraType: ImagePicker.CameraType.back,
      mediaTypes: ['images'],
      quality: 0.9,
    });

    if (result.canceled) {
      return { status: 'canceled' };
    }

    const temporaryPhotoUri = result.assets[0]?.uri;
    if (!temporaryPhotoUri) {
      return { status: 'unavailable' };
    }

    return {
      status: 'success',
      temporaryPhotoUri,
      capturedAt: new Date().toISOString(),
    };
  } catch {
    return { status: 'unavailable' };
  }
}
