import { useEffect, useRef } from 'react';
import { pushBackInterceptor } from '../../lib/backInterceptor';
import { t } from '../../i18n/strings';
import { XIcon } from './icons';

/**
 * A member's photo, as large as the screen usefully allows.
 *
 * Deliberately not the app's `Modal`: that is a titled card on desktop and a
 * bottom sheet on a phone, both of which frame the picture in chrome and cap it
 * well below the space available. What this screen is for is looking at a face,
 * so the picture gets the viewport and everything else gets out of the way.
 *
 * Dismissal matches Modal's, because a viewer that traps someone is worse than
 * no viewer: backdrop tap, the close button, Escape, and Android's hardware
 * back — the last via the same interceptor stack Modal uses, so back closes
 * this rather than popping the route out from under it.
 */
export function PhotoLightbox({
  src,
  caption,
  onClose,
}: {
  src: string;
  /** The member's name — shown under the picture and used as the alt text. */
  caption: string;
  onClose: () => void;
}) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => pushBackInterceptor(() => closeRef.current()), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-black/85 p-4 motion-safe:animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={caption}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t('common.close')}
        /* `mt-safe-t` pushes it clear of the notch: this overlay covers the
           status bar, so a button at plain top-3 sits under it on a phone. */
        className="absolute right-3 top-3 mt-safe-t flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
      >
        <XIcon className="h-6 w-6" />
      </button>

      {/*
        Capped at the 512px the stored rendition actually is. Stretching it to
        fill a tall screen would only invent pixels, and a soft, blown-up face
        is worse at the one job this view has.
      */}
      <img
        src={src}
        alt={caption}
        className="max-h-[min(75vh,32rem)] max-w-[min(90vw,32rem)] rounded-2xl object-contain shadow-2xl"
        decoding="async"
      />
      <p className="max-w-[90vw] truncate text-center text-sm font-medium text-white/90">{caption}</p>
    </div>
  );
}
