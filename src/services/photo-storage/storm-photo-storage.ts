import { Directory, File, Paths } from 'expo-file-system';

const STORM_PHOTO_DIRECTORY_NAME = 'storm-photos';
const STORM_PHOTO_URI_PREFIX = 'storm-photo://';
const supportedExtensions = new Set(['.heic', '.jpeg', '.jpg', '.png', '.webp']);

export type DurablePhotoCopyResult =
  | { status: 'success'; durablePhotoUri: string; storedPhotoUri: string }
  | { status: 'failure' };

export type DurablePhotoRemovalResult =
  | { status: 'removed' }
  | { status: 'missing' }
  | { status: 'failure' };

function stormPhotoDirectory(): Directory {
  return new Directory(Paths.document, STORM_PHOTO_DIRECTORY_NAME);
}

function safePhotoExtension(source: File): string {
  const extension = source.extension.toLowerCase();
  return supportedExtensions.has(extension) ? extension : '.jpg';
}

function legacyPhotoFileName(storedPhotoUri: string): string | null {
  const directoryMarker = `/${STORM_PHOTO_DIRECTORY_NAME}/`;
  const markerIndex = storedPhotoUri.lastIndexOf(directoryMarker);

  if (!storedPhotoUri.startsWith('file:') || markerIndex === -1) {
    return null;
  }

  return storedPhotoUri.slice(markerIndex + directoryMarker.length);
}

function safeStoredPhotoFileName(storedPhotoUri: string): string | null {
  const fileName = storedPhotoUri.startsWith(STORM_PHOTO_URI_PREFIX)
    ? storedPhotoUri.slice(STORM_PHOTO_URI_PREFIX.length)
    : legacyPhotoFileName(storedPhotoUri);

  if (
    fileName === null ||
    fileName.length === 0 ||
    fileName.includes('/') ||
    fileName.includes('\\')
  ) {
    return null;
  }

  const extensionStart = fileName.lastIndexOf('.');
  const extension = extensionStart === -1 ? '' : fileName.slice(extensionStart).toLowerCase();
  return supportedExtensions.has(extension) ? fileName : null;
}

function storedPhotoUri(fileName: string): string {
  return `${STORM_PHOTO_URI_PREFIX}${fileName}`;
}

export function resolveDurableStormPhotoUri(storedUri: string): string | null {
  try {
    const fileName = safeStoredPhotoFileName(storedUri);
    return fileName === null ? null : new File(stormPhotoDirectory(), fileName).uri;
  } catch {
    return null;
  }
}

export async function copyStormPhotoToDurableStorage(
  temporaryPhotoUri: string,
  stormId: string,
): Promise<DurablePhotoCopyResult> {
  let destination: File | null = null;

  try {
    const source = new File(temporaryPhotoUri);
    if (!source.exists) {
      return { status: 'failure' };
    }

    const directory = stormPhotoDirectory();
    directory.create({ idempotent: true, intermediates: true });
    const fileName = `${stormId}${safePhotoExtension(source)}`;
    destination = new File(directory, fileName);
    source.copy(destination);

    if (!destination.exists) {
      return { status: 'failure' };
    }

    return {
      status: 'success',
      durablePhotoUri: destination.uri,
      storedPhotoUri: storedPhotoUri(fileName),
    };
  } catch {
    if (destination?.exists) {
      try {
        destination.delete();
      } catch {
        // The caller never receives this URI, so there is no further safe cleanup target.
      }
    }
    return { status: 'failure' };
  }
}

export async function removeDurableStormPhoto(
  durablePhotoUri: string,
): Promise<DurablePhotoRemovalResult> {
  try {
    const ownedDirectoryUri = stormPhotoDirectory().uri;
    const directoryUri = ownedDirectoryUri.endsWith('/')
      ? ownedDirectoryUri
      : `${ownedDirectoryUri}/`;

    if (!durablePhotoUri.startsWith(directoryUri)) {
      return { status: 'failure' };
    }

    const photo = new File(durablePhotoUri);
    if (!photo.exists) {
      return { status: 'missing' };
    }

    photo.delete();
    return { status: 'removed' };
  } catch {
    return { status: 'failure' };
  }
}
