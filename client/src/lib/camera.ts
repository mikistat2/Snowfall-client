import { API_ORIGIN, tokenStore } from './api';

/**
 * Camera source is a per-device choice (each monitor PC/phone picks its own),
 * so it lives in localStorage — not in gym settings.
 *
 * 'webcam' — the browser's own camera via getUserMedia (default)
 * 'ip'     — a LAN camera stream, e.g. the IP Webcam Android app:
 *            install "IP Webcam" (Pavel Khlebovich) → Start server →
 *            use http://<phone-ip>:8080/video (MJPEG). Also works with any
 *            camera that serves MJPEG/JPEG over HTTP on the local network.
 */
export type CameraSource = { type: 'webcam' } | { type: 'ip'; url: string };

/** Elements face-api can read frames from. */
export type CameraElement = HTMLVideoElement | HTMLImageElement;

const KEY = 'cameraSource';

/**
 * IP/phone cameras only work when the server shares the gym's LAN, so the
 * option is opt-in via VITE_ENABLE_IP_CAMERA=true (local/on-prem installs).
 * Cloud deployments (Vercel + Render) leave it unset → webcam only.
 */
export const IP_CAMERA_ENABLED = import.meta.env.VITE_ENABLE_IP_CAMERA === 'true';

export function getCameraSource(): CameraSource {
  if (!IP_CAMERA_ENABLED) return { type: 'webcam' };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CameraSource;
      if (parsed.type === 'ip' && typeof parsed.url === 'string' && parsed.url) return parsed;
    }
  } catch {
    /* fall through to default */
  }
  return { type: 'webcam' };
}

export function setCameraSource(source: CameraSource): void {
  localStorage.setItem(KEY, JSON.stringify(source));
}

/**
 * Users often paste the camera app's base URL (http://192.168.0.176:8080),
 * which serves an HTML page — the MJPEG stream lives at /video (IP Webcam's
 * convention). Append it when no path was given.
 */
export function normalizeCameraUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '');
  try {
    const url = new URL(trimmed);
    if (url.pathname === '' || url.pathname === '/') return `${trimmed}/video`;
  } catch {
    /* leave malformed input as-is; the proxy will reject it with a clear error */
  }
  return trimmed;
}

/** Proxied URL for an IP camera stream (see server camera-proxy). */
export function proxiedStreamUrl(url: string): string {
  return `${API_ORIGIN}/api/v1/camera-proxy?url=${encodeURIComponent(url)}&token=${encodeURIComponent(tokenStore.access ?? '')}`;
}

/** Current frame dimensions; {0,0} until the source has delivered a frame. */
export function elementSize(el: CameraElement): { width: number; height: number } {
  if (el instanceof HTMLVideoElement) return { width: el.videoWidth, height: el.videoHeight };
  return { width: el.naturalWidth, height: el.naturalHeight };
}
