import { statusBadge } from '../../lib/colors';
import { t, type StringKey } from '../../i18n/strings';
import type { MemberStatus } from '../../lib/types';

export function StatusBadge({ status }: { status: MemberStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge[status]}`}>
      {t(`status.${status}` as StringKey)}
    </span>
  );
}
