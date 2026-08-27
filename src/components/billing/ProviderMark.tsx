import type { BillingProvider } from '../../lib/billing';
import cbeLogo from '../../assets/images/cbe-logo.png';
import telebirrLogo from '../../assets/images/telebirr-logo.png';

/**
 * Provider marks.
 *
 * CBE and Telebirr ship as their real logos. Both are transparent PNGs drawn
 * in their own brand colours — CBE's gold emblem, Telebirr's blue-and-orange
 * wordmark — and neither survives on a dark background, so every mark sits in
 * a white rounded tile: invisible against a white card, a deliberate chip in
 * dark mode, and each brand keeps the light background it was drawn for.
 *
 * Sized by HEIGHT only, and capped by the space available. CBE is square
 * (1:1) while Telebirr is a wide wordmark (2.19:1) — forcing them to share a
 * width would squash one of them, and letting the wordmark take its natural
 * width at a tall `size` overflows small round containers.
 *
 * CASH is an internal bookkeeping option with no logo to ship, so it keeps the
 * drawn fallback.
 */

const LOGO: Partial<Record<BillingProvider, string>> = {
  CBE: cbeLogo,
  TELEBIRR: telebirrLogo,
};

const BRAND: Record<BillingProvider, { short: string; full: string; fill: string; text: string }> = {
  CBE: { short: 'CBE', full: 'Commercial Bank of Ethiopia', fill: '#5B2D8E', text: '#ffffff' },
  TELEBIRR: { short: 'tb', full: 'Telebirr', fill: '#F5821F', text: '#ffffff' },
  CASH: { short: '₿', full: 'Cash / manual', fill: '#475569', text: '#ffffff' },
};

export function ProviderMark({
  provider,
  size = 'h-8',
  tile = true,
}: {
  provider: BillingProvider;
  /** Height class only — never a width. */
  size?: string;
  tile?: boolean;
}) {
  const brand = BRAND[provider];
  const logo = LOGO[provider];

  const mark = logo ? (
    <img
      src={logo}
      alt={brand.full}
      className={`${size} w-auto max-w-full object-contain`}
      loading="lazy"
      decoding="async"
    />
  ) : (
    <svg viewBox="0 0 40 40" className={`${size} w-auto`} role="img" aria-label={brand.full}>
      <rect width="40" height="40" rx="9" fill={brand.fill} />
      <text
        x="20"
        y="21"
        textAnchor="middle"
        dominantBaseline="central"
        fill={brand.text}
        fontSize={provider === 'CBE' ? 13 : 17}
        fontWeight="700"
        fontFamily="Inter, system-ui, sans-serif"
        letterSpacing={provider === 'CBE' ? '0.5' : '0'}
      >
        {brand.short}
      </text>
    </svg>
  );

  if (!tile) return mark;
  return (
    <span className="inline-flex items-center justify-center rounded-lg bg-white p-1 shadow-sm ring-1 ring-black/5">
      {mark}
    </span>
  );
}

export function providerLabel(provider: BillingProvider): string {
  return BRAND[provider].full;
}
