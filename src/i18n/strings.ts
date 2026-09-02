import * as storage from '../lib/storage';

/**
 * All user-visible strings. English is the source of truth; Amharic ("am")
 * translations land later — missing keys fall back to English.
 */
const en = {
  // app
  'app.name': 'Snowfall Gym',
  'nav.dashboard': 'Dashboard',
  'nav.today': 'Today',
  'nav.monitor': 'Monitor',
  'nav.members': 'Members',
  'nav.payments': 'Payments',
  'nav.settings': 'Settings',
  'nav.logout': 'Log out',
  // mobile bottom tabs
  'nav.live': 'Live',
  'nav.more': 'More',

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

  // phone input
  'phone.search': 'Search country',
  'phone.noResults': 'No country found',

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
  'camera.permissionDenied':
    'Camera permission denied. Allow it in Android Settings → Apps → Snowfall Gym → Permissions.',
  'camera.modelsFailed': 'Could not load face recognition models. Tap to retry.',

  // guests
  'guests.validity': 'Pass valid',
  'guests.today': 'Today only',
  'guests.captureHint': 'Capture the guest’s face once so the camera recognizes them at the door.',
  'guests.create': 'Create guest pass',

  // audit log
  'nav.audit': 'Audit log',
  'nav.billing': 'Billing',
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
  // member photo
  'photo.title': 'Profile photo',
  'photo.add': 'Add photo',
  'photo.change': 'Change photo',
  'photo.take': 'Take photo',
  'photo.choose': 'Choose from gallery',
  'photo.remove': 'Remove photo',
  'photo.capture': 'Capture',
  'photo.flip': 'Switch camera',
  'photo.cancel': 'Cancel',
  'photo.pending': 'New photo — save to keep it.',
  'photo.willRemove': 'Photo will be removed when you save.',
  'photo.none': 'No photo yet.',
  'photo.hint': 'Helps staff match a name to a face at the front desk.',

  'members.title': 'Members',
  'members.search': 'Search name or phone…',
  'members.enroll': 'Enroll member',
  'members.allStatuses': 'All statuses',
  'members.noneFound': 'No members match this filter.',
  'members.name': 'Name',
  'members.plan': 'Plan',
  'members.expires': 'Expires',
  'members.status': 'Status',
  'members.daysLeft': 'days left',
  'members.daysOverdue': 'days overdue',
  'members.dayLeft': 'day left',
  'members.dayOverdue': 'day overdue',
  'members.renew': 'Renew / mark payment',
  'members.freeze': 'Freeze',
  'members.unfreeze': 'Unfreeze',

  // removing a member
  'members.remove': 'Remove',
  'members.restore': 'Restore',
  'members.archived': 'Archived',
  'members.archivedBanner':
    'This member is archived — they are off the roster, will not be recognised at the door, and receive no reminders.',
  'remove.title': 'Remove member',
  'remove.restoreTitle': 'Restore member',
  'remove.archiveWhat':
    'Archiving takes them off the members list, the door monitor and the reminders. Their payment history is kept and you can restore them at any time.',
  'remove.hasPayments':
    'This member has recorded payments, so they cannot be deleted permanently — that would change your past income records. Archiving is the only option.',
  'remove.noPayments':
    'This member has no recorded payments, so they can also be deleted permanently. That cannot be undone.',
  'remove.restoreWhat':
    'They go back on the members list and their status is recalculated from their expiry date.',
  'remove.archive': 'Archive',
  'remove.delete': 'Delete permanently',
  'members.telegram': 'Telegram',
  'members.faceCaptures': 'Face captures',
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
  'enroll.subtitle': 'Register someone new, take their first payment and capture their face for the door — in one pass.',
  'enroll.namePlaceholder': 'e.g. Abebe Kebede',
  'enroll.paymentHint': 'Pick the package they are on; the amount is filled in from its price — change it if they paid something else.',
  'enroll.needPlan': 'Choose a plan to continue.',
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
  'enroll.needAmount': 'Enter the amount collected — it is required for every membership payment.',
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
  // shown in place of the live/check-in tiles when the gym runs without a camera
  'dashboard.membersTotal': 'Members',
  'dashboard.bySex': 'Male / female',
  'dashboard.noCameraHint': 'Camera off — showing your roster instead of live entry data.',

  // settings
  'settings.title': 'Settings',
  'settings.gym': 'Gym profile',
  'settings.rules': 'Entry & lifecycle rules',
  'settings.rulesHint': 'How this gym decides who may enter, when a membership lapses, and when the system reaches out.',
  'settings.gracePeriodHint': 'Days after expiry a member may still be let in before they count as expired.',
  'settings.reminderDaysHint': 'How many days before expiry the reminder goes out — and when a membership starts showing as expiring.',
  'settings.autoCheckoutHint': 'A session still open after this long is checked out automatically.',
  'settings.nudgeDaysHint': 'Nudge a member over Telegram once they have not visited for this many days.',
  'settings.thresholdHint': 'Face-match strictness. Lower is stricter; 0.5 suits most gyms.',
  'settings.closingHint': 'Anyone still checked in is checked out at this time.',
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

  // previous members (back-filled from the gym's paper register)
  'nav.addPrevious': 'Add previous member',
  'prev.title': 'Add previous member',
  'prev.intro':
    'For members who were already training before this system was installed. Type the dates exactly as they are written in your paper register — the system works out the expiry and the status by itself.',
  'prev.dates': 'Dates from the paper record',
  'prev.calendar': 'The dates on the paper are in',
  'prev.calendarEthiopian': 'Ethiopian (ዓ.ም)',
  'prev.calendarGregorian': 'Gregorian (G.C.)',
  'prev.joinedAt': 'First registered on',
  'prev.startsAt': 'Current membership started on',
  'prev.startsAtHint': 'The date of their most recent payment. Same as the registration date if they never renewed.',
  'prev.expiresAt': 'Expires on',
  'prev.customExpiry': 'Type the expiry date myself',
  'prev.expiryFromPlan': 'Expiry = start date + the plan’s duration.',
  'prev.preview': 'How it will be saved',
  'prev.previewEmpty': 'Choose a plan and the dates to see the result.',
  'prev.daysLeft': 'days left',
  'prev.daysOverdue': 'days overdue',
  'prev.expiredHint': 'This membership is already over, so the member will be refused at the door until they renew.',
  'prev.payment': 'Past payment',
  'prev.recordPayment': 'Record the payment they already made',
  'prev.paymentHint': 'Saved with the start date above, so an old payment never shows up in this month’s income.',
  'prev.captures': 'Face captures (optional)',
  'prev.capturesHint':
    'Only if the member is here right now. Leave empty and capture their face the next time they come in.',
  'prev.submit': 'Add previous member',
  'prev.addedThisSession': 'added — the form is ready for the next one',
  'prev.errRequired': 'Fill in the name, the plan, and both dates.',
  'prev.errJoinedFuture': 'The registration date is in the future — check the calendar setting above.',
  'prev.errStartBeforeJoin': 'The membership cannot start before the member registered.',
  'prev.errExpiryMissing': 'Choose a plan, or type the expiry date yourself.',
  'prev.errExpiryBeforeStart': 'The expiry date cannot be before the start date.',
  'prev.errCaptures': 'Capture at least 3 face shots, or remove them all and do it later.',

  // edit an existing member
  'edit.action': 'Edit',
  'edit.title': 'Edit member',
  'edit.details': 'Member details',
  'edit.membership': 'Current membership',
  'edit.calendar': 'Type the dates in',
  'edit.noSubscription': 'This member has no membership period yet — use Renew to give them one.',
  'edit.ownerOnly': 'Only the owner can change the plan or the dates.',
  'edit.planInactive': 'retired',
  'edit.usePlanExpiry': 'Use the plan’s expiry:',
  'edit.shiftForward': 'This moves the expiry forward by',
  'edit.shiftBack': 'This moves the expiry back by',
  'edit.shiftHint': 'no payment is recorded',
  'edit.errName': 'Enter the member’s full name.',
  'edit.errJoinedMissing': 'Fill in the registration date.',
  'edit.errDatesMissing': 'Choose a plan and fill in both membership dates.',

  'date.day': 'Day',
  'date.month': 'Month',
  'date.year': 'Year',
  'date.gregorianIs': 'Gregorian:',
  'date.ethiopianIs': 'Ethiopian:',
  'date.ethiopianHint': 'For example: 12 Nehase 2018',
  'date.invalid': 'No such date in the Ethiopian calendar — check the day.',

  'settings.botToken': 'Telegram bot token',
  'settings.plans': 'Membership plans',
  'settings.addPlan': 'Add plan',
  'settings.staff': 'Staff accounts',
  'settings.addStaff': 'Add staff',
  'settings.save': 'Save',
  'settings.language': 'Language',
  'settings.languageHint':
    'Changes menus and labels on this device only — member names and everything you typed stay exactly as entered.',
  'settings.appearanceHint':
    'Applies to this device only. “System” follows your computer’s own light/dark setting.',

  // telegram / notifications
  'nav.notifications': 'Notifications',
  'nav.guide': 'Start-up Guide',
  'nav.feedback': 'Feedback / Improvement',

  // today digest
  'today.title': "Today at a glance",
  'today.subtitle': 'What happened today and who needs your attention',
  'today.checkIns': 'Check-ins today',
  'today.denied': 'denied',
  'today.uniqueMembers': 'unique members',
  'today.inside': 'Currently inside',
  'today.paymentsTotal': 'Collected today',
  'today.newMembers': 'New members',
  'today.guestPasses': 'Guest passes',
  'today.newMembersTitle': 'New members today',
  'today.noNewMembers': 'No new members enrolled today.',
  'today.expiringTitle': 'Expiring in the next 7 days',
  'today.noExpiring': 'Nobody expires in the next 7 days. 🎉',
  'today.expiredTitle': 'Expired in the last 7 days',
  'today.noExpired': 'Nobody expired in the last 7 days.',
  'today.expiredHint': 'Call them before they drift away — one tap renews from their profile.',
  'today.paymentsTitle': 'Payments today',
  'today.noPayments': 'No payments recorded today.',
  'today.expiresToday': 'today!',
  'today.tomorrow': 'tomorrow',
  'today.daysLeft': 'days left',
  'today.daysAgo': 'days ago',
  'today.yesterday': 'yesterday',
  'today.plan': 'Plan',
  'today.joined': 'joined',

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

  // custom dropdown (components/ui/Select)
  'select.search': 'Search',
  'select.noResults': 'No matches',
  'select.none': 'None',

  // common
  'common.cancel': 'Cancel',
  'common.back': 'Back',
  'common.save': 'Save',
  // mobile shell
  'more.title': 'More',
  'more.appearance': 'Appearance',
  'more.theme.system': 'System',
  'more.theme.light': 'Light',
  'more.theme.dark': 'Dark',
  'more.exitHint': 'Press back again to exit',
  'live.title': 'Live events',
  'live.comingSoon': 'The live event feed arrives in the next step.',

  // mobile home screen
  'home.morning': 'Good morning',
  'home.afternoon': 'Good afternoon',
  'home.evening': 'Good evening',
  'home.insideNow': 'Inside now',
  'home.liveLabel': 'LIVE',
  'home.people': 'people',
  'home.person': 'person',
  'home.quickActions': 'Quick actions',
  'home.actionEnroll': 'Enroll',
  'home.actionMembers': 'Members',
  'home.actionPayments': 'Payments',
  'home.actionLive': 'Live',
  'home.checkInsToday': 'Check-ins',
  'home.membersTotal': 'Members',
  'home.onTheRoster': 'on the roster',
  'home.bySex': 'Male / female',
  'home.collectedToday': 'Collected',
  'home.expiringSoon': 'Expiring',
  'home.newToday': 'New today',
  'home.needsAttention': 'Needs attention',
  'home.allGood': 'Nothing needs your attention today.',
  'home.viewAll': 'View all',
  'home.expiredAgo': 'expired',
  'home.retry': 'Retry',
  'home.offline': 'Cannot reach the server',
  'home.pullToRefresh': 'Pull to refresh',
  'home.releaseToRefresh': 'Release to refresh',
  'home.refreshing': 'Refreshing…',

  // --- home stat detail sheets ---
  'home.sheetCheckIns': 'Check-ins today',
  'home.sheetCollected': 'Collected today',
  'home.sheetExpiring': 'Expiring soon',
  'home.sheetNew': 'New members today',
  'home.allowed': 'Allowed',
  'home.denied': 'Denied',
  'home.uniqueMembers': 'Unique members',
  'home.guestPasses': 'Guest passes',
  'home.checkInsNote': 'Individual entries appear in the live feed and on the Today page.',
  'home.emptyCheckIns': 'No check-ins recorded yet today.',
  'home.emptyPayments': 'No payments recorded yet today.',
  'home.emptyNew': 'No new members joined today.',
  'home.emptyExpiring': 'No memberships expiring in the next 7 days.',
  'home.noPhone': 'No phone number',
  'home.paymentsSummary': 'payments',
  'home.membersSummary': 'members',

  'common.delete': 'Delete',
  'common.close': 'Close',
  // pager (shared by the notification and audit tables)
  'pager.prev': 'Previous page',
  'pager.next': 'Next page',
  'pager.entries': 'entries',
  'common.loading': 'Loading…',
  'common.loadMore': 'Load more',
  'common.loadingMore': 'Loading more…',
  'common.allLoaded': 'End of list',
  'common.error': 'Something went wrong',
  'common.days': 'days',
  'common.hours': 'hours',
  'common.birr': 'ETB',
} as const;

