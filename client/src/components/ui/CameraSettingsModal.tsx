import { useState, type FormEvent } from 'react';
import { Modal } from './Modal';
import {
  IP_CAMERA_ENABLED,
  normalizeCameraUrl,
  proxiedStreamUrl,
  setCameraSource,
  type CameraSource,
} from '../../lib/camera';
import { t } from '../../i18n/strings';

/** Pick this device's camera: built-in webcam or a phone/IP camera on the LAN. */
export function CameraSettingsModal({
  current,
  onSave,
  onClose,
}: {
  current: CameraSource;
  onSave: (source: CameraSource) => void;
  onClose: () => void;
}) {
  const [type, setType] = useState<CameraSource['type']>(current.type);
  const [url, setUrl] = useState(current.type === 'ip' ? current.url : 'http://192.168.1.');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const source: CameraSource =
      type === 'ip' ? { type: 'ip', url: normalizeCameraUrl(url) } : { type: 'webcam' };
    setCameraSource(source);
    onSave(source);
    onClose();
  }

  return (
    <Modal title={t('camera.title')} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
          <input type="radio" checked={type === 'webcam'} onChange={() => setType('webcam')} className="mt-1" />
          <span>
            <span className="block text-sm font-medium">{t('camera.webcam')}</span>
            <span className="block text-xs text-slate-500">{t('camera.webcamHint')}</span>
          </span>
        </label>

        {IP_CAMERA_ENABLED && (
        <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
          <input type="radio" checked={type === 'ip'} onChange={() => setType('ip')} className="mt-1" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">{t('camera.ip')}</span>
            <span className="block text-xs text-slate-500">{t('camera.ipHint')}</span>
            {type === 'ip' && (
              <span className="mt-2 block space-y-2">
                <input
                  className="input"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setPreviewUrl(null);
                  }}
                  placeholder="http://192.168.1.50:8080/video"
                  required
                />
                <button
                  type="button"
                  className="btn-secondary !py-1 text-xs"
                  onClick={() => {
                    const normalized = normalizeCameraUrl(url);
                    setUrl(normalized);
                    setPreviewFailed(false);
                    setPreviewUrl(proxiedStreamUrl(normalized));
                  }}
                >
                  {t('camera.test')}
                </button>
                {previewUrl && (
                  <span className="block overflow-hidden rounded-lg bg-black">
                    {previewFailed ? (
                      <span className="block px-3 py-4 text-center text-xs text-red-300">{t('camera.ipError')}</span>
                    ) : (
                      <img
                        src={previewUrl}
                        alt="camera preview"
                        className="max-h-48 w-full object-contain"
                        onError={() => setPreviewFailed(true)}
                      />
                    )}
                  </span>
                )}
              </span>
            )}
          </span>
        </label>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button className="btn-primary">{t('common.save')}</button>
        </div>
      </form>
    </Modal>
  );
}
