/**
 * Ethiopian (Ge'ez) ↔ Gregorian date conversion for the date fields that read
 * off a gym's paper register.
 *
 * Mirror of server/src/utils/ethiopian.ts — same Beyene–Kudlek algorithm via
 * the Julian Day Number. This copy exists so a field can show the converted
 * date while the user is still typing; the server converts independently and
 * is the authority for what gets stored. Keep the two in step.
 *
 * 12 months of 30 days plus Pagume (13) of 5 days, or 6 when `year % 4 === 3`.
 */

const JD_EPOCH_OFFSET_AMETE_MIHRET = 1723856;

function mod(a: number, b: number): number {
  return ((a % b) + b) % b;
}

function gregorianToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    day: e - Math.floor((153 * m + 2) / 5) + 1,
    month: m + 3 - 12 * Math.floor(m / 10),
    year: 100 * b + d - 4800 + Math.floor(m / 10),
  };
}

function ethiopianToJdn(year: number, month: number, day: number): number {
  return JD_EPOCH_OFFSET_AMETE_MIHRET + 365 + 365 * (year - 1) + Math.floor(year / 4) + 30 * month + day - 31;
}

function jdnToEthiopian(jdn: number): EthiopianDate {
  const r = mod(jdn - JD_EPOCH_OFFSET_AMETE_MIHRET, 1461);
  const n = mod(r, 365) + 365 * Math.floor(r / 1460);
  return {
    year: 4 * Math.floor((jdn - JD_EPOCH_OFFSET_AMETE_MIHRET) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460),
    month: Math.floor(n / 30) + 1,
    day: mod(n, 30) + 1,
  };
}

export interface EthiopianDate {
  year: number;
  month: number;
  day: number;
}

/** Month names in both UI languages — index 0 is Meskerem. */
export const ETHIOPIAN_MONTHS: readonly { am: string; en: string }[] = [
  { am: 'መስከረም', en: 'Meskerem' },
  { am: 'ጥቅምት', en: 'Tikimt' },
  { am: 'ኅዳር', en: 'Hidar' },
  { am: 'ታኅሣሥ', en: 'Tahsas' },
  { am: 'ጥር', en: 'Tir' },
  { am: 'የካቲት', en: 'Yekatit' },
  { am: 'መጋቢት', en: 'Megabit' },
  { am: 'ሚያዝያ', en: 'Miyazya' },
  { am: 'ግንቦት', en: 'Ginbot' },
  { am: 'ሰኔ', en: 'Sene' },
  { am: 'ሐምሌ', en: 'Hamle' },
  { am: 'ነሐሴ', en: 'Nehase' },
  { am: 'ጳጉሜ', en: 'Pagume' },
];

/** Pagume gains a sixth day in the Ethiopian year before each Gregorian leap year. */
export function isEthiopianLeapYear(year: number): boolean {
  return mod(year, 4) === 3;
}

export function ethiopianMonthLength(year: number, month: number): number {
  if (month < 13) return 30;
  return isEthiopianLeapYear(year) ? 6 : 5;
}

export function isValidEthiopianDate({ year, month, day }: EthiopianDate): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (year < 1 || month < 1 || month > 13 || day < 1) return false;
  return day <= ethiopianMonthLength(year, month);
}

const pad = (n: number): string => String(n).padStart(2, '0');

/** Ethiopian parts → Gregorian "YYYY-MM-DD" (the format the API and DB speak). */
export function ethiopianToGregorian(date: EthiopianDate): string {
  const g = jdnToGregorian(ethiopianToJdn(date.year, date.month, date.day));
  return `${g.year}-${pad(g.month)}-${pad(g.day)}`;
}

/** Gregorian "YYYY-MM-DD" (or Date) → Ethiopian parts. */
export function gregorianToEthiopian(value: string | Date): EthiopianDate {
  const [y, m, d] =
    value instanceof Date
      ? [value.getFullYear(), value.getMonth() + 1, value.getDate()]
      : value.slice(0, 10).split('-').map(Number);
  return jdnToEthiopian(gregorianToJdn(y as number, m as number, d as number));
}

export function todayEthiopian(): EthiopianDate {
  return gregorianToEthiopian(new Date());
}

/** "12 ነሐሴ 2018" / "12 Nehase 2018" — how a converted date is shown back to the user. */
export function formatEthiopian(value: string | Date | EthiopianDate, locale: 'en' | 'am' = 'en'): string {
  const date =
    typeof value === 'string' || value instanceof Date ? gregorianToEthiopian(value) : value;
  const month = ETHIOPIAN_MONTHS[date.month - 1];
  const name = month ? month[locale] : String(date.month);
  return `${date.day} ${name} ${date.year}`;
}

/** "18 August 2026" — the Gregorian side of the same hint line. */
export function formatGregorian(value: string, locale: 'en' | 'am' = 'en'): string {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return value;
  return new Date(y, m - 1, d).toLocaleDateString(locale === 'am' ? 'am-ET' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Today as "YYYY-MM-DD" in local time — the `max` for every backdated field. */
export function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Gregorian "YYYY-MM-DD" + n days, staying in local time. */
export function addDaysIso(value: string, days: number): string {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  const date = new Date(y as number, (m as number) - 1, (d as number) + days);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
