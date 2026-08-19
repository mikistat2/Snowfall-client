import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { pushBackInterceptor } from '../../lib/backInterceptor';
import { useMobileShell } from '../../hooks/useIsMobile';
import { t } from '../../i18n/strings';
import { CheckIcon, ChevronDownIcon, SearchIcon } from './icons';

/**
 * The app's dropdown — one control, two presentations.
 *
 * A native `<select>` renders as the platform's own widget, which in the
 * Android WebView is a grey system dialog that ignores the app's theme,
 * cannot show a second line of detail, and looks nothing like the rest of the
 * screen. This replaces it everywhere:
 *
 *  - phone / narrow viewport → a bottom sheet with 44px rows, reachable by
 *    thumb, dismissed by backdrop tap or the hardware back button;
 *  - desktop → an anchored popover with full keyboard control.
 *
 * Both render through a portal on `document.body`, so a dropdown inside a
 * modal or a scrolling card is never clipped by its ancestors.
 */

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
  /** Secondary line — plan price, phone number, anything that aids the choice. */
  hint?: string;
  /** Leading glyph or swatch. */
  icon?: ReactNode;
  disabled?: boolean;
}

interface Props<T extends string | number> {
  value: T | '';
  onChange: (value: T) => void;
  options: readonly SelectOption<T>[];
  /** Shown when nothing is selected, and as the label of the clear row. */
  placeholder?: string;
  /** Sheet/popover heading — defaults to the placeholder. */
  label?: string;
  /** Adds a row that selects the empty value. */
  clearable?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  /** Extra classes on the trigger (width, etc.). */
  className?: string;
  /** Force the filter box; otherwise it appears once the list is long. */
  searchable?: boolean;
  /** Replaces the default `.input` trigger styling (compact/embedded triggers). */
  triggerClassName?: string;
  /** Replaces the trigger's contents — label + chevron by default. */
  renderTrigger?: (selected: SelectOption<T> | undefined, open: boolean) => ReactNode;
  'aria-label'?: string;
}

/** Long enough that scanning beats scrolling. */
const SEARCH_THRESHOLD = 8;

