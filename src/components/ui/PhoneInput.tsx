import { useMemo, useState } from 'react';
import { Select } from './Select';
import { ChevronDownIcon } from './icons';
import { t } from '../../i18n/strings';
import { COUNTRIES, DEFAULT_COUNTRY, parsePhone, type Country } from '../../lib/countries';

type Props = {
  /** Full phone string, e.g. "+251912345678". Empty string when unset. */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
};

/** Two countries can share a dial code (+1), so the key carries both. */
function keyOf(country: Country): string {
  return `${country.iso}-${country.dial}`;
}

/**
 * Phone number field with a country-code + flag selector. Stores the combined
 * value as "+<dial><digits>" (e.g. "+251912345678"), or "" when the number is
 * empty so callers can treat it as "no phone". Flags render as images
 * (flag-icons), which — unlike emoji flags — display on every platform,
 * including Chrome/Edge on Windows.
 *
 * The country list is the shared `<Select>` with a compact trigger, so it
 * behaves exactly like every other dropdown in the app: a searchable bottom
 * sheet with 44px rows on a phone, an anchored popover on desktop. It used to
 * carry its own popover with 32px rows, which was the hardest thing in the app
 * to hit with a thumb — and the field is wide enough to deserve its own row
 * wherever it appears.
 */
export function PhoneInput({ value, onChange, disabled, id }: Props) {
  const parsed = useMemo(() => parsePhone(value), [value]);
  // Remember the chosen country even while the number is empty (value === "",
  // which carries no dial code of its own).
  const [selected, setSelected] = useState<Country>(parsed.country);
  const country = value.trim().startsWith('+') ? parsed.country : selected;
  const local = value.trim().startsWith('+') ? parsed.local : value;

  const options = useMemo(
    () =>
      COUNTRIES.map((c) => ({
        value: keyOf(c),
        label: c.name,
        hint: c.dial,
        icon: <span className={`fi fi-${c.iso} rounded-[2px]`} />,
      })),
    [],
  );

  function emit(nextCountry: Country, nextLocal: string) {
    const digits = nextLocal.replace(/[^\d]/g, '');
    onChange(digits ? `${nextCountry.dial}${digits}` : '');
  }

  function pickCountry(key: string) {
    const next = COUNTRIES.find((c) => keyOf(c) === key) ?? DEFAULT_COUNTRY;
    setSelected(next);
    emit(next, local);
  }

  return (
    /* Colours come from the same semantic tokens as `.input` (index.css).
       Hardcoding bg-white/slate-* here made the field unreadable in dark mode:
       the box stayed white while the text inherited the light-on-dark
       foreground colour. */
    <div
      className={`flex items-stretch rounded-xl border border-line ${
        disabled ? 'bg-surface-2 opacity-60' : 'bg-surface'
      } focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25`}
    >
      <Select
        value={keyOf(country)}
        onChange={pickCountry}
        options={options}
        disabled={disabled}
        searchable
        label={t('phone.search')}
        aria-label={country.name}
        triggerClassName="flex shrink-0 items-center gap-1.5 rounded-l-xl border-r border-line px-2.5 text-sm text-fg transition-colors hover:bg-surface-2"
        renderTrigger={(_option, open) => (
          <>
            <span className={`fi fi-${country.iso} rounded-[2px]`} />
            <span className="tabular-nums">{country.dial}</span>
            <ChevronDownIcon
              className={`h-3.5 w-3.5 text-fg-subtle transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </>
        )}
      />
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        disabled={disabled}
        placeholder="912 345 678"
        className="min-h-touch w-full min-w-0 rounded-r-xl bg-transparent px-3 py-2.5 text-[15px] text-fg outline-none placeholder:text-fg-subtle disabled:cursor-not-allowed sm:text-sm"
        value={local}
        onChange={(e) => emit(country, e.target.value)}
      />
    </div>
  );
}

export { DEFAULT_COUNTRY };
