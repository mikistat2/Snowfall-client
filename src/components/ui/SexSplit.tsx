import { t } from '../../i18n/strings';

/**
 * The roster's male/female split, shown where the check-in tile would be on a
 * gym that runs without a camera.
 *
 * The glyphs are deliberately small and tinted rather than set at the size of
 * the figures: they are labels, not data. Two 24px ♂/♀ characters sitting
 * level with the numbers read as part of the value and made the tile look like
 * an equation. Each sits in its own soft disc, which keeps the pair legible at
 * a glance and colour-codes them without shouting.
 *
 * `stack` is for narrow tiles (the phone's 2-up grid), where a single row of
 * badge-number-badge-number does not fit in ~95px and truncates.
 */
export function SexSplit({
  male,
  female,
  stack,
}: {
  male: number;
  female: number;
  /** Two lines instead of one — for tiles narrower than about 120px. */
  stack?: boolean;
}) {
  return (
    <span className={`inline-flex ${stack ? 'flex-col items-start gap-0.5' : 'items-center gap-3'}`}>
      <Part glyph="♂" label={t('members.male')} value={male} tone="male" />
      {!stack && <span aria-hidden className="h-5 w-px bg-line" />}
      <Part glyph="♀" label={t('members.female')} value={female} tone="female" />
    </span>
  );
}

const TONES = {
  male: 'bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400',
  female: 'bg-pink-500/10 text-pink-600 dark:bg-pink-400/15 dark:text-pink-400',
} as const;

function Part({
  glyph,
  label,
  value,
  tone,
}: {
  glyph: string;
  label: string;
  value: number;
  tone: keyof typeof TONES;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {/* Fixed 18px whatever the figures beside it are set in. */}
      <span
        aria-hidden
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold leading-none ${TONES[tone]}`}
      >
        {glyph}
      </span>
      <span className="tabular-nums leading-none">{value}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
