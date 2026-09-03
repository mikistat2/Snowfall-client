/**
 * Member profile photos: turning whatever the camera or gallery hands us into
 * the two small square renditions the API stores.
 *
 * All of the shrinking happens here, in the browser, before anything is
 * uploaded. The device already holds the original at full resolution and has a
 * canvas to resize it with; sending a 12 MP frame to the server so the server
 * can produce a 25 KB square would spend bandwidth on both legs to arrive at
 * the same place, on connections where bandwidth is the scarce thing.
 *
 * Deliberately built on plain web APIs rather than the Capacitor Camera plugin.
 * The same React bundle runs in the browser and inside the Android WebView, and
 * everything used here — createImageBitmap, canvas.toBlob, getUserMedia, a file
 * input — works in both. That keeps one code path instead of two, and means the
 * Android app needs no native change to gain this feature.
 */

/** Square edge lengths. `thumb` is the roster avatar, `full` the detail page. */
export const PHOTO_SIZES = { thumb: 96, full: 512 } as const;

/**
 * `full` was 256, chosen when the picture was "never full-bleed, never zoomed".
 * Tapping it on the detail page now opens it full-screen, so that premise is
 * gone: a phone at DPR 3 asks for roughly 900 device pixels down the long edge
 * of a lightbox, and 256 upscaled that far is a smear — which defeats the one
 * thing the enlargement is for, telling two members apart.
 *
 * 512 costs about 40-70 KB against 256's 15-25 KB, and only on the screens that
 * actually ask for it: the roster, the dashboard and every list read `thumb`,
 * so none of this touches the payload that egress was tuned around.
 *
 * `thumb` stays at 96 for the same reason it always was — it is the one that
 * ships per row.
 */
const QUALITY = { thumb: 0.7, full: 0.8 } as const;

export interface Renditions {
  thumb: string;
  full: string;
  /** Same for both, which the API requires. */
  type: string;
}

/** What we can turn into a photo: an uploaded file, or a live camera element. */
export type PhotoInput = Blob | HTMLVideoElement | HTMLImageElement;

export class PhotoError extends Error {}

/**
 * HEIC/HEIF cannot be decoded by canvas, so it must be rejected with something
 * a person can act on rather than failing as an unreadable image. Rare here —
 * it is an iPhone format and there is no iOS build — but a gallery can hold a
 * photo that arrived over Telegram or a memory card.
 */
const UNDECODABLE = ['image/heic', 'image/heif'];

async function toBitmap(blob: Blob): Promise<ImageBitmap> {
  if (UNDECODABLE.includes(blob.type)) {
    throw new PhotoError('This photo format (HEIC) is not supported. Take a new photo instead.');
  }
  try {
    // Honours the EXIF orientation flag, without which a portrait phone shot
    // arrives on its side.
    return await createImageBitmap(blob, { imageOrientation: 'from-image' });
  } catch {
    // Older WebViews reject the options argument outright rather than ignoring
    // it. Losing auto-rotation is much better than losing the feature.
    try {
      return await createImageBitmap(blob);
    } catch {
      throw new PhotoError('That file could not be read as an image.');
    }
  }
}

function sourceSize(input: Exclude<PhotoInput, Blob> | ImageBitmap): {
  width: number;
  height: number;
} {
  if (input instanceof HTMLVideoElement) {
    return { width: input.videoWidth, height: input.videoHeight };
  }
  if (input instanceof HTMLImageElement) {
    return { width: input.naturalWidth, height: input.naturalHeight };
  }
  return { width: input.width, height: input.height };
}

/**
 * Centre-crops to a square and scales to `size`.
 *
 * The crop is centred rather than face-aware: this runs on gyms without face
 * recognition, so there is no detector to ask, and a person photographed for
 * their profile is in the middle of the frame.
 */
function square(
  source: CanvasImageSource & (Exclude<PhotoInput, Blob> | ImageBitmap),
  size: number,
): HTMLCanvasElement {
  const { width, height } = sourceSize(source);
  const side = Math.min(width, height);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new PhotoError('This browser cannot process images.');
  ctx.drawImage(source, (width - side) / 2, (height - side) / 2, side, side, 0, 0, size, size);
  return canvas;
}

/**
 * Encodes as WebP, falling back to JPEG.
 *
 * The fallback is not optional politeness: an old Android WebView asked for
 * WebP may ignore the request and silently hand back a PNG, which for a
 * photograph is several times larger and would trip the server's size ceiling.
 * So the result is checked rather than trusted, and anything that is not WebP
 * is re-encoded as JPEG — which every engine can produce.
 */
function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (webp) => {
        if (webp?.type === 'image/webp') {
          resolve(webp);
          return;
        }
        canvas.toBlob(
          (jpeg) => (jpeg ? resolve(jpeg) : reject(new PhotoError('Could not encode the photo.'))),
          'image/jpeg',
          quality,
        );
      },
      'image/webp',
      quality,
    );
  });
}

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new PhotoError('Could not read the encoded photo.'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Produces both renditions from one source.
 *
 * Decoded once and drawn twice: decoding is the expensive step and the part
 * that runs a cheap phone out of memory, so the bitmap is reused and then
 * released explicitly. Without that `close()`, a few captures in a row can take
 * the WebView down.
 */
export async function makeRenditions(input: PhotoInput): Promise<Renditions> {
  const bitmap = input instanceof Blob ? await toBitmap(input) : null;
  const source = (bitmap ?? input) as CanvasImageSource &
    (Exclude<PhotoInput, Blob> | ImageBitmap);

  try {
    const { width, height } = sourceSize(source);
    if (!width || !height) throw new PhotoError('The camera is not ready yet.');

    const thumb = await encode(square(source, PHOTO_SIZES.thumb), QUALITY.thumb);
    const full = await encode(square(source, PHOTO_SIZES.full), QUALITY.full);

    // The API rejects a mismatched pair, and a browser that produced WebP for
    // one size will produce it for the other — but assert rather than assume,
    // because the failure would otherwise surface as a confusing 400.
    if (thumb.type !== full.type) {
      throw new PhotoError('The photo could not be encoded consistently. Try again.');
    }

    return {
      thumb: await toDataUrl(thumb),
      full: await toDataUrl(full),
      type: thumb.type,
    };
  } finally {
    bitmap?.close();
  }
}

/**
 * Renditions from an existing data URL — the face-capture path.
 *
 * Enrollment already holds a 160px JPEG snapshot of the frame it matched on, so
 * re-cropping that is both cheaper and more faithful than reopening the camera.
 * `fetch` on a data: URL is a local decode, not a network request.
 */
export async function renditionsFromDataUrl(dataUrl: string): Promise<Renditions> {
  return makeRenditions(await (await fetch(dataUrl)).blob());
}
