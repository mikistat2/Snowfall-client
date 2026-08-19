import { severityDot, statusBadge, statusSeverity } from '../../lib/colors';
import { t, type StringKey } from '../../i18n/strings';
import type { MemberStatus } from '../../lib/types';

/**
 * `dot` prefixes the pill with its severity colour as a solid dot — used in
 * the phone lists, where the badge is read at a glance from across a row and
 * the fill alone is a subtle cue on a small screen.
 */
export function StatusBadge({ status, dot }: { status: MemberStatus; dot?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge[status]}`}
    >
      {dot && <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${severityDot[statusSeverity[status]]}`} />}
      {t(`status.${status}` as StringKey)}
    </span>
  );
}
