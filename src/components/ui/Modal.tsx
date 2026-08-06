import type { ReactNode } from 'react';

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
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`max-h-[90vh] w-full ${wide ? 'max-w-3xl' : 'max-w-md'} overflow-y-auto rounded-xl bg-surface p-4 shadow-xl sm:p-6`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-2xl leading-none text-fg-subtle hover:text-fg-muted">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
