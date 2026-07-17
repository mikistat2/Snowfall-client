import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Builds the members-export PDF entirely in the browser (no server PDF deps,
 * so it works the same locally and on Vercel/Render) and triggers a download.
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

const day = (v: string | null): string => (v ? String(v).slice(0, 10) : '—');

export function downloadMembersPdf(gymName: string, rows: MemberExportRow[]): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const now = new Date();

  // header
  doc.setFont('helvetica', 'bold').setFontSize(16);
  doc.text(gymName, 40, 42);
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(100);
  doc.text(
    `Members export · generated ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    40,
    58,
  );

  // status summary line
  const byStatus = new Map<string, number>();
  for (const r of rows) byStatus.set(r.status, (byStatus.get(r.status) ?? 0) + 1);
  const totalPaid = rows.reduce((sum, r) => sum + Number(r.total_paid), 0);
  const summary =
    `${rows.length} members  ·  ` +
    [...byStatus.entries()].map(([s, n]) => `${s}: ${n}`).join('  ·  ') +
    `  ·  lifetime payments: ${totalPaid.toLocaleString()} ETB`;
  doc.text(summary, 40, 74);
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 90,
    styles: { fontSize: 7.5, cellPadding: 3, overflow: 'linebreak' },
    headStyles: { fillColor: [15, 23, 42], fontSize: 7.5 }, // slate-900
    alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
    head: [
      [
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
      ],
    ],
    body: rows.map((r, i) => [
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
    ]),
    didDrawPage: () => {
      // footer with page number
      const page = doc.getCurrentPageInfo().pageNumber;
      doc.setFontSize(8).setTextColor(150);
      doc.text(
        `${gymName} — members export — page ${page}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 16,
        { align: 'center' },
      );
      doc.setTextColor(0);
    },
  });

  const stamp = now.toISOString().slice(0, 10);
  const slug = gymName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'gym';
  doc.save(`${slug}-members-${stamp}.pdf`);
}
