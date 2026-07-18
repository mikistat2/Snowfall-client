/**
 * All user-visible strings. English is the source of truth; Amharic ("am")
 * translations land later — missing keys fall back to English.
 */
const en = {
  // app
  'app.name': 'Snowfall Gym',
  'nav.dashboard': 'Dashboard',
  'nav.monitor': 'Monitor',
  'nav.members': 'Members',
  'nav.payments': 'Payments',
  'nav.settings': 'Settings',
  'nav.logout': 'Log out',

  // auth
  'auth.login': 'Log in',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.registerGym': 'Register your gym',
  'auth.gymName': 'Gym name',
  'auth.address': 'Address',
  'auth.phone': 'Phone',
  'auth.ownerName': 'Your name',
  'auth.createAccount': 'Create account',
  'auth.haveAccount': 'Already have an account? Log in',
  'auth.confirmPassword': 'Confirm password',
  'auth.agreeTerms': 'I have read and agree to the',
  'auth.termsLink': 'Terms & Conditions',
  'auth.passwordMismatch': 'Passwords do not match',
  'auth.pendingTitle': 'Registration received!',
  'auth.pendingBody':
    'Please wait until the Admin verifies your registration. This usually takes less than a day — you cannot log in before your gym is approved.',
  'auth.pendingEmail': 'We will notify you at',
  'auth.pendingStep1': 'Registration submitted',
  'auth.pendingStep2': 'Admin verification in progress',
  'auth.pendingStep3': 'Log in and set up your gym',
  'auth.backToLogin': 'Back to login',
  'auth.noAccount': 'New here? Register your gym',

  // statuses
  'status.active': 'Active',
  'status.expiring': 'Expiring',
  'status.grace': 'Grace',
  'status.expired': 'Expired',
  'status.frozen': 'Frozen',

  // monitor
  'monitor.occupancy': 'Inside now',
  'monitor.eventFeed': 'Live events',
  'monitor.allowEntry': 'Allow entry',
  'monitor.approve': 'Approve',
  'monitor.awaitingApproval': 'awaiting approval',
  'monitor.checkOut': 'Check out',
  'monitor.addGuest': 'Add guest',
  'monitor.guestAdded': 'Guest pass created',
  // camera source
  'camera.title': 'Camera source',
  'camera.button': 'Camera',
  'camera.flip': 'Flip camera',
  'camera.webcam': 'This device’s webcam',
  'camera.webcamHint': 'Uses the built-in or USB camera via the browser.',
  'camera.ip': 'Phone / IP camera on the network',
  'camera.ipHint':
    'e.g. the free "IP Webcam" Android app: open it → Start server → enter http://<phone-ip>:8080/video here. Phone and this computer must be on the same Wi-Fi.',
  'camera.test': 'Test stream',
  'camera.ipError': 'Stream unreachable — check the URL, Wi-Fi, and that the camera app server is running.',

  // guests
  'guests.validity': 'Pass valid',
  'guests.today': 'Today only',
  'guests.captureHint': 'Capture the guest’s face once so the camera recognizes them at the door.',
  'guests.create': 'Create guest pass',

  // audit log
  'nav.audit': 'Audit log',
  'audit.title': 'Audit log',
  'audit.when': 'When',
  'audit.who': 'Staff',
  'audit.action': 'Action',
  'audit.entity': 'Entity',
  'audit.details': 'Details',
  'audit.allEntities': 'All entities',
  'audit.searchAction': 'Filter by action…',
  'monitor.cameraError': 'Camera unavailable — check permissions',
  'monitor.loadingModels': 'Loading face recognition models…',
  'monitor.unknown': 'Unknown',
  'monitor.noneInside': 'Nobody is checked in right now',

  // members
  'members.title': 'Members',
  'members.search': 'Search name or phone…',
  'members.enroll': 'Enroll member',
  'members.allStatuses': 'All statuses',
  'members.name': 'Name',
  'members.plan': 'Plan',
  'members.expires': 'Expires',
  'members.status': 'Status',
  'members.renew': 'Renew / mark payment',
  'members.freeze': 'Freeze',
  'members.unfreeze': 'Unfreeze',
  'members.telegram': 'Telegram',
  'members.linked': 'Linked',
  'members.notLinked': 'Not linked',
  'members.subscriptions': 'Subscription history',
  'members.paymentHistory': 'Payments',
  'members.checkInHistory': 'Recent check-ins',
  'members.fullName': 'Full name',
  'members.sex': 'Sex',
  'members.male': 'Male',
  'members.female': 'Female',

  // enroll
  'enroll.title': 'Enroll new member',
  'enroll.details': 'Member details',
  'enroll.captures': 'Face captures',
  'enroll.captureHint': 'Capture 3–5 shots: look straight, then slightly left and right.',
  'enroll.capture': 'Capture',
  'enroll.retake': 'Remove',
  'enroll.needMore': 'Capture at least 3 face shots',
  'enroll.captureAtLeast': 'Captures needed:',
  'enroll.noFace': 'No face detected — move closer to the camera',
  'enroll.lowQuality': 'Low quality — improve lighting or move closer',
  'enroll.tooSmall': 'Face too small — move closer',
  'enroll.good': 'Good capture',
  'enroll.plan': 'Plan',
  'enroll.payment': 'First payment',
  'enroll.amount': 'Amount (ETB)',
  'enroll.method': 'Method',
  'enroll.note': 'Note',
  'enroll.submit': 'Enroll member',

  // payments
  'payments.title': 'Payments',
  'payments.member': 'Member',
  'payments.amount': 'Amount',
  'payments.method': 'Method',
  'payments.markedBy': 'Marked by',
  'payments.date': 'Date',
  'payments.from': 'From',
  'payments.to': 'To',
  'payments.allMethods': 'All methods',

  // dashboard
  'dashboard.title': 'Dashboard',
  'dashboard.checkInsToday': "Today's check-ins",
  'dashboard.occupancy': 'Inside now',
  'dashboard.revenue': 'Revenue this month',
  'dashboard.expiringSoon': 'Expiring in 7 days',
  'dashboard.peakHours': 'Peak hours (last 14 days)',

  // settings
  'settings.title': 'Settings',
  'settings.gym': 'Gym profile',
  'settings.rules': 'Entry & lifecycle rules',
  'settings.gracePeriod': 'Grace period (days)',
  'settings.autoCheckout': 'Auto-checkout after (hours)',
  'settings.reminderDays': 'Expiry reminder (days before)',
  'settings.nudgeDays': 'Absence nudge after (days)',
  'settings.threshold': 'Face match threshold',
  'settings.closing': 'Closing time',
  'settings.entryMode': 'Entry mode',
  'settings.entryAuto': 'Automatic — allowed members pass instantly',
  'settings.entryManual': 'Manual — staff approve each entry',
  'settings.entryModeHint': 'Manual mode: recognized members wait (yellow) until staff click Approve. Denials behave the same in both modes.',
  'settings.camera': 'Camera monitor',
  'settings.cameraOn': 'Enabled — face recognition check-in',
  'settings.cameraOff': 'Disabled — this gym has no camera',
  'settings.cameraHint': 'Disable if this gym has no camera: members are enrolled without face photos and the monitor shows the gym name instead.',
  'enroll.noCamera': 'Camera is disabled for this gym — the member will be registered without face captures. You can enable the camera later in Settings.',
  'settings.botToken': 'Telegram bot token',
  'settings.plans': 'Membership plans',
  'settings.addPlan': 'Add plan',
  'settings.staff': 'Staff accounts',
  'settings.addStaff': 'Add staff',
  'settings.save': 'Save',

  // telegram / notifications
  'nav.notifications': 'Notifications',
  'nav.guide': 'Start-up Guide',
  'nav.feedback': 'Feedback / Improvement',

  // feedback
  'feedback.title': 'Feedback & Improvement',
  'feedback.intro':
    'Have a suggestion, a bug to report, or an idea to make Snowfall better? Send it straight to the team.',
  'feedback.category': 'Type',
  'feedback.suggestion': 'Suggestion',
  'feedback.bug': 'Bug report',
  'feedback.improvement': 'Improvement idea',
  'feedback.other': 'Other',
  'feedback.subject': 'Subject',
  'feedback.message': 'Your message',
  'feedback.messagePlaceholder': 'Describe your idea, problem, or request in as much detail as you like…',
  'feedback.send': 'Send feedback',
  'feedback.sending': 'Sending…',
  'feedback.thanks': 'Thanks! Your feedback was sent to our team.',
  'notifications.title': 'Notifications',
  'notifications.member': 'Member',
  'notifications.type': 'Type',
  'notifications.status': 'Status',
  'notifications.message': 'Message',
  'notifications.date': 'Date',
  'notifications.allTypes': 'All types',
  'notifications.allStatuses': 'All statuses',
  'notifications.sent': 'Sent',
  'notifications.failed': 'Failed',
  'notifications.skipped': 'No chat linked',
  'notifications.skippedHint': 'Member has not linked Telegram — open their profile to generate a link.',
  'telegram.link': 'Link Telegram',
  'telegram.linkTitle': 'Link Telegram account',
  'telegram.scanHint': 'Scan with the phone, or open the link in Telegram. The link works once.',
  'telegram.copy': 'Copy link',
  'telegram.copied': 'Copied!',
  'telegram.relink': 'Generate new link',
  'telegram.botRunning': 'Bot running',
  'telegram.botStopped': 'Bot not running',
  'telegram.linkMyChat': 'Link my chat (admin alerts)',
  'telegram.myChatLinked': 'Your chat is linked',

  // common
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.loading': 'Loading…',
  'common.error': 'Something went wrong',
  'common.days': 'days',
  'common.birr': 'ETB',
} as const;

export type StringKey = keyof typeof en;

const am: Partial<Record<StringKey, string>> = {
  // Amharic translations land in a later phase.
};

let locale: 'en' | 'am' = 'en';

export function setLocale(l: 'en' | 'am'): void {
  locale = l;
}

export function t(key: StringKey): string {
  if (locale === 'am' && am[key]) return am[key] as string;
  return en[key];
}
