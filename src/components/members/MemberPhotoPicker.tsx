import { useEffect, useRef, useState } from 'react';
import { CameraFeed } from '../ui/CameraFeed';
import { CameraIcon, FlipCameraIcon, ImageIcon, TrashIcon, UserIcon } from '../ui/icons';
import { getCameraSource } from '../../lib/camera';
import type { CameraElement } from '../../lib/camera';
import { PhotoError, makeRenditions, type Renditions } from '../../lib/photo';
import { t } from '../../i18n/strings';
import { NATIVE } from '../../lib/platform';

/**
 * Picking a member's profile picture: take one now, or choose an existing file.
 *
 * Built on plain web APIs (getUserMedia through CameraFeed, and a file input)
 * rather than the Capacitor Camera plugin, so the one component serves the
 * browser and the Android WebView with no native code and no second code path.
 * CameraFeed already asks for the Android camera permission where it needs to.
 *
 * Nothing is uploaded here. The picker hands the parent a pending value and the
 * parent saves it with the rest of the form — so a staff member who changes
 * their mind and closes the modal has changed nothing, which is what closing a
 * modal ought to mean.
 */

/**
 * `null` = untouched, leave whatever is stored alone.
 * `'remove'` = delete the existing picture on save.
 * `Renditions` = replace it with these bytes on save.
 */
export type PhotoValue = Renditions | 'remove' | null;

/**
 * True when the device has more than one camera to switch between.
 *
 * A flip button on a desk PC with a single webcam is a control that visibly
 * does nothing, so it only appears where it has somewhere to go. Working out
 * where that is turns out to need two different answers:
 *
 * On the Android app it is simply always true. `enumerateDevices` was tried
 * first, on the assumption that it reports the *existence* of devices before
 * permission is granted and withholds only their labels. That is how it behaves
 * in a desktop browser; in the Android WebView it returned nothing useful until
 * a stream was already open, so the button never appeared on the one platform
 * that most needs it. A phone has a front and a back camera — there is nothing
 * to detect.
 *
 * In a browser it is a real question, and one whose answer improves once the
 * camera is running: an unpermissioned `enumerateDevices` can under-report, but
 * after `getUserMedia` succeeds the list is complete. So it is asked again when
 * the camera opens, and the button can appear a moment later. That is a better
 * failure than a button that promises a second camera which is not there.
 *
 * `active` should be true while the camera view is open.
 */
function useHasMultipleCameras(active: boolean): boolean {
  const [multiple, setMultiple] = useState(NATIVE);

  useEffect(() => {
    if (NATIVE) return;
    let cancelled = false;
    navigator.mediaDevices
      ?.enumerateDevices?.()
      .then((devices) => {
        if (!cancelled) {
          setMultiple(devices.filter((d) => d.kind === 'videoinput').length > 1);
        }
      })
      .catch(() => {
        /* no support — leave the button hidden */
      });
    return () => {
      cancelled = true;
    };
    // Re-asked when the camera opens: the device list is only reliably complete
    // once a stream has been granted.
  }, [active]);

  return multiple;
}

