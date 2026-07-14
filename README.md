# Gym Management System

Multi-tenant B2B gym management for Ethiopian gyms: browser-based face-recognition
entrance monitor, automatic entry rules, occupancy tracking, manual payment marking
(cash / Telebirr), and a Telegram bot for member communication.

**Stack:** React 18 + Vite + Tailwind + TanStack Query · face-api.js (in-browser) ·
Node.js + Express (MVC) · PostgreSQL + Knex · Socket.io · JWT auth · grammY · node-cron

## Monorepo layout

```
├── client/                      # React app (Vite)
│   ├── public/models/           # face-api.js model weights (downloaded, not in git)
│   └── src/
│       ├── api/                 # HTTP client + endpoint wrappers (TanStack Query)
│       ├── components/
│       │   ├── ui/              # shared primitives (badges, modals, tables)
│       │   ├── monitor/         # webcam overlay, event feed, occupancy widgets
│       │   └── members/         # enroll flow, face capture, renew modal
│       ├── pages/               # route-level pages (Login, Monitor, Members, ...)
│       ├── hooks/               # useSocket, useFaceApi, useAuth, ...
│       ├── lib/                 # face matching, socket client, utils
│       └── i18n/                # all user-visible strings (en first, am later)
│
└── server/                      # Express API (MVC)
    ├── knexfile.ts
    ├── .env.example
    ├── src/
    │   ├── config/              # env parsing, constants
    │   ├── db/
    │   │   ├── migrations/      # schema (raw SQL via Knex)
    │   │   └── seeds/           # demo gym seed
    │   ├── routes/              # /api/v1 routers
    │   ├── controllers/         # req/res handling, validation
    │   ├── services/            # business logic (check-in decision engine, renewal, ...)
    │   ├── models/              # query layer (Knex, gym_id-scoped)
    │   ├── middleware/          # auth, tenant scoping, error handler
    │   ├── sockets/             # Socket.io per-gym namespaces
    │   ├── jobs/                # node-cron: status recompute, auto-checkout, notifications
    │   ├── telegram/            # grammY bot (Phase 2) + MTProto stub (Phase 3)
    │   └── utils/
    ├── tests/                   # vitest unit tests (decision engine, renewal math)
    └── uploads/photos/          # member photos (gitignored)
```

## Setup

Requirements: Node.js ≥ 20, PostgreSQL ≥ 14.

```bash
# 1. install workspace dependencies
npm install

# 2. create the database
createdb gym_management        # or: CREATE DATABASE gym_management; in psql

# 3. configure the server
cp server/.env.example server/.env   # then edit DATABASE_URL / JWT secrets

# 4. run migrations + demo seed
npm run migrate
npm run seed

# 5. run dev servers (once app code exists)
npm run dev:server   # http://localhost:4000
npm run dev:client   # http://localhost:5173
```

Demo logins after seeding: `owner@demogym.et` / `staff@demogym.et`, password `password123`.
Seeded face descriptors are random placeholders — enroll real faces through the UI.

## Using a phone as the entrance camera

Any HTTP camera on the gym's Wi-Fi works as an alternative to the webcam:

1. On an Android phone, install the free **IP Webcam** app (Pavel Khlebovich) →
   scroll down → **Start server**. The phone shows a URL like `http://192.168.1.50:8080`.
2. In the app UI: **Monitor page → Camera button → "Phone / IP camera"** and enter
   `http://192.168.1.50:8080/video` (the MJPEG endpoint). **Test stream**, save.
3. The choice is per device (stored in the browser), so the front-desk PC can use
   the phone at the door while enrollment uses the built-in webcam elsewhere.

The stream is relayed through `GET /api/v1/camera-proxy` (JWT-checked, restricted
to private-network URLs) so face-api.js can read pixels without CORS tainting.
iPhone users can use any app that serves MJPEG over HTTP the same way.

## Key design decisions

- **Multi-tenancy:** every tenant-scoped table carries `gym_id`; all queries are
  scoped by the authenticated user's gym. `subscriptions` also carries `gym_id`
  (denormalized) so expiry crons stay single-table; `face_descriptors` is a pure
  child of `members`.
- **Face recognition is fully client-side** (face-api.js on the monitor page).
  The server only stores/serves 128-d descriptors and applies the decision engine.
- **Payments are immutable:** a DB trigger rejects `UPDATE`/`DELETE` on `payments`.
- **Enums as CHECK constraints** (not Postgres enums) so they're cheap to extend.
- **Gym settings** live in `gyms.settings` JSONB: `grace_period_days`,
  `auto_checkout_hours`, `expiry_reminder_days`, `absence_nudge_days`,
  `match_threshold`, `closing_time`.

## Build phases

1. **Phase 1 — done:** migrations · auth · gym/plan/member CRUD · enrollment with
   face capture · live monitor (recognition, decision engine, event feed, occupancy) ·
   payment marking with expiry rollover · seed script.
2. **Phase 2 — done:** Telegram bot via grammY (member linking with one-time
   t.me deep links + QR, 09:00 expiry reminders, absence nudges with rotating
   EN+AM templates, /traffic, unknown-face admin alerts, daily closing summary)
   + notification log UI. Enter a bot token from @BotFather in Settings to
   activate; every send attempt is logged in `notifications`.
3. **Phase 3 — done:** guest day passes (face capture on the monitor, BLUE
   circle at the door, counted in occupancy, descriptors auto-purged after
   expiry, optional conversion link to a member), owner-only audit log UI,
   and the MTProto fallback stub (`server/src/telegram/mtproto.ts`, interface
   only by design). Freeze/unfreeze, grace handling, auto-checkout, and the
   dashboard chart shipped in earlier phases.