export function Select<T extends string | number>({
  value,
  onChange,
  options,
  placeholder = '—',
  label,
  clearable = false,
  disabled = false,
  id,
  name,
  className = '',
  searchable,
  triggerClassName,
  renderTrigger,
  'aria-label': ariaLabel,
}: Props<T>) {
  const isMobile = useMobileShell();
  const generatedId = useId();
  const listboxId = `${id ?? generatedId}-listbox`;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);
  const withSearch = searchable ?? options.length > SEARCH_THRESHOLD;

  const rows = useMemo(() => {
    const base: SelectOption<T | ''>[] = clearable
      ? [{ value: '' as const, label: placeholder }, ...options]
      : [...options];
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (o) => o.label.toLowerCase().includes(q) || (o.hint ?? '').toLowerCase().includes(q),
    );
  }, [options, clearable, placeholder, search]);

  function close() {
    setOpen(false);
    setSearch('');
    setActiveIndex(-1);
    triggerRef.current?.focus();
  }

  function choose(option: SelectOption<T | ''>) {
    if (option.disabled) return;
    onChange(option.value as T);
    close();
  }

  // Open on the current selection so arrow keys continue from where the user is.
  function openList() {
    if (disabled) return;
    setActiveIndex(Math.max(0, rows.findIndex((o) => o.value === value)));
    setOpen(true);
  }

  // Android's back button dismisses the sheet instead of leaving the screen.
  useEffect(() => {
    if (!open) return;
    return pushBackInterceptor(() => close());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Click-away and Escape, for both presentations.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (listRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      // Capture phase + stopImmediatePropagation so Escape closes only this
      // dropdown. A dropdown inside a Modal would otherwise dismiss the whole
      // dialog: both listeners sit on document, and the Modal's was
      // registered first.
      e.stopImmediatePropagation();
      close();
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open && withSearch && !isMobile) searchRef.current?.focus();
  }, [open, withSearch, isMobile]);

  // Keep the highlighted row in view while arrowing through a long list.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      openList();
    }
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((current) => {
        // Skip disabled rows rather than parking the highlight on them.
        for (let i = 1; i <= rows.length; i += 1) {
          const next = (current + step * i + rows.length * i) % rows.length;
          if (!rows[next]?.disabled) return next;
        }
        return current;
      });
      return;
    }
    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      setActiveIndex(e.key === 'Home' ? 0 : rows.length - 1);
      return;
    }
    if (e.key === 'Enter' || (e.key === ' ' && !withSearch)) {
      e.preventDefault();
      const option = rows[activeIndex];
      if (option) choose(option);
    }
  }

  const heading = label ?? ariaLabel ?? placeholder;

  const list = (
    <div
      role="listbox"
      id={listboxId}
      aria-label={heading}
      aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1"
    >
      {rows.length === 0 && (
        <p className="px-4 py-6 text-center text-sm text-fg-muted">{t('select.noResults')}</p>
      )}
      {rows.map((option, index) => {
        const isSelected = option.value === (value === '' ? '' : value);
        const isActive = index === activeIndex;
        return (
          <button
            key={`${option.value}`}
            id={`${listboxId}-${index}`}
            data-index={index}
            type="button"
            role="option"
            aria-selected={isSelected}
            disabled={option.disabled}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => choose(option)}
            className={`flex w-full items-center gap-3 px-4 text-left transition-colors disabled:opacity-40 ${
              isMobile ? 'min-h-touch py-3' : 'py-2'
            } ${isActive ? 'bg-surface-2' : ''} ${isSelected ? 'text-accent' : 'text-fg'}`}
          >
            {option.icon && <span className="shrink-0">{option.icon}</span>}
            <span className="min-w-0 flex-1">
              <span className={`block truncate ${isMobile ? 'text-[15px]' : 'text-sm'} ${isSelected ? 'font-semibold' : ''}`}>
                {option.label}
              </span>
              {option.hint && <span className="mt-0.5 block truncate text-xs text-fg-muted">{option.hint}</span>}
            </span>
            {isSelected && <CheckIcon className="h-5 w-5 shrink-0 text-accent" />}
          </button>
        );
      })}
    </div>
  );

  const searchBox = withSearch ? (
    <div className="shrink-0 px-3 pb-2 pt-1">
      <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-3">
        <SearchIcon className="h-4 w-4 shrink-0 text-fg-subtle" />
        <input
          ref={searchRef}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setActiveIndex(0);
          }}
          placeholder={t('select.search')}
          className={`w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle ${
            isMobile ? 'py-3' : 'py-2'
          }`}
        />
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        name={name}
        disabled={disabled}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabel}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onTriggerKeyDown}
        className={`${
          triggerClassName ??
          `input flex items-center gap-2 text-left ${open ? 'border-accent ring-2 ring-accent/25' : ''}`
        } ${disabled ? 'cursor-not-allowed opacity-60' : ''} ${className}`}
      >
        {renderTrigger ? (
          renderTrigger(selected, open)
        ) : (
          <>
            <span className={`min-w-0 flex-1 truncate ${selected ? 'text-fg' : 'text-fg-subtle'}`}>
              {selected ? selected.label : placeholder}
            </span>
            <ChevronDownIcon
              className={`h-4 w-4 shrink-0 text-fg-subtle transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </>
        )}
      </button>

      {open && isMobile && createPortal(
        <div className="fixed inset-0 z-[60] flex flex-col justify-end" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 motion-safe:animate-fade-in" />
          <div
            ref={listRef}
            onKeyDown={onListKeyDown}
            className="relative flex max-h-[70dvh] flex-col rounded-t-3xl bg-surface pb-safe-b shadow-2xl motion-safe:animate-sheet-up"
          >
            <div className="flex shrink-0 justify-center pt-2.5">
              <span className="h-1 w-10 rounded-full bg-fg-subtle/40" />
            </div>
            <h2 className="shrink-0 px-4 pb-2 pt-3 text-sm font-semibold text-fg">{heading}</h2>
            {searchBox}
            {list}
          </div>
        </div>,
        document.body,
      )}

      {open && !isMobile && (
        <Popover anchor={triggerRef.current} onKeyDown={onListKeyDown} listRef={listRef}>
          {searchBox}
          {list}
        </Popover>
      )}
    </>
  );
}

/**
 * Desktop popover, positioned in viewport coordinates against the trigger and
 * portalled to the body — the previous inline approach was clipped by any
 * scrolling ancestor (modals, the platform panel's tables).
 */
function Popover({
  anchor,
  children,
  onKeyDown,
  listRef,
}: {
  anchor: HTMLElement | null;
  children: ReactNode;
  onKeyDown: (e: React.KeyboardEvent) => void;
  listRef: React.RefObject<HTMLDivElement>;
}) {
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });

  useLayoutEffect(() => {
    if (!anchor) return;
    function place() {
      const rect = anchor!.getBoundingClientRect();
      const below = window.innerHeight - rect.bottom;
      // Flip above when the space below cannot hold a usable list.
      const openUp = below < 220 && rect.top > below;
      setStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        maxHeight: Math.min(320, (openUp ? rect.top : below) - 12),
        ...(openUp ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }),
      });
    }
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [anchor]);

  return createPortal(
    <div
      ref={listRef}
      onKeyDown={onKeyDown}
      style={style}
      className="z-[60] flex min-w-[10rem] flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-xl motion-safe:animate-fade-in"
    >
      {children}
    </div>,
    document.body,
  );
}
