import { useEffect, useRef, useState } from 'react';
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
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadModels().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
        <CameraFeed source={source} elementRef={camRef} className="w-full" />
        {!ready && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-white">
            {t('monitor.loadingModels')}
          </div>
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