export function MemberPhotoPicker({
  currentUrl,
  value,
  onChange,
  disabled,
}: {
  /** The stored picture, if any — `photo_full_url` from the member. */
  currentUrl: string | null;
  value: PhotoValue;
  onChange: (value: PhotoValue) => void;
  disabled?: boolean;
}) {
  const [capturing, setCapturing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<CameraElement | null>(null);

  /**
   * Which lens the camera view is using.
   *
   * Starts on the front camera because that is the only one a desk PC has, and
   * CameraFeed asks for it as `ideal` rather than `exact` — so a device without
   * a front camera silently gets whatever it does have instead of failing.
   * Staff photographing a member across the desk flip to the back lens.
   */
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  // Read once per mount: it comes from device-local storage, and re-reading it
  // on every render would hand CameraFeed a new object each time.
  const [source] = useState(getCameraSource);
  const hasMultipleCameras = useHasMultipleCameras(capturing);
  // An IP camera is a fixed stream on the wall with one point of view —
  // `facingMode` means nothing to it, so the button would be a no-op.
  const canFlip = hasMultipleCameras && source.type === 'webcam';

  // What the circle shows right now: a pending capture wins over the stored
  // picture, and a pending removal hides it.
  const preview =
    value === 'remove' ? null : typeof value === 'object' && value ? value.full : currentUrl;
  const locked = Boolean(disabled) || busy;

  async function run(make: () => Promise<Renditions>) {
    setBusy(true);
    setError('');
    try {
      onChange(await make());
      setCapturing(false);
    } catch (err) {
      // PhotoError messages are written for the person holding the phone
      // ("Take a new photo instead"); anything else is a surprise and should
      // not be shown raw.
      setError(err instanceof PhotoError ? err.message : 'Could not process that photo.');
    } finally {
      setBusy(false);
    }
  }

  function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset immediately so picking the same file twice in a row still fires.
    event.target.value = '';
    if (file) void run(() => makeRenditions(file));
  }

  if (capturing) {
    return (
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-2xl border border-line bg-black shadow-inner">
          {/*
            The front camera is mirrored, the back one is not.

            A preview that is not mirrored on a selfie lens makes framing feel
            backwards — you move left and the image goes right. This flips only
            the CSS presentation: the capture reads pixels from the video
            element itself, so the SAVED photo is always the true, unmirrored
            image. That matters for an ID photo, where mirrored text on a shirt
            or a scar on the wrong cheek is a real identification problem.
          */}
          <CameraFeed
            source={source}
            elementRef={cameraRef}
            facingMode={facing}
            className={`h-64 w-full object-cover ${facing === 'user' && source.type === 'webcam' ? 'scale-x-[-1]' : ''}`}
          />
          {/*
            A circular guide over the live feed. The saved image is a centre
            crop to a square, so without something to aim at, staff frame the
            shot wide and the crop takes half a face. Purely decorative — it
            must not intercept the click on the capture button below.
          */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="h-44 w-44 rounded-full border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
          </div>

          {canFlip && (
            <button
              type="button"
              disabled={busy}
              onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))}
              // Over the feed rather than in the button row below: it changes
              // what you are looking at, so it belongs on the thing it changes.
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-50"
              aria-label={t('photo.flip')}
              title={t('photo.flip')}
            >
              <FlipCameraIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {error && <p className="text-sm font-medium text-danger">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            className="btn-primary flex-1"
            disabled={busy}
            onClick={() => {
              const el = cameraRef.current;
              if (!el) {
                setError('The camera is not ready yet.');
                return;
              }
              void run(() => makeRenditions(el));
            }}
          >
            <CameraIcon className="h-4 w-4" />
            {busy ? t('common.loading') : t('photo.capture')}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setCapturing(false);
              setError('');
            }}
          >
            {t('photo.cancel')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {/*
          The avatar is the control, not just a preview: tapping it opens the
          camera, which is the action people reach for first and the largest
          target on the row. A ring rather than a plain edge so the circle reads
          as a deliberate frame against the card behind it.
        */}
        <button
          type="button"
          disabled={locked}
          onClick={() => {
            setError('');
            setCapturing(true);
          }}
          className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-line transition-all hover:ring-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={preview ? t('photo.change') : t('photo.add')}
        >
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-surface-2 text-fg-subtle">
              <UserIcon className="h-9 w-9" />
            </span>
          )}
          {/* Hover affordance — the circle is clickable, which a static image
              gives no sign of. */}
          <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <CameraIcon className="h-6 w-6" />
          </span>
          {busy && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/55">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </span>
          )}
        </button>

        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {/*
              Accent-tinted rather than `btn-primary`. This picker sits inside
              the edit modal, which already has one primary button — Save — and
              two competing primaries leave a staff member unsure which one
              commits their work. The tint marks this as the leading choice of
              the pair without claiming the form's main action.
            */}
            <button
              type="button"
              className="btn border border-accent/40 bg-accent-soft text-accent hover:bg-accent hover:text-white"
              disabled={locked}
              onClick={() => {
                setError('');
                setCapturing(true);
              }}
            >
              <CameraIcon className="h-4 w-4" />
              {t('photo.take')}
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={locked}
              onClick={() => fileRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4" />
              {t('photo.choose')}
            </button>
            {preview && (
              <button
                type="button"
                className="btn-ghost text-danger hover:bg-red-500/10"
                disabled={locked}
                onClick={() => {
                  setError('');
                  // A pending capture is discarded outright; a stored picture
                  // is marked for deletion on save.
                  onChange(currentUrl ? 'remove' : null);
                }}
                aria-label={t('photo.remove')}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* One status line, so the row's height does not jump as it changes. */}
          <p
            className={`text-xs leading-relaxed ${error ? 'font-medium text-danger' : 'text-fg-subtle'}`}
          >
            {error ||
              (busy
                ? t('common.loading')
                : typeof value === 'object' && value
                  ? t('photo.pending')
                  : value === 'remove'
                    ? t('photo.willRemove')
                    : t('photo.hint'))}
          </p>
        </div>
      </div>

      {/*
        No `capture` attribute.

        It was here on the assumption that it is a hint a desktop ignores. On
        Android it is not a hint: the WebView honours it and opens the camera
        directly, so "Choose from gallery" went straight past the gallery to a
        viewfinder. Without it the input opens the system picker on every
        platform, which is the only thing this button should ever do — taking a
        photo has its own button.
      */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />
    </div>
  );
}
