import { useState } from 'react';
import { Modal } from './Modal';
import { t } from '../../i18n/strings';

/**
 * Shows a one-time t.me deep link as QR + copyable text. QR is rendered by
 * api.qrserver.com (requires internet — same as Telegram itself).
 */
export function TelegramLinkModal({ url, onClose }: { url: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;

  return (
    <Modal title={t('telegram.linkTitle')} onClose={onClose}>
      <div className="space-y-4 text-center">
        <img src={qr} alt="QR code" className="mx-auto h-[220px] w-[220px] rounded-lg border border-slate-200" />
        <p className="text-sm text-slate-500">{t('telegram.scanHint')}</p>
        <a href={url} target="_blank" rel="noreferrer" className="block break-all text-sm text-blue-600 hover:underline">
          {url}
        </a>
        <button
          className="btn-secondary"
          onClick={() => {
            void navigator.clipboard.writeText(url).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
        >
          {copied ? t('telegram.copied') : t('telegram.copy')}
        </button>
      </div>
    </Modal>
  );
}