export type StringKey = keyof typeof en;

/**
 * Amharic UI labels. Only interface text is translated — member names, gym
 * names, notes and every other typed value are data and are never touched.
 */
const am: Partial<Record<StringKey, string>> = {
  // app
  'app.name': 'ስኖውፎል ጂም',
  'nav.dashboard': 'ዳሽቦርድ',
  'nav.today': 'ዛሬ',
  'nav.monitor': 'ሞኒተር',
  'nav.members': 'አባላት',
  'nav.payments': 'ክፍያዎች',
  'nav.settings': 'ቅንብሮች',
  'nav.logout': 'ውጣ',
  'nav.live': 'ቀጥታ',
  'nav.more': 'ተጨማሪ',

  // auth
  'auth.login': 'ግባ',
  'auth.email': 'ኢሜይል',
  'auth.password': 'የይለፍ ቃል',
  'auth.registerGym': 'ጂምዎን ያስመዝግቡ',
  'auth.gymName': 'የጂም ስም',
  'auth.address': 'አድራሻ',
  'auth.phone': 'ስልክ',
  'phone.search': 'አገር ይፈልጉ',
  'phone.noResults': 'አገር አልተገኘም',
  'auth.ownerName': 'ስምዎ',
  'auth.createAccount': 'መለያ ፍጠር',
  'auth.haveAccount': 'መለያ አለዎት? ይግቡ',
  'auth.confirmPassword': 'የይለፍ ቃል ያረጋግጡ',
  'auth.agreeTerms': 'አንብቤ ተስማምቻለሁ፡',
  'auth.termsLink': 'ውሎች እና ሁኔታዎች',
  'auth.passwordMismatch': 'የይለፍ ቃሎች አይመሳሰሉም',
  'auth.pendingTitle': 'ምዝገባዎ ደርሷል!',
  'auth.pendingBody':
    'አስተዳዳሪው ምዝገባዎን እስኪያረጋግጥ ይጠብቁ። ብዙውን ጊዜ ከአንድ ቀን በታች ይወስዳል — ጂምዎ ከመጽደቁ በፊት መግባት አይችሉም።',
  'auth.pendingEmail': 'በዚህ ኢሜይል እናሳውቅዎታለን፡',
  'auth.pendingStep1': 'ምዝገባ ተልኳል',
  'auth.pendingStep2': 'የአስተዳዳሪ ማረጋገጫ በሂደት ላይ',
  'auth.pendingStep3': 'ገብተው ጂምዎን ያዘጋጁ',
  'auth.backToLogin': 'ወደ መግቢያ ተመለስ',
  'auth.noAccount': 'አዲስ ነዎት? ጂምዎን ያስመዝግቡ',

  // statuses
  'status.active': 'ንቁ',
  'status.expiring': 'ሊያበቃ ነው',
  'status.grace': 'የችሮታ ጊዜ',
  'status.expired': 'ጊዜው ያለፈ',
  'status.frozen': 'የታገደ',

  // monitor
  'monitor.occupancy': 'አሁን ውስጥ ያሉ',
  'monitor.eventFeed': 'የቀጥታ ክስተቶች',
  'monitor.allowEntry': 'መግባት ፍቀድ',
  'monitor.approve': 'አጽድቅ',
  'monitor.awaitingApproval': 'ማጽደቅ በመጠበቅ ላይ',
  'monitor.checkOut': 'አስወጣ',
  'monitor.addGuest': 'እንግዳ ጨምር',
  'monitor.guestAdded': 'የእንግዳ ፈቃድ ተፈጥሯል',
  'monitor.cameraError': 'ካሜራ አልተገኘም — ፈቃዶችን ያረጋግጡ',
  'monitor.loadingModels': 'የፊት መለያ ሞዴሎች በመጫን ላይ…',
  'monitor.unknown': 'ያልታወቀ',
  'monitor.noneInside': 'አሁን ማንም አልገባም',

  // camera source
  'camera.title': 'የካሜራ ምንጭ',
  'camera.button': 'ካሜራ',
  'camera.flip': 'ካሜራ ቀይር',
  'camera.webcam': 'የዚህ መሣሪያ ካሜራ',
  'camera.webcamHint': 'የተሰራውን ወይም የUSB ካሜራ በአሳሹ በኩል ይጠቀማል።',
  'camera.ip': 'በኔትወርክ ላይ ያለ ስልክ / IP ካሜራ',
  'camera.ipHint':
    'ለምሳሌ ነፃው የ"IP Webcam" አንድሮይድ መተግበሪያ፡ ይክፈቱት → Start server → http://<የስልክ-ip>:8080/video እዚህ ያስገቡ። ስልኩ እና ይህ ኮምፒውተር በአንድ Wi-Fi ላይ መሆን አለባቸው።',
  'camera.test': 'ዥረት ሞክር',
  'camera.ipError': 'ዥረቱ አልተገኘም — URL፣ Wi-Fi እና የካሜራ መተግበሪያው መሥራቱን ያረጋግጡ።',
  'camera.permissionDenied':
    'የካሜራ ፈቃድ ተከልክሏል። በAndroid ቅንብሮች → መተግበሪያዎች → Snowfall Gym → ፈቃዶች ውስጥ ይፍቀዱ።',
  'camera.modelsFailed': 'የፊት መለያ ሞዴሎችን መጫን አልተቻለም። እንደገና ለመሞከር ይንኩ።',

  // guests
  'guests.validity': 'ፈቃዱ የሚቆይበት',
  'guests.today': 'ዛሬ ብቻ',
  'guests.captureHint': 'ካሜራው በበሩ ላይ እንዲያውቀው የእንግዳውን ፊት አንድ ጊዜ ያንሱ።',
  'guests.create': 'የእንግዳ ፈቃድ ፍጠር',

  // audit log
  'nav.audit': 'የክንውን መዝገብ',
  'nav.billing': 'ክፍያ',
  'audit.title': 'የክንውን መዝገብ',
  'audit.when': 'መቼ',
  'audit.who': 'ሠራተኛ',
  'audit.action': 'ተግባር',
  'audit.entity': 'አካል',
  'audit.details': 'ዝርዝሮች',
  'audit.allEntities': 'ሁሉም አካላት',
  'audit.searchAction': 'በተግባር አጣራ…',

  // members
  'members.title': 'አባላት',
  'members.search': 'በስም ወይም በስልክ ፈልግ…',
  'members.enroll': 'አባል መዝግብ',
  'members.allStatuses': 'ሁሉም ሁኔታዎች',
  'members.name': 'ስም',
  'members.plan': 'እቅድ',
  'members.expires': 'የሚያበቃበት',
  'members.status': 'ሁኔታ',
  'members.daysLeft': 'ቀናት ቀርተዋል',
  'members.daysOverdue': 'ቀናት አልፈዋል',
  'members.renew': 'አድስ / ክፍያ መዝግብ',
  'members.freeze': 'አግድ',
  'members.unfreeze': 'እገዳ አንሳ',

  // removing a member
  'members.remove': 'አስወግድ',
  'members.restore': 'መልስ',
  'members.archived': 'የተመዘገቡ (ተቀማጭ)',
  'members.archivedBanner':
    'ይህ አባል ተቀማጭ ተደርጓል — ከዝርዝሩ ውጪ ነው፣ በበሩ ላይ አይታወቅም፣ ማስታወሻዎችም አይላኩለትም።',
  'remove.title': 'አባል አስወግድ',
  'remove.restoreTitle': 'አባል መልስ',
  'remove.archiveWhat':
    'ተቀማጭ ማድረግ ከአባላት ዝርዝር፣ ከበር ሞኒተር እና ከማስታወሻዎች ያስወጣቸዋል። የክፍያ ታሪካቸው ይቀመጣል፤ በማንኛውም ጊዜ መመለስ ይችላሉ።',
  'remove.hasPayments':
    'ይህ አባል የተመዘገበ ክፍያ አለው፤ ስለዚህ በቋሚነት መሰረዝ አይቻልም — ያለፈውን የገቢ መዝገብ ስለሚቀይር። ተቀማጭ ማድረግ ብቻ ነው የሚቻለው።',
  'remove.noPayments':
    'ይህ አባል የተመዘገበ ክፍያ የለውም፤ ስለዚህ በቋሚነት መሰረዝም ይቻላል። ይህ አይመለስም።',
  'remove.restoreWhat': 'ወደ አባላት ዝርዝር ይመለሳሉ፤ ሁኔታቸውም ከማብቂያ ቀናቸው እንደገና ይሰላል።',
  'remove.archive': 'ተቀማጭ አድርግ',
  'remove.delete': 'በቋሚነት ሰርዝ',
  'members.telegram': 'ቴሌግራም',
  'members.linked': 'ተገናኝቷል',
  'members.notLinked': 'አልተገናኘም',
  'members.subscriptions': 'የአባልነት ታሪክ',
  'members.paymentHistory': 'ክፍያዎች',
  'members.checkInHistory': 'የቅርብ ጊዜ መግቢያዎች',
  'members.fullName': 'ሙሉ ስም',
  'members.sex': 'ጾታ',
  'members.male': 'ወንድ',
  'members.female': 'ሴት',

  // enroll
  'enroll.title': 'አዲስ አባል መዝግብ',
  'enroll.details': 'የአባል ዝርዝሮች',
  'enroll.captures': 'የፊት ፎቶዎች',
  'enroll.captureHint': '3–5 ፎቶዎችን ያንሱ፡ ቀጥታ ይመልከቱ፣ ከዚያ ትንሽ ወደ ግራ እና ወደ ቀኝ።',
  'enroll.capture': 'አንሳ',
  'enroll.retake': 'አስወግድ',
  'enroll.needMore': 'ቢያንስ 3 የፊት ፎቶዎችን ያንሱ',
  'enroll.captureAtLeast': 'የሚያስፈልጉ ፎቶዎች፡',
  'enroll.noFace': 'ፊት አልተገኘም — ወደ ካሜራው ይቅረቡ',
  'enroll.lowQuality': 'ዝቅተኛ ጥራት — ብርሃን ያሻሽሉ ወይም ይቅረቡ',
  'enroll.tooSmall': 'ፊቱ በጣም ትንሽ ነው — ይቅረቡ',
  'enroll.good': 'ጥሩ ፎቶ',
  'enroll.plan': 'እቅድ',
  'enroll.payment': 'የመጀመሪያ ክፍያ',
  'enroll.amount': 'መጠን (ብር)',
  'enroll.method': 'መንገድ',
  'enroll.note': 'ማስታወሻ',
  'enroll.submit': 'አባል መዝግብ',
  'enroll.noCamera':
    'ለዚህ ጂም ካሜራ ጠፍቷል — አባሉ ያለ ፊት ፎቶ ይመዘገባል። በኋላ በቅንብሮች ውስጥ ማብራት ይችላሉ።',

  // previous members
  'nav.addPrevious': 'ነባር አባል ጨምር',
  'prev.title': 'ነባር አባል ጨምር',
  'prev.intro':
    'ይህ ሲስተም ከመግባቱ በፊት ሲለማመዱ የነበሩ አባላት። ቀኖቹን በወረቀት መዝገብዎ ላይ እንደተጻፉት ያስገቡ — ሲስተሙ የመጠናቀቂያ ቀኑንና ሁኔታውን ራሱ ያሰላል።',
  'prev.dates': 'ከወረቀት መዝገቡ የተወሰዱ ቀኖች',
  'prev.calendar': 'በወረቀቱ ላይ ያሉት ቀኖች',
  'prev.calendarEthiopian': 'የኢትዮጵያ (ዓ.ም)',
  'prev.calendarGregorian': 'የፈረንጅ (እ.ኤ.አ)',
  'prev.joinedAt': 'ለመጀመሪያ ጊዜ የተመዘገበበት ቀን',
  'prev.startsAt': 'የአሁኑ አባልነት የጀመረበት ቀን',
  'prev.startsAtHint': 'የመጨረሻ ክፍያቸው ቀን። ካላደሱ ከምዝገባው ቀን ጋር አንድ ነው።',
  'prev.expiresAt': 'የሚያበቃበት ቀን',
  'prev.customExpiry': 'የማብቂያ ቀኑን እኔ አስገባለሁ',
  'prev.expiryFromPlan': 'ማብቂያ = የመጀመሪያ ቀን + የእቅዱ ቆይታ።',
  'prev.preview': 'እንዴት እንደሚቀመጥ',
  'prev.previewEmpty': 'ውጤቱን ለማየት እቅድና ቀኖቹን ይምረጡ።',
  'prev.daysLeft': 'ቀናት ይቀራሉ',
  'prev.daysOverdue': 'ቀናት አልፈዋል',
  'prev.expiredHint': 'ይህ አባልነት አብቅቷል፤ እስኪያድሱ ድረስ አባሉ በበሩ ላይ ይከለከላል።',
  'prev.payment': 'ያለፈ ክፍያ',
  'prev.recordPayment': 'የከፈሉትን ክፍያ መዝግብ',
  'prev.paymentHint': 'ከላይ ባለው የመጀመሪያ ቀን ይመዘገባል፤ ስለዚህ አሮጌ ክፍያ በዚህ ወር ገቢ ውስጥ አይታይም።',
  'prev.captures': 'የፊት ፎቶዎች (አማራጭ)',
  'prev.capturesHint': 'አባሉ አሁን እዚህ ካለ ብቻ። ካልሆነ ባዶ ይተውት፤ በሚቀጥለው ጊዜ ሲመጡ ያንሱ።',
  'prev.submit': 'ነባር አባል ጨምር',
  'prev.addedThisSession': 'ተጨምረዋል — ቅጹ ለቀጣዩ ዝግጁ ነው',
  'prev.errRequired': 'ስም፣ እቅድና ሁለቱንም ቀኖች ይሙሉ።',
  'prev.errJoinedFuture': 'የምዝገባው ቀን ወደፊት ነው — ከላይ ያለውን የቀን አቆጣጠር ያረጋግጡ።',
  'prev.errStartBeforeJoin': 'አባልነቱ አባሉ ከመመዝገቡ በፊት ሊጀምር አይችልም።',
  'prev.errExpiryMissing': 'እቅድ ይምረጡ ወይም የማብቂያ ቀኑን ያስገቡ።',
  'prev.errExpiryBeforeStart': 'የማብቂያ ቀን ከመጀመሪያው ቀን በፊት ሊሆን አይችልም።',
  'prev.errCaptures': 'ቢያንስ 3 የፊት ፎቶዎችን ያንሱ፣ ወይም ሁሉንም አስወግደው በኋላ ያድርጉት።',

  // edit an existing member
  'edit.action': 'አርትዕ',
  'edit.title': 'አባል አርትዕ',
  'edit.details': 'የአባል መረጃ',
  'edit.membership': 'የአሁኑ አባልነት',
  'edit.calendar': 'ቀኖቹን የሚያስገቡት በ',
  'edit.noSubscription': 'ይህ አባል እስካሁን የአባልነት ጊዜ የለውም — ለመስጠት «አድስ» ይጠቀሙ።',
  'edit.ownerOnly': 'እቅዱን ወይም ቀኖቹን መቀየር የሚችለው ባለቤቱ ብቻ ነው።',
  'edit.planInactive': 'የቆመ',
  'edit.usePlanExpiry': 'የእቅዱን የማብቂያ ቀን ተጠቀም፡',
  'edit.shiftForward': 'ይህ የማብቂያ ቀኑን ወደፊት ያንቀሳቅሰዋል በ',
  'edit.shiftBack': 'ይህ የማብቂያ ቀኑን ወደኋላ ያንቀሳቅሰዋል በ',
  'edit.shiftHint': 'ምንም ክፍያ አይመዘገብም',
  'edit.errName': 'የአባሉን ሙሉ ስም ያስገቡ።',
  'edit.errJoinedMissing': 'የምዝገባ ቀኑን ይሙሉ።',
  'edit.errDatesMissing': 'እቅድ ይምረጡ እና ሁለቱንም የአባልነት ቀኖች ይሙሉ።',

  'date.day': 'ቀን',
  'date.month': 'ወር',
  'date.year': 'ዓመት',
  'date.gregorianIs': 'የፈረንጅ፡',
  'date.ethiopianIs': 'የኢትዮጵያ፡',
  'date.ethiopianHint': 'ለምሳሌ፡ 12 ነሐሴ 2018',
  'date.invalid': 'በኢትዮጵያ ዘመን አቆጣጠር እንዲህ ያለ ቀን የለም — ቀኑን ያረጋግጡ።',

  // payments
  'payments.title': 'ክፍያዎች',
  'payments.member': 'አባል',
  'payments.amount': 'መጠን',
  'payments.method': 'መንገድ',
  'payments.markedBy': 'የመዘገበው',
  'payments.date': 'ቀን',
  'payments.from': 'ከ',
  'payments.to': 'እስከ',
  'payments.allMethods': 'ሁሉም መንገዶች',

  // dashboard
  'dashboard.title': 'ዳሽቦርድ',
  'dashboard.checkInsToday': 'የዛሬ መግቢያዎች',
  'dashboard.occupancy': 'አሁን ውስጥ ያሉ',
  'dashboard.revenue': 'የዚህ ወር ገቢ',
  'dashboard.expiringSoon': 'በ7 ቀናት ውስጥ የሚያበቁ',
  'dashboard.peakHours': 'ከፍተኛ ሰዓታት (ያለፉት 14 ቀናት)',

  // settings
  'settings.title': 'ቅንብሮች',
  'settings.gym': 'የጂም መገለጫ',
  'settings.rules': 'የመግቢያ እና የአባልነት ህጎች',
  'settings.gracePeriod': 'የችሮታ ጊዜ (ቀናት)',
  'settings.autoCheckout': 'በራስ-ሰር መውጫ በኋላ (ሰዓታት)',
  'settings.reminderDays': 'የማብቂያ ማስታወሻ (ቀናት በፊት)',
  'settings.nudgeDays': 'የመቅረት ማስታወሻ በኋላ (ቀናት)',
  'settings.threshold': 'የፊት መመሳሰል ደረጃ',
  'settings.closing': 'የመዝጊያ ሰዓት',
  'settings.entryMode': 'የመግቢያ ሁነታ',
  'settings.entryAuto': 'በራስ-ሰር — የተፈቀደላቸው አባላት ወዲያውኑ ይገባሉ',
  'settings.entryManual': 'በእጅ — ሠራተኞች እያንዳንዱን መግቢያ ያጸድቃሉ',
  'settings.entryModeHint':
    'በእጅ ሁነታ፡ የታወቁ አባላት ሠራተኛ "አጽድቅ" እስኪጫን ይጠብቃሉ (ቢጫ)። መከልከል በሁለቱም ሁነታዎች አንድ ነው።',
  'settings.camera': 'የካሜራ ሞኒተር',
  'settings.cameraOn': 'ነቅቷል — በፊት መለያ መግባት',
  'settings.cameraOff': 'ጠፍቷል — ይህ ጂም ካሜራ የለውም',
  'settings.cameraHint':
    'ይህ ጂም ካሜራ ከሌለው ያጥፉት፡ አባላት ያለ ፊት ፎቶ ይመዘገባሉ፣ ሞኒተሩም የጂሙን ስም ያሳያል።',
  'settings.botToken': 'የቴሌግራም ቦት ቶከን',
  'settings.plans': 'የአባልነት እቅዶች',
  'settings.addPlan': 'እቅድ ጨምር',
  'settings.staff': 'የሠራተኛ መለያዎች',
  'settings.addStaff': 'ሠራተኛ ጨምር',
  'settings.save': 'አስቀምጥ',
  'settings.language': 'ቋንቋ',
  'settings.languageHint':
    'ለዚህ መሣሪያ ምናሌዎችን እና መለያ ጽሁፎችን ብቻ ይቀይራል — የአባላት ስሞች እና ያስገቡት መረጃ በሙሉ እንደጻፉት ይቆያል።',
  'settings.appearanceHint':
    'ለዚህ መሣሪያ ብቻ ይሠራል። “ሲስተም” የኮምፒውተርዎን የብርሃን/ጨለማ ቅንብር ይከተላል።',

  // telegram / notifications
  'nav.notifications': 'ማሳወቂያዎች',
  'nav.guide': 'የመጀመሪያ መመሪያ',
  'nav.feedback': 'አስተያየት / ማሻሻያ',

  // today digest
  'today.title': 'ዛሬ በአጭሩ',
  'today.subtitle': 'ዛሬ የሆነው እና ትኩረትዎን የሚፈልጉ',
  'today.checkIns': 'የዛሬ መግቢያዎች',
  'today.denied': 'የተከለከሉ',
  'today.uniqueMembers': 'የተለያዩ አባላት',
  'today.inside': 'አሁን ውስጥ ያሉ',
  'today.paymentsTotal': 'ዛሬ የተሰበሰበ',
  'today.newMembers': 'አዲስ አባላት',
  'today.guestPasses': 'የእንግዳ ፈቃዶች',
  'today.newMembersTitle': 'ዛሬ የተመዘገቡ አዲስ አባላት',
  'today.noNewMembers': 'ዛሬ ምንም አዲስ አባል አልተመዘገበም።',
  'today.expiringTitle': 'በሚቀጥሉት 7 ቀናት የሚያበቁ',
  'today.noExpiring': 'በሚቀጥሉት 7 ቀናት የሚያበቃ የለም። 🎉',
  'today.expiredTitle': 'ባለፉት 7 ቀናት ያበቁ',
  'today.noExpired': 'ባለፉት 7 ቀናት ያበቃ የለም።',
  'today.expiredHint': 'ከመራቃቸው በፊት ይደውሉላቸው — ከመገለጫቸው በአንድ ጠቅታ ይታደሳል።',
  'today.paymentsTitle': 'የዛሬ ክፍያዎች',
  'today.noPayments': 'ዛሬ ምንም ክፍያ አልተመዘገበም።',
  'today.expiresToday': 'ዛሬ!',
  'today.tomorrow': 'ነገ',
  'today.daysLeft': 'ቀናት ቀርተዋል',
  'today.daysAgo': 'ቀናት በፊት',
  'today.yesterday': 'ትናንት',
  'today.plan': 'እቅድ',
  'today.joined': 'የተመዘገበው',

  // feedback
  'feedback.title': 'አስተያየት እና ማሻሻያ',
  'feedback.intro': 'ሀሳብ፣ የሚነገር ችግር ወይም Snowfall-ን የሚያሻሽል ሀሳብ አለዎት? በቀጥታ ለቡድኑ ይላኩ።',
  'feedback.category': 'አይነት',
  'feedback.suggestion': 'ሀሳብ',
  'feedback.bug': 'የችግር ሪፖርት',
  'feedback.improvement': 'የማሻሻያ ሀሳብ',
  'feedback.other': 'ሌላ',
  'feedback.subject': 'ርዕስ',
  'feedback.message': 'መልእክትዎ',
  'feedback.messagePlaceholder': 'ሀሳብዎን፣ ችግርዎን ወይም ጥያቄዎን በዝርዝር ይግለጹ…',
  'feedback.send': 'አስተያየት ላክ',
  'feedback.sending': 'በመላክ ላይ…',
  'feedback.thanks': 'እናመሰግናለን! አስተያየትዎ ለቡድናችን ተልኳል።',
  'notifications.title': 'ማሳወቂያዎች',
  'notifications.member': 'አባል',
  'notifications.type': 'አይነት',
  'notifications.status': 'ሁኔታ',
  'notifications.message': 'መልእክት',
  'notifications.date': 'ቀን',
  'notifications.allTypes': 'ሁሉም አይነቶች',
  'notifications.allStatuses': 'ሁሉም ሁኔታዎች',
  'notifications.sent': 'ተልኳል',
  'notifications.failed': 'አልተሳካም',
  'notifications.skipped': 'ቻት አልተገናኘም',
  'notifications.skippedHint': 'አባሉ ቴሌግራም አላገናኘም — ሊንክ ለመፍጠር መገለጫቸውን ይክፈቱ።',
  'telegram.link': 'ቴሌግራም አገናኝ',
  'telegram.linkTitle': 'የቴሌግራም መለያ አገናኝ',
  'telegram.scanHint': 'በስልክ ይቃኙ፣ ወይም ሊንኩን በቴሌግራም ይክፈቱ። ሊንኩ አንድ ጊዜ ብቻ ይሠራል።',
  'telegram.copy': 'ሊንክ ቅዳ',
  'telegram.copied': 'ተቀድቷል!',
  'telegram.relink': 'አዲስ ሊንክ ፍጠር',
  'telegram.botRunning': 'ቦቱ እየሠራ ነው',
  'telegram.botStopped': 'ቦቱ እየሠራ አይደለም',
  'telegram.linkMyChat': 'የኔን ቻት አገናኝ (የአስተዳዳሪ ማንቂያዎች)',
  'telegram.myChatLinked': 'ቻትዎ ተገናኝቷል',

  // common
  'common.cancel': 'ይቅር',
  'common.back': 'ተመለስ',
  'common.save': 'አስቀምጥ',
  'more.title': 'ተጨማሪ',
  'more.appearance': 'ገጽታ',
  'more.theme.system': 'የስርዓቱ',
  'more.theme.light': 'ብሩህ',
  'more.theme.dark': 'ጨለማ',
  'more.exitHint': 'ለመውጣት እንደገና ተመለስ ይጫኑ',
  'live.title': 'ቀጥታ ክንውኖች',

  // mobile home screen
  'home.morning': 'እንደምን አደሩ',
  'home.afternoon': 'እንደምን ዋሉ',
  'home.evening': 'እንደምን አመሹ',
  'home.insideNow': 'አሁን ውስጥ ያሉ',
  'home.liveLabel': 'ቀጥታ',
  'home.people': 'ሰዎች',
  'home.person': 'ሰው',
  'home.quickActions': 'ፈጣን እርምጃዎች',
  'home.actionEnroll': 'መዝግብ',
  'home.actionMembers': 'አባላት',
  'home.actionPayments': 'ክፍያዎች',
  'home.actionLive': 'ቀጥታ',
  'home.checkInsToday': 'መግቢያዎች',
  'home.collectedToday': 'የተሰበሰበ',
  'home.expiringSoon': 'የሚያልቅ',
  'home.newToday': 'አዲስ ዛሬ',
  'home.needsAttention': 'ትኩረት የሚሹ',
  'home.allGood': 'ዛሬ ትኩረት የሚሻ ነገር የለም።',
  'home.viewAll': 'ሁሉንም ተመልከት',
  'home.expiredAgo': 'አልቋል',
  'home.retry': 'እንደገና ሞክር',
  'home.offline': 'ሰርቨሩ ላይ መድረስ አልተቻለም',
  'home.pullToRefresh': 'ለማደስ ይጎትቱ',
  'home.releaseToRefresh': 'ለማደስ ይልቀቁ',
  'home.refreshing': 'በማደስ ላይ…',

  // --- home stat detail sheets ---
  'home.sheetCheckIns': 'የዛሬ መግቢያዎች',
  'home.sheetCollected': 'ዛሬ የተሰበሰበ',
  'home.sheetExpiring': 'በቅርቡ የሚያልቅ',
  'home.sheetNew': 'የዛሬ አዲስ አባላት',
  'home.allowed': 'የተፈቀደ',
  'home.denied': 'የተከለከለ',
  'home.uniqueMembers': 'የተለያዩ አባላት',
  'home.guestPasses': 'የእንግዳ ፈቃዶች',
  'home.checkInsNote': 'እያንዳንዱ መግቢያ በቀጥታ ዝርዝሩ እና በ«ዛሬ» ገጽ ላይ ይታያል።',
  'home.emptyCheckIns': 'ዛሬ እስካሁን ምንም መግቢያ አልተመዘገበም።',
  'home.emptyPayments': 'ዛሬ እስካሁን ምንም ክፍያ አልተመዘገበም።',
  'home.emptyNew': 'ዛሬ አዲስ አባል አልተመዘገበም።',
  'home.emptyExpiring': 'በሚቀጥሉት 7 ቀናት የሚያልቅ አባልነት የለም።',
  'home.noPhone': 'ስልክ ቁጥር የለም',
  'home.paymentsSummary': 'ክፍያዎች',
  'home.membersSummary': 'አባላት',

  'common.delete': 'ሰርዝ',
  'common.close': 'ዝጋ',
  'pager.prev': 'ቀዳሚ ገጽ',
  'pager.next': 'ቀጣይ ገጽ',
  'pager.entries': 'ግቤቶች',
  'common.loading': 'በመጫን ላይ…',
  'common.error': 'የሆነ ችግር ተፈጥሯል',
  'common.days': 'ቀናት',
  'common.birr': 'ብር',
};

