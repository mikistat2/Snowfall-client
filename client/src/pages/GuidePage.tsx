import type { ReactNode } from 'react';

/**
 * Start-up Guide — the in-app operating manual for gym owners and front-desk
 * staff. Long-form documentation lives here rather than in the i18n file;
 * an Amharic version can be added as a parallel component later.
 */

const SECTIONS = [
  { id: 'overview', title: '1 · What this system does' },
  { id: 'setup', title: '2 · First-time setup' },
  { id: 'monitor', title: '3 · The Live Monitor' },
  { id: 'colors', title: '4 · What the colors mean' },
  { id: 'enroll', title: '5 · Enrolling a member' },
  { id: 'payments', title: '6 · Payments & renewals' },
  { id: 'lifecycle', title: '7 · Membership lifecycle rules' },
  { id: 'plans', title: '8 · Plan rules: sessions & hours' },
  { id: 'freeze', title: '9 · Freezing a membership' },
  { id: 'guests', title: '10 · Guests & day passes' },
  { id: 'telegram', title: '11 · Telegram bot' },
  { id: 'camera', title: '12 · Using a phone as camera' },
  { id: 'roles', title: '13 · Owner vs. staff accounts' },
  { id: 'trouble', title: '14 · Troubleshooting' },
];

export function GuidePage() {
  return (
    <div className="flex gap-8">
      {/* table of contents */}
      <nav className="sticky top-6 hidden h-fit w-56 shrink-0 space-y-1 lg:block">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="block rounded px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            {s.title}
          </a>
        ))}
      </nav>

      <div className="min-w-0 max-w-3xl flex-1 space-y-8 pb-16">
        <h1 className="text-2xl font-bold">Start-up Guide</h1>

        <Section id="overview" title="1 · What this system does">
          <p>
            This app runs your gym's front door and membership lifecycle. A camera at the entrance
            recognizes members by face and decides — automatically, in about a second — whether they may
            enter, based on the rules you configure. Staff mark payments by hand (cash / Telebirr), and
            the system takes care of everything that follows: expiry tracking, entry rules, occupancy
            counting, and Telegram messages to members.
          </p>
          <p>
            The golden rule: <b>the decision engine never trusts a stale status.</b> Every time a face is
            recognized, the member's subscription dates are re-checked on the spot, so a renewal or freeze
            takes effect at the door immediately.
          </p>
        </Section>

        <Section id="setup" title="2 · First-time setup (do these in order)">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <b>Register the gym</b> — the first account created is the <i>owner</i>, who can change
              settings and manage staff.
            </li>
            <li>
              <b>Settings → Entry &amp; lifecycle rules</b> — review the defaults: grace period (3 days),
              expiry reminder window (7 days), auto-checkout (3 h), absence nudge (5 days), face match
              threshold (0.5), closing time (22:00), entry mode (automatic).
            </li>
            <li>
              <b>Settings → Membership plans</b> — create your plans: name, duration in days, price,
              sessions per day (1 or unlimited), allowed hours (e.g. a cheaper 06:00–12:00 morning plan).
            </li>
            <li>
              <b>Settings → Staff accounts</b> — add a login for each front-desk person. Staff can run
              daily operations but cannot change settings.
            </li>
            <li>
              <b>Telegram (optional but recommended)</b> — create a bot with @BotFather, paste the token
              in Settings, then link your own chat for admin alerts (section 11).
            </li>
            <li>
              <b>Camera</b> — on the Monitor page choose the webcam or a phone camera (section 12).
            </li>
            <li>
              <b>Enroll members</b> — as members arrive, enroll them once with 3–5 face captures
              (section 5). From then on the door is automatic.
            </li>
          </ol>
        </Section>

        <Section id="monitor" title="3 · The Live Monitor">
          <p>
            The Monitor page is the screen you keep open at the front desk all day. It shows the camera
            feed with a colored circle around every detected face, the <b>occupancy counter</b> (people
            inside right now) top-right, and the <b>live event feed</b> on the right.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <b>Allowed entries</b> are logged and counted automatically — staff do nothing.
            </li>
            <li>
              <b>Denied entries</b> (red/orange) appear in the feed with an <b>Allow entry</b> button —
              one click lets the person in anyway and records it as a staff override.
            </li>
            <li>
              In <b>manual entry mode</b> (Settings), allowed members wait with a yellow
              &ldquo;awaiting approval&rdquo; circle until staff click <b>Approve</b> in the feed.
            </li>
            <li>
              <b>Check out</b> lists everyone currently inside so you can close their session when they
              leave; anything forgotten is closed automatically after the auto-checkout window and at
              closing time.
            </li>
            <li>
              <b>Add guest</b> creates a day pass with one face capture (section 10).
            </li>
            <li>
              The same person is not double-counted: repeat recognitions within 5 minutes are ignored.
            </li>
          </ul>
        </Section>

        <Section id="colors" title="4 · What the colors mean">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Color</th>
                  <th className="py-2 pr-3">Meaning</th>
                  <th className="py-2">Door result</th>
                </tr>
              </thead>
              <tbody className="align-top">
                <ColorRow dot="bg-green-500" name="Green">
                  Active member with days remaining; also override/approved entries.
                  <Result>Allowed</Result>
                </ColorRow>
                <ColorRow dot="bg-yellow-400" name="Yellow">
                  Allowed but attention needed: expiring soon, in the grace period (&ldquo;X days
                  overdue&rdquo;), or awaiting staff approval in manual mode.
                  <Result>Allowed / waiting</Result>
                </ColorRow>
                <ColorRow dot="bg-orange-500" name="Orange">
                  Denied by a plan rule while the membership is still valid: already entered today on a
                  1-session plan, or outside the plan's allowed hours.
                  <Result>Denied (soft)</Result>
                </ColorRow>
                <ColorRow dot="bg-red-500" name="Red">
                  Denied outright: expired past grace (&ldquo;renew?&rdquo;), frozen, or an unknown face.
                  <Result>Denied (hard)</Result>
                </ColorRow>
                <ColorRow dot="bg-blue-500" name="Blue">
                  A guest with a valid day pass. A brief blue &ldquo;…&rdquo; on any face just means the
                  decision is being fetched.
                  <Result>Allowed (guest)</Result>
                </ColorRow>
              </tbody>
            </table>
          </div>
          <p className="text-slate-500">
            In one line: green = go · yellow = go, but talk to them · orange = stop (plan rule) · red =
            stop (invalid membership) · blue = guest.
          </p>
        </Section>

        <Section id="enroll" title="5 · Enrolling a member">
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>Members → <b>Enroll member</b>.</li>
            <li>Fill name, phone, sex; pick their plan.</li>
            <li>
              Capture <b>3–5 face shots</b>: straight on, slightly left, slightly right. The app rejects
              blurry, distant, or dark captures — good lighting matters more than a good camera.
            </li>
            <li>
              Record the <b>first payment</b> (amount defaults to the plan price) — enrollment, first
              subscription, and payment are saved together.
            </li>
            <li>
              On their profile, click <b>Link Telegram</b> and let the member scan the QR code once — that
              connects reminders and receipts to their phone.
            </li>
          </ol>
          <p>
            If someone is regularly not recognized at the door, open their profile and re-capture their
            face (glasses, beards, and very different lighting can lower similarity).
          </p>
        </Section>

        <Section id="payments" title="6 · Payments & renewals">
          <p>
            All payments are marked manually by staff — cash, Telebirr, bank, or other. Open the member's
            profile → <b>Renew / mark payment</b>, pick the plan, confirm the amount.
          </p>
          <p>
            <b>The rollover rule:</b> new expiry = <i>whichever is later of (today, current expiry)</i> +
            plan duration. Renewing early never costs days: if a member has 5 days left and renews a
            30-day plan, they get 35 days. If they expired last week, the new 30 days start today.
          </p>
          <p>
            Payments are an <b>immutable audit trail</b> — they can never be edited or deleted, by anyone.
            The Payments page shows the filterable log (date, member, amount, method, who marked it). If a
            mistake is made, mark a corrective note on the next payment rather than expecting to edit
            history.
          </p>
        </Section>

        <Section id="lifecycle" title="7 · Membership lifecycle rules">
          <p>A membership moves through these statuses automatically (recomputed nightly and at every door decision):</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <b>Active</b> (green) — more days left than the reminder window.
            </li>
            <li>
              <b>Expiring</b> (yellow) — within the reminder window (default: last 7 days). Still allowed;
              Telegram reminder goes out.
            </li>
            <li>
              <b>Grace</b> (yellow at door, orange badge) — expiry day has passed but they are within the
              grace period (default 3 days). Still allowed, shown as &ldquo;X days overdue&rdquo; so staff
              ask for renewal.
            </li>
            <li>
              <b>Expired</b> (red) — past the grace period. Denied at the door with &ldquo;renew?&rdquo;.
              One renewal payment fixes it instantly.
            </li>
            <li>
              <b>Frozen</b> (red at door, gray badge) — manually paused (section 9). Denied until unfrozen.
            </li>
          </ul>
          <p className="text-slate-500">
            The reminder window and grace period are per-gym settings — changing them changes when members
            turn yellow and how long they stay allowed after expiry.
          </p>
        </Section>

        <Section id="plans" title="8 · Plan rules: sessions & allowed hours">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <b>Sessions per day = 1</b>: the member can enter once per calendar day. A second attempt is
              denied orange (&ldquo;already entered at HH:MM&rdquo;). Unlimited plans have no such limit.
            </li>
            <li>
              <b>Allowed hours</b> (e.g. 06:00–12:00): entry outside the window is denied orange. Great
              for discounted off-peak plans.
            </li>
            <li>
              Rule order at the door: expired/frozen is checked first, then the session limit, then hours
              — an expired member always sees &ldquo;renew?&rdquo;, not an hours message.
            </li>
          </ul>
        </Section>

        <Section id="freeze" title="9 · Freezing a membership">
          <p>
            For travel, injury, etc. — open the member's profile → <b>Freeze</b>. The days they have left
            are stored, and the countdown stops. When they return, <b>Unfreeze</b> sets the new expiry to
            today + the stored days, so no paid days are ever lost. While frozen, the door denies them
            (red, &ldquo;membership frozen&rdquo;).
          </p>
        </Section>

        <Section id="guests" title="10 · Guests & day passes">
          <p>
            Monitor → <b>Add guest</b>: enter a name, capture the face once, choose validity (today, or
            +1/+3/+7 days for trials). The guest then gets a <b>blue circle</b> at the door like a member,
            counts toward occupancy, and is auto-checked out like everyone else.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>The pass expires at midnight of its last day; after that the door shows red.</li>
            <li>
              For privacy, the guest's face data is <b>deleted automatically</b> the night after the pass
              expires.
            </li>
            <li>If a guest joins, enroll them normally as a member.</li>
          </ul>
        </Section>

        <Section id="telegram" title="11 · Telegram bot">
          <p>
            <b>Setup:</b> in Telegram, talk to <b>@BotFather</b> → <code>/newbot</code> → copy the token →
            paste it in Settings → save. The status line under the field should show &ldquo;Bot
            running&rdquo;. Then click <b>Link my chat</b> so admin alerts reach you.
          </p>
          <p><b>What the bot sends, automatically:</b></p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <b>Expiry reminders</b> (daily at 09:00): N days before expiry, on expiry day, and when
              entering grace — English + Amharic.
            </li>
            <li>
              <b>Absence nudges</b>: a friendly message after 5 days (configurable) without a visit —
              rotating templates, never twice in the same week.
            </li>
            <li><b>Receipts</b>: sent immediately when staff mark a payment.</li>
            <li>
              <b>Owner alerts</b>: an unknown face seen 3+ times in a day, and a daily closing summary
              (check-ins, revenue marked today, expiring tomorrow).
            </li>
          </ul>
          <p>
            Members link themselves once via the QR on their profile; anyone can send <code>/traffic</code>{' '}
            to the bot to ask how busy the gym is right now. Every send attempt is recorded on the{' '}
            <b>Notifications</b> page — &ldquo;No chat linked&rdquo; rows tell you who still needs the QR.
          </p>
        </Section>

        <Section id="camera" title="12 · Using a phone as the entrance camera">
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>
              On an Android phone, install the free <b>IP Webcam</b> app → scroll down → <b>Start
              server</b>. The phone shows an address like <code>http://192.168.0.176:8080</code>.
            </li>
            <li>
              Monitor → <b>Camera</b> button → <b>Phone / IP camera</b> → paste the address (the app adds{' '}
              <code>/video</code> automatically) → <b>Test stream</b> → Save.
            </li>
            <li>Phone and computer must be on the same Wi-Fi. Mount the phone facing the entrance.</li>
          </ol>
          <p className="text-slate-500">
            The choice is per computer: the door PC can use the phone while the office PC keeps its webcam
            for enrollment. Tip: set the app's resolution to ~1280×720 and lock the phone's orientation.
          </p>
        </Section>

        <Section id="roles" title="13 · Owner vs. staff accounts">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <b>Owner</b>: everything — settings, plans, staff accounts, Telegram token, audit log.
            </li>
            <li>
              <b>Staff</b>: daily operations — monitor, enroll, renew, freeze, guests, payments log,
              notifications. They cannot change settings or see the audit log.
            </li>
          </ul>
          <p>
            Every sensitive action (payments marked, overrides, freezes, plan/settings changes) is
            recorded with the staff member's name in the owner-only <b>Audit log</b>.
          </p>
        </Section>

        <Section id="trouble" title="14 · Troubleshooting">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <b>Member not recognized (red &ldquo;unknown&rdquo;)</b> — re-capture their face on their
              profile; check lighting; make sure they come within ~2 m of the camera.
            </li>
            <li>
              <b>Wrong person matched</b> — lower the match threshold slightly in Settings (e.g. 0.5 →
              0.45). Higher = more lenient, lower = stricter.
            </li>
            <li>
              <b>Camera shows &ldquo;stream unreachable&rdquo;</b> — confirm phone and PC share the same
              Wi-Fi, the IP Webcam server is started, and the address matches what the phone displays.
            </li>
            <li>
              <b>Bot shows &ldquo;not running&rdquo;</b> — the token is wrong or was revoked; get a fresh
              one from @BotFather and paste it again.
            </li>
            <li>
              <b>Notification says &ldquo;No chat linked&rdquo;</b> — the member never pressed Start on
              the bot; open their profile and show them the QR again.
            </li>
            <li>
              <b>Occupancy looks too high</b> — someone left without checking out; use Check out on the
              Monitor, or wait for auto-checkout to close stale sessions.
            </li>
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="card scroll-mt-6 space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}

function ColorRow({ dot, name, children }: { dot: string; name: string; children: ReactNode }) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="whitespace-nowrap py-2.5 pr-3">
        <span className={`mr-2 inline-block h-3 w-3 rounded-full ${dot}`} />
        <b>{name}</b>
      </td>
      <td className="py-2.5 pr-3" colSpan={2}>
        {children}
      </td>
    </tr>
  );
}

function Result({ children }: { children: ReactNode }) {
  return <span className="mt-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">{children}</span>;
}
