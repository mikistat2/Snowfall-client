import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { proxiedStreamUrl, type CameraElement, type CameraSource } from '../../lib/camera';
import { NATIVE } from '../../lib/platform';
import { t } from '../../i18n/strings';

/**
 * android.permission.CAMERA is declared in the manifest, but Android 6+ also
 * requires it to be granted at runtime — without that, getUserMedia inside the
 * WebView rejects and the feed never opens. The browser has no equivalent step
 * (the getUserMedia prompt *is* the permission), so this is native-only.
 *
 * Returns false only on an explicit denial. If the plugin cannot be loaded we
 * still let getUserMedia try, since Capacitor's WebChromeClient may prompt.
 */
async function ensureCameraPermission(): Promise<boolean> {
  if (!NATIVE) return true;
  try {
    const { Camera } = await import('@capacitor/camera');
    const current = await Camera.checkPermissions();
    if (current.camera === 'granted') return true;
    const asked = await Camera.requestPermissions({ permissions: ['camera'] });
    return asked.camera === 'granted';
  } catch {
    return true;
  }
}

/**
 * Renders the selected camera source and hands the underlying element to the
 * parent through `elementRef` so detection loops can read frames from it.
 * Webcam → <video> (getUserMedia); IP camera → <img> on the same-origin
 * MJPEG proxy (an <img> renders multipart JPEG streams natively).
 */
export function CameraFeed({
  source,
  elementRef,
  className,
  facingMode = 'user',
}: {
  source: CameraSource;
  elementRef: MutableRefObject<CameraElement | null>;
  className?: string;
  /** Which phone camera to use for the webcam source (front = 'user', back = 'environment'). */
  facingMode?: 'user' | 'environment';
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // null = fine; otherwise the message to show over the feed.
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    if (source.type !== 'webcam') return;

    let stream: MediaStream | null = null;
    let cancelled = false;
    (async () => {
      if (!(await ensureCameraPermission())) {
        if (!cancelled) setError(t('camera.permissionDenied'));
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          // ideal (not exact) so devices without the requested camera still work
          video: { width: 1280, height: 720, facingMode: { ideal: facingMode } },
        });
        if (cancelled || !videoRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        videoRef.current.srcObject = stream;
        elementRef.current = videoRef.current;
      } catch (err) {
        // A denial that slipped past the check above still reads as permission,
        // not as a missing camera — say which so the fix is obvious.
        const denied = err instanceof DOMException && err.name === 'NotAllowedError';
        if (!cancelled) setError(denied ? t('camera.permissionDenied') : t('monitor.cameraError'));
      }
    })();
    return () => {
      cancelled = true;
      elementRef.current = null;
      stream?.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source.type, facingMode]);

  if (source.type === 'ip') {
    return (
      <>
        <img
          src={proxiedStreamUrl(source.url)}
          alt=""
          className={className}
          ref={(el) => {
            elementRef.current = el;
          }}
          onError={() => setError(t('camera.ipError'))}
          onLoad={() => setError(null)}
        />
        {error && <FeedError text={error} />}
      </>
    );
  }

  return (
    <>
      <video ref={videoRef} autoPlay muted playsInline className={className} />
      {error && <FeedError text={error} />}
    </>
  );
}

function FeedError({ text }: { text: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 px-6 text-center text-sm text-white">
      {text}
    </div>
  );
}
