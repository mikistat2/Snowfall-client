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
  'members.daysLeft': 'days left',
  'members.daysOverdue': 'days overdue',
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
  'settings.language': 'Language',
  'settings.languageHint':
    'Changes menus and labels on this device only — member names and everything you typed stay exactly as entered.',

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

  // guests
  'guests.validity': 'ፈቃዱ የሚቆይበት',
  'guests.today': 'ዛሬ ብቻ',
  'guests.captureHint': 'ካሜራው በበሩ ላይ እንዲያውቀው የእንግዳውን ፊት አንድ ጊዜ ያንሱ።',
  'guests.create': 'የእንግዳ ፈቃድ ፍጠር',

  // audit log
  'nav.audit': 'የክንውን መዝገብ',
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
  'common.save': 'አስቀምጥ',
  'common.delete': 'ሰርዝ',
  'common.loading': 'በመጫን ላይ…',
  'common.error': 'የሆነ ችግር ተፈጥሯል',
  'common.days': 'ቀናት',
  'common.birr': 'ብር',
};

export type Locale = 'en' | 'am';

const LOCALE_KEY = 'locale';

function loadLocale(): Locale {
  try {
    return localStorage.getItem(LOCALE_KEY) === 'am' ? 'am' : 'en';
  } catch {
    return 'en';
  }
}

let locale: Locale = loadLocale();

export function getLocale(): Locale {
  return locale;
}

/** Persists per device. Callers must re-render (the Settings page reloads). */
export function setLocale(l: Locale): void {
  locale = l;
  try {
    localStorage.setItem(LOCALE_KEY, l);
  } catch {
    /* private-mode browsers: language just won't persist */
  }
}

export function t(key: StringKey): string {
  if (locale === 'am' && am[key]) return am[key] as string;
  return en[key];
}