/**
 * Afaan Oromoo (Oromo) UI labels.
 *
 * Oromo is written in Qubee, a Latin alphabet — the existing Inter font covers
 * it, so unlike Amharic this needed no font work. The glottal stop is written
 * with U+02BC MODIFIER LETTER APOSTROPHE (ʼ) rather than a plain ASCII quote:
 * it is the correct character for the sound and it cannot terminate a string
 * literal, which removes a whole class of escaping mistakes across the table.
 *
 * COVERAGE IS DELIBERATELY PARTIAL. `t()` falls back per key, so the screens
 * translated here render in Oromo while the rest stays English. Still missing:
 * the feedback, audit and telegram sections, and the marketing pages (which
 * hardcode their English copy outside this file).
 *
 * TRANSLATION QUALITY: these strings have NOT been reviewed by a native
 * speaker — see the note in the PR/commit. Gemination and vowel length are
 * meaning-bearing in Oromo, so a review pass is required before this is
 * offered to real gyms.
 */
const om: Partial<Record<StringKey, string>> = {
  // app — 'app.name' is a brand name and stays English (Latin script already)

  // nav
  'nav.dashboard': 'Daashboordii',
  'nav.today': 'Harʼa',
  'nav.monitor': 'Toʼannoo',
  'nav.members': 'Miseensota',
  'nav.payments': 'Kaffaltiiwwan',
  'nav.settings': 'Qindaaʼina',
  'nav.logout': 'Baʼi',
  'nav.live': 'Kallattii',
  'nav.more': 'Dabalata',
  'nav.audit': 'Galmee hordoffii',
  'nav.billing': 'Kaffaltii',
  'nav.notifications': 'Beeksisawwan',
  'nav.guide': 'Qajeelfama jalqabaa',
  'nav.feedback': 'Yaada / Fooyyessa',

  // status
  'status.active': 'Sochoʼaa',
  'status.expiring': 'Dhumachaa',
  'status.grace': 'Yeroo dabalataa',
  'status.expired': 'Dhumate',
  'status.frozen': 'Dhaabbate',

  // common
  'pager.prev': 'Fuula duraa',
  'pager.next': 'Fuula itti aanu',
  'pager.entries': 'galmeewwan',
  'common.cancel': 'Dhiisi',
  'common.back': 'Duubatti',
  'common.save': 'Olkaaʼi',
  'common.delete': 'Haqi',
  'common.close': 'Cufi',
  'common.loading': 'Feʼaa jira…',
  'common.error': 'Rakkoon uumameera',
  'common.days': 'guyyoota',
  'common.birr': 'Birrii',

  // more / live
  'more.title': 'Dabalata',
  'more.appearance': 'Bifa',
  'more.theme.system': 'Sirna',
  'more.theme.light': 'Ifaa',
  'more.theme.dark': 'Dukkanaaʼaa',
  'more.exitHint': 'Baʼuuf ammas duubatti tuqi',
  'live.title': 'Taateewwan kallattii',
  'live.comingSoon': 'Tarreen taatee kallattii tarkaanfii itti aanu keessatti dhufa.',

  // home
  'home.morning': 'Akkam bulte',
  'home.afternoon': 'Akkam oolte',
  'home.evening': 'Akkam galte',
  'home.insideNow': 'Amma keessa jiru',
  'home.liveLabel': 'KALLATTII',
  'home.people': 'namoota',
  'home.person': 'nama',
  'home.quickActions': 'Gochaalee saffisaa',
  'home.actionEnroll': 'Galmeessi',
  'home.actionMembers': 'Miseensota',
  'home.actionPayments': 'Kaffaltii',
  'home.actionLive': 'Kallattii',
  'home.checkInsToday': 'Seensa',
  'home.collectedToday': 'Walitti qabame',
  'home.expiringSoon': 'Dhumachaa',
  'home.newToday': 'Harʼa haaraa',
  'home.needsAttention': 'Xiyyeeffannoo barbaada',
  'home.allGood': 'Harʼa wanti xiyyeeffannoo barbaadu hin jiru.',
  'home.viewAll': 'Hunda ilaali',
  'home.expiredAgo': 'dhumate',
  'home.retry': 'Irra deebiʼii yaali',
  'home.offline': 'Sarvarii bira gaʼuun hin dandaʼamne',
  'home.pullToRefresh': 'Haaromsuuf harkisi',
  'home.releaseToRefresh': 'Haaromsuuf gadhiisi',
  'home.refreshing': 'Haaromsaa jira…',
  'home.sheetCheckIns': 'Seensa harʼaa',
  'home.sheetCollected': 'Harʼa walitti qabame',
  'home.sheetExpiring': 'Dhiyootti kan dhumu',
  'home.sheetNew': 'Miseensota haaraa harʼaa',
  'home.allowed': 'Hayyamame',
  'home.denied': 'Dhorkame',
  'home.uniqueMembers': 'Miseensota adda addaa',
  'home.guestPasses': 'Eeyyama keessummaa',
  'home.checkInsNote': 'Seensi tokkoon tokkoon isaa tarree kallattii fi fuula Harʼa irratti mulʼata.',
  'home.emptyCheckIns': 'Harʼa hanga ammaatti seensi hin galmoofne.',
  'home.emptyPayments': 'Harʼa hanga ammaatti kaffaltiin hin galmoofne.',
  'home.emptyNew': 'Harʼa miseensi haaraa hin galmoofne.',
  'home.emptyExpiring': 'Guyyoota 7 dhufan keessatti miseensummaan dhumu hin jiru.',
  'home.noPhone': 'Lakkoofsi bilbilaa hin jiru',
  'home.paymentsSummary': 'kaffaltiiwwan',
  'home.membersSummary': 'miseensota',

  // auth
  'auth.login': 'Seeni',
  'auth.email': 'Imeelii',
  'auth.password': 'Jecha darbii',
  'auth.registerGym': 'Jimii kee galmeessi',
  'auth.gymName': 'Maqaa jimii',
  'auth.address': 'Teessoo',
  'auth.phone': 'Bilbila',
  'auth.ownerName': 'Maqaa kee',
  'auth.createAccount': 'Herrega uumi',
  'auth.haveAccount': 'Duraanuu herrega qabdaa? Seeni',
  'auth.confirmPassword': 'Jecha darbii mirkaneessi',
  'auth.agreeTerms': 'Dubbiseera, nan fudhadhas',
  'auth.termsLink': 'Haalawwan tajaajilaa',
  'auth.passwordMismatch': 'Jechi darbii wal hin simu',
  'auth.pendingTitle': 'Galmeen keessan nu gaʼeera!',
  'auth.pendingBody':
    'Hanga Bulchaan galmee keessan mirkaneessutti eegaa. Yeroo baayʼee guyyaa tokkoo gadi fudhata — jimiin keessan hin mirkanaaʼin dura seenuu hin dandaʼan.',
  'auth.pendingEmail': 'Karaa kanaan isin beeksifna',
  'auth.pendingStep1': 'Galmeen ergameera',
  'auth.pendingStep2': 'Mirkaneessi bulchaa adeemsa irra jira',
  'auth.pendingStep3': 'Seenii jimii kee qindeessi',
  'auth.backToLogin': 'Gara seensaatti deebiʼi',
  'auth.noAccount': 'Haaraa dhufte? Jimii kee galmeessi',

  // members
  'members.title': 'Miseensota',
  'members.search': 'Maqaa yookaan bilbila barbaadi…',
  'members.enroll': 'Miseensa galmeessi',
  'members.allStatuses': 'Haala hunda',
  'members.name': 'Maqaa',
  'members.plan': 'Karoora',
  'members.expires': 'Kan dhumu',
  'members.status': 'Haala',
  'members.daysLeft': 'guyyoota hafan',
  'members.daysOverdue': 'guyyoota darban',
  'members.renew': 'Haaromsi / kaffaltii galmeessi',
  'members.freeze': 'Dhaabi',
  'members.unfreeze': 'Itti fufi',

  // removing a member
  'members.remove': 'Haqi',
  'members.restore': 'Deebisi',
  'members.archived': 'Kuusaa keessa',
  'members.archivedBanner':
    'Miseensi kun kuusaa keessa galeera — tarree keessa hin jiru, balbala irratti hin beekamu, yaadachiisnis hin ergamuuf.',
  'remove.title': 'Miseensa haqi',
  'remove.restoreTitle': 'Miseensa deebisi',
  'remove.archiveWhat':
    'Kuusaa keessa galchuun tarree miseensotaa, moonitara balbalaa fi yaadachiisa keessaa isaan baasa. Seenaan kaffaltii isaanii ni turaa, yeroo barbaaddetti deebisuu dandeessa.',
  'remove.hasPayments':
    'Miseensi kun kaffaltii galmaaʼe qaba, kanaafuu dhaabbataan haquun hin dandaʼamu — galii darbe waan jijjiiruuf. Kuusaa keessa galchuu qofatu dandaʼama.',
  'remove.noPayments':
    'Miseensi kun kaffaltii galmaaʼe hin qabu, kanaafuu dhaabbataan haquunis ni dandaʼama. Kun deebiʼuu hin dandaʼu.',
  'remove.restoreWhat': 'Gara tarree miseensotaatti deebiʼu, haalli isaaniis guyyaa xumuraa irraa irra deebiʼee shallagama.',
  'remove.archive': 'Kuusaa keessa galchi',
  'remove.delete': 'Dhaabbataan haqi',
  'members.telegram': 'Telegram',
  'members.linked': 'Walqabate',
  'members.notLinked': 'Hin walqabanne',
  'members.subscriptions': 'Seenaa miseensummaa',
  'members.paymentHistory': 'Kaffaltiiwwan',
  'members.checkInHistory': 'Seensa dhiyoo',
  'members.fullName': 'Maqaa guutuu',
  'members.sex': 'Saala',
  'members.male': 'Dhiira',
  'members.female': 'Dubartii',

  // enroll
  'enroll.title': 'Miseensa haaraa galmeessi',
  'enroll.details': 'Odeeffannoo miseensaa',
  'enroll.captures': 'Suuraa fuulaa',
  'enroll.captureHint': 'Suuraa 3–5 kaasi: kallattiin ilaali, sana booda xinnoo bitaa fi mirga.',
  'enroll.capture': 'Kaasi',
  'enroll.retake': 'Haqi',
  'enroll.needMore': 'Yoo xinnaate suuraa fuulaa 3 kaasi',
  'enroll.captureAtLeast': 'Suuraan barbaachisu:',
  'enroll.noFace': 'Fuulli hin argamne — gara kaameraatti dhiyaadhu',
  'enroll.lowQuality': 'Qulqullinni gadi buʼaadha — ifa fooyyessi yookaan dhiyaadhu',
  'enroll.tooSmall': 'Fuulli baayʼee xiqqaadha — dhiyaadhu',
  'enroll.good': 'Suuraan gaariidha',
  'enroll.plan': 'Karoora',
  'enroll.payment': 'Kaffaltii jalqabaa',
  'enroll.amount': 'Hamma (Birrii)',
  'enroll.method': 'Mala',
  'enroll.note': 'Yaadannoo',
  'enroll.submit': 'Miseensa galmeessi',
  'enroll.noCamera':
    'Jimii kanaaf kaameraan cufameera — miseensi suuraa fuulaa malee galmaaʼa. Booda Qindaaʼina keessatti kaamera banuu dandeessa.',

  // previous members
  'nav.addPrevious': 'Miseensa duraanii galchi',
  'prev.title': 'Miseensa duraanii galchi',
  'prev.intro':
    'Miseensota sirni kun hin ijaaramin dura leenjii turaniif. Guyyaawwan akkuma galmee waraqaa keessatti barreeffamanitti galchi — sirnichi guyyaa xumuraa fi haala miseensichaa ofumaan shallaga.',
  'prev.dates': 'Guyyaawwan galmee waraqaa irraa',
  'prev.calendar': 'Guyyaawwan waraqaa irratti jiran',
  'prev.calendarEthiopian': 'Itoophiyaa (A.L.I)',
  'prev.calendarGregorian': 'Giriigooriyaan (A.L.A)',
  'prev.joinedAt': 'Guyyaa jalqaba itti galmaaʼe',
  'prev.startsAt': 'Guyyaa miseensummaan ammaa itti jalqabe',
  'prev.startsAtHint': 'Guyyaa kaffaltii isaanii dhumaa. Yoo hin haaromsin guyyaa galmeetiin wal qixa.',
  'prev.expiresAt': 'Guyyaa itti xumuramu',
  'prev.customExpiry': 'Guyyaa xumuraa ofuma kootiin nan galcha',
  'prev.expiryFromPlan': 'Xumura = guyyaa jalqabaa + turtii karoorichaa.',
  'prev.preview': 'Akkamitti akka olkaaʼamu',
  'prev.previewEmpty': 'Buʼaa arguuf karoora fi guyyaawwan filadhu.',
  'prev.daysLeft': 'guyyoota hafan',
  'prev.daysOverdue': 'guyyoota darban',
  'prev.expiredHint': 'Miseensummaan kun xumurameera; hanga haaromsanitti balbala irratti ni dhorkamu.',
  'prev.payment': 'Kaffaltii darbe',
  'prev.recordPayment': 'Kaffaltii isaan durumaan kaffalan galmeessi',
  'prev.paymentHint': 'Guyyaa jalqabaa olii waliin olkaaʼama, kanaafuu kaffaltiin moofaan galii jiʼa kanaa keessatti hin mulʼatu.',
  'prev.captures': 'Suuraa fuulaa (filannoo)',
  'prev.capturesHint': 'Yoo miseensichi amma as jiru qofa. Yoo hin jirre duwwaa dhiisi; yeroo itti aanu dhufanitti kaasi.',
  'prev.submit': 'Miseensa duraanii galchi',
  'prev.addedThisSession': 'galfamaniiru — unkichi kan itti aanuuf qophiidha',
  'prev.errRequired': 'Maqaa, karoora fi guyyaawwan lamaan guuti.',
  'prev.errJoinedFuture': 'Guyyaan galmee gara fuulduraatti argama — qindaaʼina lakkoofsa guyyaa olii mirkaneessi.',
  'prev.errStartBeforeJoin': 'Miseensummaan miseensichi utuu hin galmaaʼin dura jalqabuu hin dandaʼu.',
  'prev.errExpiryMissing': 'Karoora filadhu, yookaan guyyaa xumuraa ofumaa galchi.',
  'prev.errExpiryBeforeStart': 'Guyyaan xumuraa guyyaa jalqabaa dura taʼuu hin dandaʼu.',
  'prev.errCaptures': 'Yoo xiqqaate suuraa fuulaa 3 kaasi, yookaan hunda haqxee booda raawwadhu.',

  // edit an existing member
  'edit.action': 'Gulaali',
  'edit.title': 'Miseensa gulaali',
  'edit.details': 'Odeeffannoo miseensaa',
  'edit.membership': 'Miseensummaa ammaa',
  'edit.calendar': 'Guyyaawwan kan galchitu',
  'edit.noSubscription': 'Miseensi kun ammatti yeroo miseensummaa hin qabu — kennuuf «Haaromsi» fayyadami.',
  'edit.ownerOnly': 'Karoora yookaan guyyaawwan jijjiiruu kan dandaʼu abbaa qabeenyaa qofa.',
  'edit.planInactive': 'kan dhaabate',
  'edit.usePlanExpiry': 'Guyyaa xumuraa karooraa fayyadami:',
  'edit.shiftForward': 'Kun guyyaa xumuraa gara fuulduraatti kan sochoosu',
  'edit.shiftBack': 'Kun guyyaa xumuraa gara duubaatti kan sochoosu',
  'edit.shiftHint': 'kaffaltiin hin galmaaʼu',
  'edit.errName': 'Maqaa guutuu miseensaa galchi.',
  'edit.errJoinedMissing': 'Guyyaa galmeessaa guuti.',
  'edit.errDatesMissing': 'Karoora filadhu, guyyaawwan miseensummaa lamaanuu guuti.',

  'date.day': 'Guyyaa',
  'date.month': 'Jiʼa',
  'date.year': 'Waggaa',
  'date.gregorianIs': 'Giriigooriyaan:',
  'date.ethiopianIs': 'Itoophiyaa:',
  'date.ethiopianHint': 'Fakkeenyaaf: 12 Nehase 2018',
  'date.invalid': 'Lakkoofsa guyyaa Itoophiyaa keessatti guyyaan akkasii hin jiru — guyyaa mirkaneessi.',

  // payments
  'payments.title': 'Kaffaltiiwwan',
  'payments.member': 'Miseensa',
  'payments.amount': 'Hamma',
  'payments.method': 'Mala',
  'payments.markedBy': 'Kan galmeesse',
  'payments.date': 'Guyyaa',
  'payments.from': 'Irraa',
  'payments.to': 'Hanga',
  'payments.allMethods': 'Mala hunda',

  // today
  'today.title': 'Harʼa ilaalcha gabaabaa',
  'today.subtitle': 'Harʼa maaltu taʼe, eenyutu xiyyeeffannoo barbaada',
  'today.checkIns': 'Seensa harʼaa',
  'today.denied': 'dhorkame',
  'today.uniqueMembers': 'miseensota adda addaa',
  'today.inside': 'Amma keessa jiru',
  'today.paymentsTotal': 'Harʼa walitti qabame',
  'today.newMembers': 'Miseensota haaraa',
  'today.guestPasses': 'Eeyyama keessummaa',
  'today.newMembersTitle': 'Miseensota haaraa harʼaa',
  'today.noNewMembers': 'Harʼa miseensi haaraa hin galmoofne.',
  'today.expiringTitle': 'Guyyoota 7 dhufan keessatti kan dhumu',
  'today.noExpiring': 'Guyyoota 7 dhufan keessatti kan dhumu hin jiru. 🎉',
  'today.expiredTitle': 'Guyyoota 7 darban keessatti kan dhumate',
  'today.noExpired': 'Guyyoota 7 darban keessatti kan dhumate hin jiru.',
  'today.expiredHint':
    'Utuu hin baditti isaan bilbili — profaayilii isaanii irraa tuqaa tokkoon ni haaromsita.',
  'today.paymentsTitle': 'Kaffaltii harʼaa',
  'today.noPayments': 'Harʼa kaffaltiin hin galmoofne.',
  'today.expiresToday': 'harʼa!',
  'today.tomorrow': 'boru',
  'today.daysLeft': 'guyyoota hafan',
  'today.daysAgo': 'guyyoota dura',
  'today.yesterday': 'kaleessa',
  'today.plan': 'Karoora',
  'today.joined': 'galmaaʼe',

  // phone
  'phone.search': 'Biyya barbaadi',
  'phone.noResults': 'Biyyi hin argamne',

  // monitor
  'monitor.occupancy': 'Amma keessa jiru',
  'monitor.eventFeed': 'Taateewwan kallattii',
  'monitor.allowEntry': 'Seensa hayyami',
  'monitor.approve': 'Mirkaneessi',
  'monitor.awaitingApproval': 'mirkaneessa eegaa jira',
  'monitor.checkOut': 'Baʼi',
  'monitor.addGuest': 'Keessummaa dabali',
  'monitor.guestAdded': 'Eeyyamni keessummaa uumameera',
  'monitor.cameraError': 'Kaameraan hin argamne — hayyama ilaali',
  'monitor.loadingModels': 'Moodeelota beekumsa fuulaa feʼaa jira…',
  'monitor.unknown': 'Hin beekamne',
  'monitor.noneInside': 'Amma namni seene hin jiru',

  // camera
  'camera.title': 'Madda kaameraa',
  'camera.button': 'Kaameraa',
  'camera.flip': 'Kaameraa jijjiiri',
  'camera.webcam': 'Kaameraa meeshaa kanaa',
  'camera.webcamHint': 'Kaameraa keessaa yookaan USB karaa biraawuzariitiin fayyadama.',
  'camera.ip': 'Bilbila / kaameraa IP netwoorkii irratti',
  'camera.ipHint':
    'fkn. appii Android bilisaa "IP Webcam": banii → Start server → http://<ip-bilbilaa>:8080/video asitti galchi. Bilbilii fi kompiitarri kun Wi-Fi tokko irra jiraachuu qabu.',
  'camera.test': 'Ergaa yaali',
  'camera.ipError':
    'Ergaan hin argamne — URL, Wi-Fi, akkasumas sarvariin appii kaameraa hojjechuu isaa mirkaneessi.',
  'camera.permissionDenied':
    'Hayyamni kaameraa dhorkameera. Qindaaʼina Android → Appiiwwan → Snowfall Gym → Hayyamoota keessatti hayyami.',
  'camera.modelsFailed': 'Moodeelota beekumsa fuulaa feʼuun hin dandaʼamne. Irra deebiʼuuf tuqi.',

  // guests
  'guests.validity': 'Eeyyamni kan hojjetu',
  'guests.today': 'Harʼa qofa',
  'guests.captureHint':
    'Kaameraan balbala irratti akka isa beeku suuraa fuula keessummaa yeroo tokko kaasi.',
  'guests.create': 'Eeyyama keessummaa uumi',

  // dashboard
  'dashboard.title': 'Daashboordii',
  'dashboard.checkInsToday': 'Seensa harʼaa',
  'dashboard.occupancy': 'Amma keessa jiru',
  'dashboard.revenue': 'Galii jiʼa kanaa',
  'dashboard.expiringSoon': 'Guyyoota 7 keessatti kan dhumu',
  'dashboard.peakHours': 'Saʼaatii hedduu (guyyoota 14 darban)',

  // settings
  'settings.title': 'Qindaaʼina',
  'settings.gym': 'Profaayilii jimii',
  'settings.rules': 'Seerota seensaa fi jireenya miseensummaa',
  'settings.gracePeriod': 'Yeroo dabalataa (guyyoota)',
  'settings.autoCheckout': 'Ofumaan baʼuu (saʼaatii booda)',
  'settings.reminderDays': 'Yaadachiisa dhumaatii (guyyoota dura)',
  'settings.nudgeDays': 'Yaadachiisa hafuu (guyyoota booda)',
  'settings.threshold': 'Sadarkaa walsimannaa fuulaa',
  'settings.closing': 'Yeroo cufaatii',
  'settings.entryMode': 'Haala seensaa',
  'settings.entryAuto': 'Ofumaan — miseensonni hayyamaman battalumatti seenu',
  'settings.entryManual': 'Harkaan — hojjettoonni seensa hunda mirkaneessu',
  'settings.entryModeHint':
    'Haala harkaa: miseensonni beekaman hanga hojjetaan Mirkaneessi tuqutti eegu (keelloo). Dhorkaan haala lamaan keessattuu wal fakkaata.',
  'settings.camera': 'Toʼannoo kaameraa',
  'settings.cameraOn': 'Banaa — seensa beekumsa fuulaatiin',
  'settings.cameraOff': 'Cufaa — jimiin kun kaameraa hin qabu',
  'settings.cameraHint':
    'Yoo jimiin kun kaameraa hin qabne cufi: miseensonni suuraa fuulaa malee galmaaʼu, toʼannoonis maqaa jimii agarsiisa.',
  'settings.botToken': 'Tokenii boot Telegram',
  'settings.plans': 'Karoorota miseensummaa',
  'settings.addPlan': 'Karoora dabali',
  'settings.staff': 'Herrega hojjettootaa',
  'settings.addStaff': 'Hojjetaa dabali',
  'settings.save': 'Olkaaʼi',
  'settings.language': 'Afaan',
  'settings.languageHint':
    'Meeshaa kana irratti qofa baafata fi maqaawwan jijjiira — maqaan miseensotaa fi wanti ati galchite hundi akkuma jirutti hafa.',
  'settings.appearanceHint':
    'Meeshaa kana irratti qofa hojjeta. “Sirna” qindaaʼina ifaa/dukkanaaʼaa kompiitara keetii hordofa.',

  // notifications
  'notifications.title': 'Beeksisawwan',
  'notifications.member': 'Miseensa',
  'notifications.type': 'Gosa',
  'notifications.status': 'Haala',
  'notifications.message': 'Ergaa',
  'notifications.date': 'Guyyaa',
  'notifications.allTypes': 'Gosa hunda',
  'notifications.allStatuses': 'Haala hunda',
  'notifications.sent': 'Ergameera',
  'notifications.failed': 'Hin milkoofne',
  'notifications.skipped': 'Chaatiin hin walqabanne',
  'notifications.skippedHint':
    'Miseensi Telegram hin walqabsiifne — profaayilii isaanii banii linkii uumi.',
};

