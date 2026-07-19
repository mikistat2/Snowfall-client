import { Modal } from './Modal';

/**
 * Platform Terms & Conditions shown during gym registration.
 * Content is intentionally plain English; the gym agrees on behalf of its
 * business when creating an account.
 */
export function TermsModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Terms & Conditions — Snowfall Gym Management System" onClose={onClose} wide>
      <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2 text-sm leading-relaxed text-slate-600">
        <p className="text-xs text-slate-400">Last updated: July 2026</p>

        <Section n="1" title="Acceptance of these terms">
          By registering a gym on the Snowfall platform ("the Service"), you confirm that you are authorized
          to act on behalf of that business and that you accept these Terms & Conditions in full. If you do
          not agree, do not register.
        </Section>

        <Section n="2" title="The Service">
          Snowfall provides gym management software: member enrollment, optional camera-based check-in,
          subscription and payment tracking, Telegram notifications, and related tools. The Service is
          provided over the internet and requires a compatible browser and connection.
        </Section>

        <Section n="3" title="Registration and verification">
          New registrations may require verification and approval by the platform administrator before the
          account is activated. You agree to provide accurate, current information (gym name, address, phone,
          owner contact) and to keep it up to date. Accounts registered with false information may be rejected
          or removed.
        </Section>

        <Section n="4" title="Subscription, trials and payment">
          Access to the Service is provided on a yearly subscription basis, payable to the platform
          administrator. Promotional free trials may be offered at the administrator's discretion and convert
          to a paid subscription when they end. If a subscription expires and is not renewed, the account may
          be suspended (frozen) until payment is arranged. Suspension does not delete your data.
        </Section>

        <Section n="5" title="Your members' data">
          You (the gym) remain the owner of and responsible for the member data you enter into the Service —
          names, phone numbers, photos, subscriptions, payments and attendance. You are responsible for
          informing your members and, where required, obtaining their consent for this processing.
        </Section>

        <Section n="6" title="Face recognition (biometric data)">
          If you enable the camera monitor, the Service stores face descriptors (numeric representations, not
          images) used solely to recognize your members at your entrance. You must obtain each member's
          consent before enrolling their face, and you may enroll members without face capture at any time by
          disabling the camera feature. Guest descriptors are automatically purged after the pass expires.
        </Section>

        <Section n="7" title="Acceptable use">
          You agree not to misuse the Service: no unauthorized access attempts, no use for unlawful purposes,
          no reselling of the Service, and no uploading of content you have no right to process. Staff
          accounts you create are your responsibility.
        </Section>

        <Section n="8" title="Suspension and termination">
          The platform administrator may freeze an account for non-payment or breach of these terms — you
          will be notified with the reason, and your data remains intact while frozen. Account deletion
          (either at your request or after prolonged non-payment) permanently removes all data and cannot be
          undone. You may request an export of your member data at any time before deletion.
        </Section>

        <Section n="9" title="Availability and liability">
          The Service is provided "as is" without warranty of uninterrupted availability. To the maximum
          extent permitted by law, the platform's liability is limited to the subscription fees paid for the
          current period. The Service is a management aid — final decisions about member access to your
          premises remain yours.
        </Section>

        <Section n="10" title="Changes to these terms">
          These terms may be updated from time to time. Material changes will be communicated through the
          Service or by email; continued use after changes take effect constitutes acceptance.
        </Section>

        <Section n="11" title="Contact">
          Questions about these terms or your data can be sent through the in-app Feedback page or to the
          platform administrator's contact email provided at registration.
        </Section>
      </div>
      <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
        <button className="btn-primary" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-1 font-semibold text-slate-900">
        {n}. {title}
      </h3>
      <p>{children}</p>
    </section>
  );
}
