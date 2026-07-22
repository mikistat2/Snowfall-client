// Country dial codes used by the phone-number inputs. `iso` is the lowercase
// ISO-3166 alpha-2 code that flag-icons uses for its CSS class (`fi fi-<iso>`).
// Ethiopia is first so it is the default for this app.
export type Country = { iso: string; name: string; dial: string };

export const COUNTRIES: Country[] = [
  { iso: 'et', name: 'Ethiopia', dial: '+251' },
  { iso: 'ke', name: 'Kenya', dial: '+254' },
  { iso: 'so', name: 'Somalia', dial: '+252' },
  { iso: 'dj', name: 'Djibouti', dial: '+253' },
  { iso: 'er', name: 'Eritrea', dial: '+291' },
  { iso: 'ss', name: 'South Sudan', dial: '+211' },
  { iso: 'sd', name: 'Sudan', dial: '+249' },
  { iso: 'ug', name: 'Uganda', dial: '+256' },
  { iso: 'tz', name: 'Tanzania', dial: '+255' },
  { iso: 'rw', name: 'Rwanda', dial: '+250' },
  { iso: 'ng', name: 'Nigeria', dial: '+234' },
  { iso: 'gh', name: 'Ghana', dial: '+233' },
  { iso: 'za', name: 'South Africa', dial: '+27' },
  { iso: 'eg', name: 'Egypt', dial: '+20' },
  { iso: 'ma', name: 'Morocco', dial: '+212' },
  { iso: 'us', name: 'United States', dial: '+1' },
  { iso: 'gb', name: 'United Kingdom', dial: '+44' },
  { iso: 'ca', name: 'Canada', dial: '+1' },
  { iso: 'ae', name: 'United Arab Emirates', dial: '+971' },
  { iso: 'sa', name: 'Saudi Arabia', dial: '+966' },
  { iso: 'qa', name: 'Qatar', dial: '+974' },
  { iso: 'kw', name: 'Kuwait', dial: '+965' },
  { iso: 'in', name: 'India', dial: '+91' },
  { iso: 'cn', name: 'China', dial: '+86' },
  { iso: 'tr', name: 'Turkey', dial: '+90' },
  { iso: 'de', name: 'Germany', dial: '+49' },
  { iso: 'fr', name: 'France', dial: '+33' },
  { iso: 'it', name: 'Italy', dial: '+39' },
  { iso: 'es', name: 'Spain', dial: '+34' },
  { iso: 'nl', name: 'Netherlands', dial: '+31' },
  { iso: 'se', name: 'Sweden', dial: '+46' },
  { iso: 'au', name: 'Australia', dial: '+61' },
  { iso: 'br', name: 'Brazil', dial: '+55' },
];

export const DEFAULT_COUNTRY = COUNTRIES[0];

/**
 * Split a stored phone string (e.g. "+251912345678") into a country + local
 * part. Matches the longest dial-code prefix; falls back to the default
 * country and treats the whole string as the local number when there is no
 * "+" prefix or no known code matches.
 */
export function parsePhone(value: string): { country: Country; local: string } {
  const trimmed = value.trim();
  if (trimmed.startsWith('+')) {
    const match = [...COUNTRIES]
      .sort((a, b) => b.dial.length - a.dial.length)
      .find((c) => trimmed.startsWith(c.dial));
    if (match) return { country: match, local: trimmed.slice(match.dial.length).trim() };
  }
  return { country: DEFAULT_COUNTRY, local: trimmed };
}
