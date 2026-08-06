import { useCallback, useEffect, useRef, useState } from 'react';
import { detectSingleFace, loadModels, snapshot } from '../../lib/faceapi';
import { elementSize, getCameraSource, type CameraElement } from '../../lib/camera';
import { CameraFeed } from '../ui/CameraFeed';
import { t } from '../../i18n/strings';

export interface Capture {
  descriptor: number[];
  thumbnail: string;
}

/**
 * Camera capture with quality feedback (used by enrollment: 3–5 shots, and
 * guest passes: 1 shot). Uses the device's configured camera source — webcam
 * or a phone/IP camera (set from the Monitor page's Camera button).
 * Quality gates: a face must be detected, detector score ≥ 0.6, and the face
 * box must be ≥ 20% of the frame width (close enough to the camera).
 */
/** Camera-with-rotating-arrows, the conventional "switch camera" affordance. */
function FlipIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.2a1 1 0 0 0 .83-.45l.74-1.1A1 1 0 0 1 9.1 4h5.8a1 1 0 0 1 .83.45l.74 1.1a1 1 0 0 0 .83.45h1.2A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
      <path d="M9.5 12.5a2.5 2.5 0 0 1 4.27-1.77l1.23 1.19" />
      <path d="M14.5 12.5a2.5 2.5 0 0 1-4.27 1.77L9 13.08" />
      <path d="M15.4 9.6v2.32h-2.3M8.6 15.4v-2.32h2.3" />
    </svg>
  );
}

export function FaceCapture({
  captures,
  onChange,
  min = 3,
  max = 5,
  hint,
}: {
  captures: Capture[];
  onChange: (captures: Capture[]) => void;
  min?: number;
  max?: number;
  hint?: string;
}) {
  const camRef = useRef<CameraElement | null>(null);
  const [source] = useState(() => getCameraSource());
  const [models, setModels] = useState<'loading' | 'ready' | 'error'>('loading');
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  // Front camera by default (enrolling yourself / holding the phone up); the
  // back camera is better when a staff member photographs someone else.
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const ready = models === 'ready';

  // A cancelled-flag ref rather than a local, so a retry started after unmount
  // cannot resurrect state. `attempt` re-runs the effect on retry.
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setModels('loading');
    loadModels().then(
      () => {
        if (!cancelled) setModels('ready');
      },
      // Previously this had no rejection handler, so a failed load left `ready`
      // false forever and the overlay sat on "loading models…" with no way out.
      (err: unknown) => {
        // eslint-disable-next-line no-console
        console.error('[faceapi] model load failed', err);
        if (!cancelled) setModels('error');
      },
    );
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retryModels = useCallback(() => setAttempt((n) => n + 1), []);

  async function capture() {
    const cam = camRef.current;
    if (!cam || busy) return;
    const { width } = elementSize(cam);
    if (width === 0) {
      setFeedback({ ok: false, text: t('monitor.cameraError') });
      return;
    }
    setBusy(true);
    try {
      const face = await detectSingleFace(cam);
      if (!face) {
        setFeedback({ ok: false, text: t('enroll.noFace') });
        return;
      }
      if (face.score < 0.6) {
        setFeedback({ ok: false, text: t('enroll.lowQuality') });
        return;
      }
      if (face.box.width < width * 0.2) {
        setFeedback({ ok: false, text: t('enroll.tooSmall') });
        return;
      }
      setFeedback({ ok: true, text: t('enroll.good') });
      onChange([...captures, { descriptor: Array.from(face.descriptor), thumbnail: snapshot(cam, 160) }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">{hint ?? t('enroll.captureHint')}</p>
      <div className="relative overflow-hidden rounded-xl bg-black">
        <CameraFeed
          source={source}
          elementRef={camRef}
          className="w-full"
          facingMode={facingMode}
        />

        {/* Only the webcam source has two cameras to switch between; an IP
            stream is whatever the remote camera points at. */}
        {source.type === 'webcam' && (
          <button
            type="button"
            onClick={() => setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))}
            aria-label={t('camera.flip')}
            title={t('camera.flip')}
            className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur active:bg-black/70"
          >
            <FlipIcon className="h-5 w-5" />
          </button>
        )}

        {/* Sits below the feed's own error overlay in the stack, so a camera
            failure is never hidden behind a "loading models" message. */}
        {models === 'loading' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 px-6 text-center text-sm text-white">
            {t('monitor.loadingModels')}
          </div>
        )}
        {models === 'error' && (
          <button
            type="button"
            onClick={retryModels}
            className="absolute inset-x-0 bottom-0 bg-red-600/90 px-3 py-2 text-center text-xs text-white"
          >
            {t('camera.modelsFailed')}
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="btn-primary"
          onClick={capture}
          disabled={!ready || busy || captures.length >= max}
        >
          {t('enroll.capture')} ({captures.length}/{max})
        </button>
        {feedback && (
          <span className={`text-sm ${feedback.ok ? 'text-green-600' : 'text-orange-600'}`}>{feedback.text}</span>
        )}
      </div>
      {captures.length > 0 && (
        <div className="flex gap-2">
          {captures.map((c, i) => (
            <div key={i} className="relative">
              <img src={c.thumbnail} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <button
                type="button"
                title={t('enroll.retake')}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white"
                onClick={() => onChange(captures.filter((_, idx) => idx !== i))}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {captures.length < min && (
        <p className="text-xs text-slate-400">
          {t('enroll.captureAtLeast')} {min}
        </p>
      )}
    </div>
  );
}
