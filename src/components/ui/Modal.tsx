import { useEffect, useRef, type ReactNode } from 'react';
import { pushBackInterceptor } from '../../lib/backInterceptor';
import { useMobileShell } from '../../hooks/useIsMobile';
import { t } from '../../i18n/strings';
import { XIcon } from './icons';

/**
 * The app's dialog — a centred card on desktop, a bottom sheet on a phone.
 *
 * A centred box is a desktop shape: on a phone it lands mid-screen, gets
 * shoved around by the keyboard, and leaves its actions out of thumb reach.
 * The sheet form rises from the bottom edge, keeps the header pinned, and
 * scrolls its own body, which is what the platform's own dialogs do.
 *
 * Dismissal covers every convention at once: backdrop tap, the close button,
 * Escape, and Android's hardware back button.
 */
export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const isMobile = useMobileShell();

  // Keep the latest onClose without re-registering the interceptor on every render.
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

  // The dialog owns the viewport while it is open; letting the page behind it
  // scroll is the classic scroll-chaining bug.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex bg-black/50 motion-safe:animate-fade-in ${
        isMobile ? 'flex-col justify-end' : 'items-center justify-center p-4'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={
          isMobile
            ? 'flex max-h-[92dvh] flex-col rounded-t-3xl bg-surface shadow-2xl motion-safe:animate-sheet-up'
            : `flex max-h-[90vh] w-full flex-col ${wide ? 'max-w-3xl' : 'max-w-md'} rounded-2xl bg-surface shadow-xl motion-safe:animate-rise-in`
        }
      >
        {isMobile && (
          <div className="flex shrink-0 justify-center pt-2.5">
            <span className="h-1 w-10 rounded-full bg-fg-subtle/40" />
          </div>
        )}

        <div
          className={`flex shrink-0 items-center justify-between gap-3 px-4 sm:px-6 ${
            isMobile ? 'pb-3 pt-3' : 'pb-3 pt-5'
          }`}
        >
          <h2 className="min-w-0 truncate text-base font-bold text-fg sm:text-lg">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-fg-subtle transition-colors hover:text-fg active:bg-surface-2"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div
          className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 ${
            isMobile ? 'pb-safe-b' : 'pb-5'
          }`}
        >
          {children}
          {/* Breathing room above the gesture bar so the last control is tappable. */}
          {isMobile && <div className="h-4" />}
        </div>
      </div>
    </div>
  );
}
