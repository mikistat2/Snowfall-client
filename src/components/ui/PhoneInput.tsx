import { useEffect, useMemo, useRef, useState } from 'react';
import { t } from '../../i18n/strings';
import { COUNTRIES, DEFAULT_COUNTRY, parsePhone, type Country } from '../../lib/countries';

type Props = {
  /** Full phone string, e.g. "+251912345678". Empty string when unset. */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
};

/**
 * Phone number field with a country-code + flag selector. Stores the combined
 * value as "+<dial><digits>" (e.g. "+251912345678"), or "" when the number is
 * empty so callers can treat it as "no phone". Flags render as images
 * (flag-icons), which — unlike emoji flags — display on every platform,
 * including Chrome/Edge on Windows.
 */
export function PhoneInput({ value, onChange, disabled, id }: Props) {
  const parsed = useMemo(() => parsePhone(value), [value]);
  // Remember the chosen country even while the number is empty (value === "",
  // which carries no dial code of its own).
  const [selected, setSelected] = useState<Country>(parsed.country);
  const country = value.trim().startsWith('+') ? parsed.country : selected;
  const local = value.trim().startsWith('+') ? parsed.local : value;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  function emit(nextCountry: Country, nextLocal: string) {
    const digits = nextLocal.replace(/[^\d]/g, '');
    onChange(digits ? `${nextCountry.dial}${digits}` : '');
  }

  function pickCountry(c: Country) {
    setSelected(c);
    setOpen(false);
    setSearch('');
    emit(c, local);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.iso.includes(q),
    );
  }, [search]);

  return (
    <div className="relative" ref={wrapRef}>
      <div
        className={`flex items-stretch rounded-lg border border-slate-300 ${
          disabled ? 'bg-slate-100 opacity-60' : 'bg-white'
        } focus-within:border-slate-500 focus-within:ring-1 focus-within:ring-slate-400`}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className="flex shrink-0 items-center gap-1.5 rounded-l-lg border-r border-slate-200 px-2.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed"
          aria-label={country.name}
        >
          <span className={`fi fi-${country.iso} rounded-[2px]`} />
          <span className="tabular-nums">{country.dial}</span>
          <svg
            className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          disabled={disabled}
          className="w-full min-w-0 rounded-r-lg bg-transparent px-3 py-2 text-sm outline-none disabled:cursor-not-allowed"
          value={local}
          onChange={(e) => emit(country, e.target.value)}
        />
      </div>

      {open && !disabled && (
        <div className="absolute z-30 mt-1 w-72 max-w-[85vw] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 p-2">
            <input
              autoFocus
              className="input"
              placeholder={t('phone.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-slate-400">{t('phone.noResults')}</li>
            )}
            {filtered.map((c) => (
              <li key={`${c.iso}-${c.dial}`}>
                <button
                  type="button"
                  onClick={() => pickCountry(c)}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                    c.iso === country.iso ? 'bg-slate-50 font-medium' : ''
                  }`}
                >
                  <span className={`fi fi-${c.iso} shrink-0 rounded-[2px]`} />
                  <span className="min-w-0 flex-1 truncate text-slate-700">{c.name}</span>
                  <span className="shrink-0 tabular-nums text-slate-400">{c.dial}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export { DEFAULT_COUNTRY };
