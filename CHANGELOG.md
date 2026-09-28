# Changelog — ClinicDesk

All notable changes in this project.

Format: [Keep a Changelog](https://keepachangelog.com/). Versioning: [SemVer](https://semver.org/).

## [Unreleased]

### Added

- **Status board: hide closed by default** — `/board` shows `requested | confirmed | no_show` only; `?closed=1` (or `show=all`) reveals completed + cancelled via **Show closed** toggle. Empty clinic still shows OnboardingChecklist when total appointments === 0.
- **Day list doctor filter chips** — `/day?date=YYYY-MM-DD&doctor=…` (optional, case-insensitive on `doctor_name`); shared `DoctorChips` with appointments list; clear doctor keeps date.
- **No-show rebook WhatsApp chip** — `rebookMessage(patient_name, slotLabel)` (EN + Roman Urdu); **WA Rebook** on no-show queue + appointment detail when status is `no_show`; still manual `wa.me`, no WABA.

## [0.1.1] — 2026-09-28

### Added

- **Empty-state onboarding checklist** — dismissible 3-step (book appointment → Confirm today → invite receptionist) on Dashboard / Board / Appointments when total is zero; dismiss persisted in `localStorage` keyed by user id; Team step owner-only.
- **Appointments search + doctor filters** — `/appointments?q=&doctor=&status=`; `listAppointments` parameterized LIKE / case-insensitive doctor match; search input + doctor chip row + clear; WhatsApp + status badge unchanged on rows.

### Security

- Soft in-memory login/register rate limit (≤10 failures / 15 min per IP, and per-email for login) → **429** with `Retry-After` (single-node only).
- Password floor **10** on register + Team create (API + UI `minLength`).
- SQLite DB `chmod 0600` after open/create when the filesystem allows (skips vitest `test-*` temp DBs).

### Changed

- Docs: README / DEPLOYMENT / GUIDE-roman-urdu note search, checklist, password min, rate limit, DB mode.

## [0.1.0] — 2026-09-21

### Added

- Initial MVP: Next.js App Router + TypeScript + Tailwind + SQLite (`better-sqlite3`).
- Auth: register (first user = owner), login, logout; bcrypt passwords; httpOnly session cookies.
- Owner Team page / API to create receptionist users only.
- Appointments CRUD with optional `doctor_name`; status board; day list; queues (confirm / remind / no-show).
- WhatsApp `wa.me` buttons; append-only notes; dashboard counts; owner CSV export.
- Seed script + GUIDE-roman-urdu; product docs.
