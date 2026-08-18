import type { BillingProvider } from '../../lib/billing';

/**
 * Provider marks, drawn inline rather than shipped as PNGs.
 *
 * Every mark sits in a white rounded tile with padding: it disappears against
 * a white card and becomes a deliberate chip in dark mode, so each brand keeps
 * the light background it expects. Sized by HEIGHT only — a square emblem and
 * a wide wordmark forced to share a width would squash one of them.
 */

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
  const mark = (
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
