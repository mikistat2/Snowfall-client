import { severityDot } from '../../lib/colors';
import { t } from '../../i18n/strings';
import type { GymEvent } from '../../lib/types';

export function EventFeed({
  events,
  onOverride,
  onApprove,
  overriding,
}: {
  events: GymEvent[];
  onOverride: (memberId: number) => void;
  onApprove: (memberId: number) => void;
  overriding: boolean;
}) {
  // An actionable event is "handled" once a newer resolution event exists for
  // that member — hide its button so repeat clicks can't stack entries.
  // Denials are resolved by 'override'; pending entries by 'check_in',
  // 'override', or a fresh denial from the approve re-check.
  const latestResolution = new Map<number, number>();
  const latestDenial = new Map<number, number>();
  for (const e of events) {
    if (e.member_id == null) continue;
    if (e.type === 'override' || e.type === 'check_in') {
      latestResolution.set(e.member_id, Math.max(latestResolution.get(e.member_id) ?? 0, e.id));
    } else if (e.type === 'check_in_denied') {
      latestDenial.set(e.member_id, Math.max(latestDenial.get(e.member_id) ?? 0, e.id));
    }
  }

  const showOverrideButton = (e: GymEvent) =>
    e.type === 'check_in_denied' &&
    e.member_id != null &&
    (latestResolution.get(e.member_id) ?? 0) < e.id;

  const showApproveButton = (e: GymEvent) =>
    e.type === 'entry_pending' &&
    e.member_id != null &&
    (latestResolution.get(e.member_id) ?? 0) < e.id &&
    (latestDenial.get(e.member_id) ?? 0) < e.id;

  return (
    <div className="flex h-full flex-col">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {t('monitor.eventFeed')}
      </h2>
      <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {events.map((e) => (
          <div key={e.id} className="flex items-center gap-2.5 rounded-lg bg-white px-3 py-2 shadow-sm">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${severityDot[e.severity]}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{e.message}</p>
              <p className="text-xs text-slate-400">{new Date(e.created_at).toLocaleTimeString()}</p>
            </div>
            {showOverrideButton(e) && (
              <button
                className="btn-secondary shrink-0 !px-2.5 !py-1 text-xs"
                disabled={overriding}
                onClick={() => onOverride(e.member_id!)}
              >
                {t('monitor.allowEntry')}
              </button>
            )}
            {showApproveButton(e) && (
              <button
                className="btn-primary shrink-0 !px-2.5 !py-1 text-xs"
                disabled={overriding}
                onClick={() => onApprove(e.member_id!)}
              >
                {t('monitor.approve')}
              </button>
            )}
          </div>
        ))}
        {events.length === 0 && <p className="text-sm text-slate-400">—</p>}
      </div>
    </div>
  );
}
