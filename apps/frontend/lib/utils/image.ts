/**
 * Portrait handling for resume photos.
 *
 * A photo is stored inside the resume JSON (personalInfo.photo) and travels to the
 * print route with the rest of the data, so it has to stay small: the uploads are
 * redrawn to at most PHOTO_MAX_EDGE px on the long edge and re-encoded as JPEG.
 * That keeps a typical portrait at 20-60 KB instead of the multi-MB original.
 */

/** Longest edge kept from an uploaded portrait, in px (≈ 2x the largest print size). */
export const PHOTO_MAX_EDGE = 512;

/** Refuse anything larger before decoding it in the browser. */
export const PHOTO_MAX_FILE_BYTES = 12 * 1024 * 1024;

export const PHOTO_JPEG_QUALITY = 0.86;

export type PhotoErrorCode = 'type' | 'size' | 'decode' | 'unsupported';

export class PhotoError extends Error {
  code: PhotoErrorCode;

  constructor(code: PhotoErrorCode) {
    super(code);
    this.name = 'PhotoError';
    this.code = code;
  }
}

/** An uploaded data URL or a pasted http(s) link; anything else is not renderable. */
export function isPhotoValue(value?: string | null): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  return /^data:image\//i.test(trimmed) || /^https?:\/\//i.test(trimmed);
}

export function isUploadedPhoto(value?: string | null): boolean {
  return !!value && /^data:image\//i.test(value.trim());
}

/**
 * Read an image file into a downscaled JPEG data URL.
 *
 * Throws a PhotoError so the caller can show a localised message; the codes are
 * intentionally coarse because they all resolve to "pick another image".
 */
export async function fileToPhotoDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new PhotoError('type');
  if (file.size > PHOTO_MAX_FILE_BYTES) throw new PhotoError('size');

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new PhotoError('decode');
  }

  try {
    const scale = Math.min(1, PHOTO_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new PhotoError('unsupported');

    // JPEG has no alpha: fill first so a transparent PNG does not turn black.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', PHOTO_JPEG_QUALITY);
  } finally {
    bitmap.close?.();
  }
}
