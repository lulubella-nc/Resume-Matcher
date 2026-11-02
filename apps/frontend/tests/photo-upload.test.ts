import { describe, expect, it } from 'vitest';
import {
  PHOTO_MAX_FILE_BYTES,
  PhotoError,
  fileToPhotoDataUrl,
  isPhotoValue,
  isUploadedPhoto,
} from '@/lib/utils/image';

const fileOf = (type: string, bytes = 1024) => new File([new Uint8Array(bytes)], 'photo', { type });

describe('photo value predicates', () => {
  it('accepts uploaded data URLs and http(s) links only', () => {
    expect(isPhotoValue('data:image/jpeg;base64,AAAA')).toBe(true);
    expect(isPhotoValue('https://example.com/a.jpg')).toBe(true);
    expect(isPhotoValue('http://example.com/a.png')).toBe(true);
    expect(isPhotoValue('javascript:alert(1)')).toBe(false);
    expect(isPhotoValue('  ')).toBe(false);
    expect(isPhotoValue(undefined)).toBe(false);
  });

  it('tells uploaded portraits apart from links', () => {
    expect(isUploadedPhoto('data:image/png;base64,AAAA')).toBe(true);
    expect(isUploadedPhoto('https://example.com/a.jpg')).toBe(false);
    expect(isUploadedPhoto(null)).toBe(false);
  });
});

describe('fileToPhotoDataUrl guards', () => {
  it('rejects a file that is not an image', async () => {
    await expect(fileToPhotoDataUrl(fileOf('application/pdf'))).rejects.toMatchObject({
      code: 'type',
    });
  });

  it('rejects an image over the size limit before decoding it', async () => {
    const error = await fileToPhotoDataUrl(fileOf('image/jpeg', PHOTO_MAX_FILE_BYTES + 1)).catch(
      (caught: unknown) => caught
    );
    expect(error).toBeInstanceOf(PhotoError);
    expect((error as PhotoError).code).toBe('size');
  });
});
