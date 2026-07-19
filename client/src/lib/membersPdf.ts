import { jsPDF } from 'jspdf';
import autoTable, { type UserOptions } from 'jspdf-autotable';

/**
 * Builds member-export PDFs entirely in the browser (no server PDF deps, so
 * it works the same locally and on Vercel/Render) and triggers a download.
 *  - downloadMembersPdf: one gym (the gym-facing Members page export)
 *  - downloadPlatformBackupPdf: every gym on the platform (admin recovery backup)
 */

export interface MemberExportRow {
  id: number;
  full_name: string;
  phone: string | null;
  sex: string | null;
  status: string;
  joined_at: string;
  telegram_username: string | null;
  telegram_linked: boolean;
  plan_name: string | null;
  starts_at: string | null;
  expires_at: string | null;
  payments_count: number;
  total_paid: string;
  last_payment_at: string | null;
  checkins_count: number;
  last_checkin_at: string | null;
}

export interface GymBackupEntry {
  gym: {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    status: string;
    is_trial: boolean;
    subscription_ends_at: string | null;
    created_at: string;
    owner_name: string | null;
    owner_email: string | null;
    staff_count: number;
    revenue_total: string;
  };
  members: MemberExportRow[];
}

const day = (v: string | null): string => (v ? String(v).slice(0, 10) : '—');
const stampOf = (d: Date): string => d.toISOString().slice(0, 10);

const TABLE_STYLES: Partial<UserOptions> = {
  styles: { fontSize: 7.5, cellPadding: 3, overflow: 'linebreak' },
  headStyles: { fillColor: [15, 23, 42], fontSize: 7.5 }, // slate-900
  alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
};

const MEMBER_HEAD = [
  '#',
  'Name',
  'Phone',
  'Sex',
  'Status',
  'Joined',
  'Plan',
  'Start',
  'Expires',
  'Visits',
  'Last visit',
  'Payments',
  'Total paid (ETB)',
  'Telegram',
];

const memberCells = (r: MemberExportRow, i: number): (string | number)[] => [
  i + 1,
  r.full_name,
  r.phone ?? '—',
  r.sex ?? '—',
  r.status,
  day(r.joined_at),
  r.plan_name ?? '—',
  day(r.starts_at),
  day(r.expires_at),
  r.checkins_count,
  day(r.last_checkin_at),
  r.payments_count,
  Number(r.total_paid).toLocaleString(),
  r.telegram_linked ? (r.telegram_username ? `@${r.telegram_username}` : 'linked') : '—',
];

function addFooters(doc: jsPDF, label: string): void {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8).setTextColor(150);
    doc.text(
      `${label} — page ${i} / ${pages}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 16,
      { align: 'center' },
    );
    doc.setTextColor(0);
  }
}

// ------------------------------------------------------------ single gym ----

export function downloadMembersPdf(gymName: string, rows: MemberExportRow[]): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const now = new Date();

  doc.setFont('helvetica', 'bold').setFontSize(16);
  doc.text(gymName, 40, 42);
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(100);
  doc.text(
    `Members export · generated ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    40,
    58,
  );

  const byStatus = new Map<string, number>();
  for (const r of rows) byStatus.set(r.status, (byStatus.get(r.status) ?? 0) + 1);
  const totalPaid = rows.reduce((sum, r) => sum + Number(r.total_paid), 0);
  doc.text(
    `${rows.length} members  ·  ` +
      [...byStatus.entries()].map(([s, n]) => `${s}: ${n}`).join('  ·  ') +
      `  ·  lifetime payments: ${totalPaid.toLocaleString()} ETB`,
    40,
    74,
  );
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 90,
    ...TABLE_STYLES,
    head: [MEMBER_HEAD],
    body: rows.map(memberCells),
  });

  addFooters(doc, `${gymName} — members export — ${stampOf(now)}`);
  const slug = gymName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'gym';
  doc.save(`${slug}-members-${stampOf(now)}.pdf`);
}

// --------------------------------------------------- platform-wide backup ----

/** Cover page with a gym index, then one section per gym with all its members. */
export function downloadPlatformBackupPdf(data: GymBackupEntry[]): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const now = new Date();
  const totalMembers = data.reduce((sum, e) => sum + e.members.length, 0);

  // cover / index
  doc.setFont('helvetica', 'bold').setFontSize(20);
  doc.text('Snowfall Platform — Full Member Backup', 40, 50);
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(100);
  doc.text(
    `Generated ${now.toLocaleString()}  ·  ${data.length} gyms  ·  ${totalMembers} members  ·  keep this file safe — it contains all tenant data`,
    40,
    68,
  );
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 90,
    ...TABLE_STYLES,
    head: [['#', 'Gym', 'Owner', 'Phone', 'Address', 'Status', 'Subscription ends', 'Members', 'Staff', 'Lifetime payments (ETB)', 'Registered']],
    body: data.map((e, i) => [
      i + 1,
      e.gym.name,
      `${e.gym.owner_name ?? '—'} <${e.gym.owner_email ?? '—'}>`,
      e.gym.phone ?? '—',
      e.gym.address ?? '—',
      e.gym.status + (e.gym.is_trial ? ' (trial)' : ''),
      day(e.gym.subscription_ends_at),
      e.members.length,
      e.gym.staff_count,
      Number(e.gym.revenue_total).toLocaleString(),
      day(e.gym.created_at),
    ]),
  });

  // one section per gym
  for (const entry of data) {
    doc.addPage();
    doc.setFont('helvetica', 'bold').setFontSize(15);
    doc.text(entry.gym.name, 40, 42);
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(100);
    doc.text(
      `Owner: ${entry.gym.owner_name ?? '—'} <${entry.gym.owner_email ?? '—'}>  ·  ${entry.members.length} members  ·  status: ${entry.gym.status}${entry.gym.is_trial ? ' (trial)' : ''}  ·  gym id ${entry.gym.id}`,
      40,
      58,
    );
    doc.setTextColor(0);

    if (entry.members.length === 0) {
      doc.setFontSize(10).setTextColor(150);
      doc.text('No members enrolled.', 40, 84);
      doc.setTextColor(0);
      continue;
    }
    autoTable(doc, {
      startY: 72,
      ...TABLE_STYLES,
      head: [MEMBER_HEAD],
      body: entry.members.map(memberCells),
    });
  }

  addFooters(doc, `Snowfall platform backup — ${stampOf(now)}`);
  doc.save(`snowfall-backup-${stampOf(now)}.pdf`);
}
