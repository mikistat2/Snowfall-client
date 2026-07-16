import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { proxiedStreamUrl, type CameraElement, type CameraSource } from '../../lib/camera';
import { t } from '../../i18n/strings';

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
}: {
  source: CameraSource;
  elementRef: MutableRefObject<CameraElement | null>;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    if (source.type !== 'webcam') return;

    let stream: MediaStream | null = null;
    let cancelled = false;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        if (cancelled || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        elementRef.current = videoRef.current;
      } catch {
        setError(true);
      }
    })();
    return () => {
      cancelled = true;
      elementRef.current = null;
      stream?.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source.type]);

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
          onError={() => setError(true)}
          onLoad={() => setError(false)}
        />
        {error && <FeedError text={t('camera.ipError')} />}
      </>
    );
  }

  return (
    <>
      <video ref={videoRef} autoPlay muted playsInline className={className} />
      {error && <FeedError text={t('monitor.cameraError')} />}
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
