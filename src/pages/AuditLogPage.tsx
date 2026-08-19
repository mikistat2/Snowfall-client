import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { t } from '../i18n/strings';
import { PageTitle } from '../components/ui/PageTitle';
import { Select } from '../components/ui/Select';

interface AuditRow {
  id: number;
  user_name: string | null;
  action: string;
  entity: string;
  entity_id: number | null;
  meta: Record<string, unknown>;
  created_at: string;
}

const ENTITIES = ['member', 'plan', 'payment', 'guest', 'user', 'gym'];

export function AuditLogPage() {
  const [entity, setEntity] = useState('');
  const [action, setAction] = useState('');

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['audit-logs', entity, action],
    queryFn: async () =>
      (
        await api.get<AuditRow[]>('/audit-logs', {
          params: { entity: entity || undefined, action: action || undefined },
        })
      ).data,
  });

  return (
    <div className="space-y-4">
      <PageTitle>{t('audit.title')}</PageTitle>

      <div className="flex flex-wrap gap-3">
        <Select
          className="w-full sm:max-w-[200px]"
          value={entity}
          onChange={setEntity}
          label={t('audit.allEntities')}
          options={[
            { value: '', label: t('audit.allEntities') },
            ...ENTITIES.map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) })),
          ]}
        />
        <input
          className="input max-w-xs"
          placeholder={t('audit.searchAction')}
          value={action}
          onChange={(e) => setAction(e.target.value)}
        />
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-fg-muted">
              <th className="px-4 py-3">{t('audit.when')}</th>
              <th className="px-4 py-3">{t('audit.who')}</th>
              <th className="px-4 py-3">{t('audit.action')}</th>
              <th className="px-4 py-3">{t('audit.entity')}</th>
              <th className="px-4 py-3">{t('audit.details')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-fg-subtle">
                  {t('common.loading')}
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line align-top last:border-0">
                <td className="whitespace-nowrap px-4 py-3 text-fg-muted">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-medium">{r.user_name ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-surface-2 px-2 py-0.5 font-mono text-xs">{r.action}</span>
                </td>
                <td className="px-4 py-3 text-fg-muted">
                  {r.entity}
                  {r.entity_id != null ? ` #${r.entity_id}` : ''}
                </td>
                <td className="max-w-sm px-4 py-3 font-mono text-xs text-fg-subtle">
                  {Object.keys(r.meta ?? {}).length > 0 ? JSON.stringify(r.meta) : ''}
                </td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-fg-subtle">
                  —
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