export type Locale = 'en' | 'am' | 'om';

/**
 * Resolved lazily rather than at module load: this module is imported by
 * almost every component, so its top level runs before main.tsx has awaited
 * storage.hydrate(). The first `t()` call happens during render, by which
 * point the store is warm.
 */
let locale: Locale | null = null;

/**
 * Every locale's table, keyed by code. Adding a language is now one entry here
 * plus one option in the Settings picker — neither `t()` nor `getLocale()`
 * grows a branch per language the way the hardcoded `=== 'am'` checks did.
 */
const TABLES: Record<Locale, Partial<Record<StringKey, string>>> = { en, am, om };

/** Source of truth for "which codes exist", derived from the tables above. */
export const LOCALES = Object.keys(TABLES) as Locale[];

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function getLocale(): Locale {
  if (locale === null) {
    // Validate rather than compare: a stored code from a build that knew a
    // language this one does not must fall back, not render as undefined.
    const stored = storage.get('locale');
    locale = isLocale(stored) ? stored : 'en';
  }
  return locale;
}

/** Persists per device. Callers must re-render (the Settings page reloads). */
export function setLocale(l: Locale): void {
  locale = l;
  storage.set('locale', l);
}

export function t(key: StringKey): string {
  // Per-key fallback, not per-language: a partial translation renders its own
  // strings and quietly uses English for the rest, so a language can ship
  // incomplete without leaving blanks in the UI.
  return TABLES[getLocale()][key] ?? en[key];
}
