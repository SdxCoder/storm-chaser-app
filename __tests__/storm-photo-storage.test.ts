import { Paths } from 'expo-file-system';

import {
  copyStormPhotoToDurableStorage,
  resolveDurableStormPhotoUri,
} from '../src/services/photo-storage/storm-photo-storage';

type FileSystemEntry = { uri: string };

jest.mock('expo-file-system', () => {
  class MockDirectory {
    readonly uri: string;

    constructor(parent: FileSystemEntry, name: string) {
      this.uri = `${parent.uri.replace(/\/$/, '')}/${name}`;
    }

    create() {}
  }

  class MockFile {
    exists = true;
    readonly extension: string;
    readonly uri: string;

    constructor(parent: FileSystemEntry | string, name?: string) {
      const parentUri = typeof parent === 'string' ? parent : parent.uri;
      this.uri = name === undefined ? parentUri : `${parentUri.replace(/\/$/, '')}/${name}`;
      const extensionStart = this.uri.lastIndexOf('.');
      this.extension = extensionStart === -1 ? '' : this.uri.slice(extensionStart);
    }

    copy() {}

    delete() {
      this.exists = false;
    }
  }

  return {
    Directory: MockDirectory,
    File: MockFile,
    Paths: { document: { uri: 'file:///containers/first/Documents' } },
  };
});

describe('durable storm photo URI resolution', () => {
  afterEach(() => {
    (Paths.document as unknown as FileSystemEntry).uri = 'file:///containers/first/Documents';
  });

  it('resolves a stable stored URI from the current document directory', () => {
    (Paths.document as unknown as FileSystemEntry).uri = 'file:///containers/second/Documents';

    expect(resolveDurableStormPhotoUri('storm-photo://storm-test-123.jpg')).toBe(
      'file:///containers/second/Documents/storm-photos/storm-test-123.jpg',
    );
  });

  it('copies to the current durable directory but returns a stable locator for SQLite', async () => {
    (Paths.document as unknown as FileSystemEntry).uri = 'file:///containers/current/Documents';

    await expect(
      copyStormPhotoToDurableStorage(
        'file:///temporary/camera-capture.heic',
        'storm-test-123',
      ),
    ).resolves.toEqual({
      status: 'success',
      durablePhotoUri:
        'file:///containers/current/Documents/storm-photos/storm-test-123.heic',
      storedPhotoUri: 'storm-photo://storm-test-123.heic',
    });
  });

  it('rebases a legacy absolute URI after the app-container root changes', () => {
    (Paths.document as unknown as FileSystemEntry).uri = 'file:///containers/new/Documents';

    expect(
      resolveDurableStormPhotoUri(
        'file:///containers/old/Documents/storm-photos/storm-test-123.jpg',
      ),
    ).toBe('file:///containers/new/Documents/storm-photos/storm-test-123.jpg');
  });

  it.each([
    'storm-photo://../outside.jpg',
    'storm-photo://nested/photo.jpg',
    'storm-photo://photo.txt',
    'file:///temporary/photo.jpg',
  ])('rejects an invalid or unowned locator: %s', (storedUri) => {
    expect(resolveDurableStormPhotoUri(storedUri)).toBeNull();
  });
});
