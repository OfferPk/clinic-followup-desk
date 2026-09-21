# ClinicDesk (Clinic Follow-Up Desk)

WhatsApp-first **appointment confirm / remind / no-show desk** for Pakistani SMB clinics and international WhatsApp-first small practices (dental, aesthetic, physio, diagnostic labs).

**Not an EMR / HMS.** Appointment reason is a short string only — no medical charts, prescriptions, insurance, or payments.

**Slug:** `clinic-followup-desk` · **Project ID:** `proj_clinic_followup_001`

## Stack

Next.js 15 · TypeScript · Tailwind · better-sqlite3 · bcryptjs sessions · vitest

## Quick start

```bash
cd /workspace/factory/projects/clinic-followup-desk
cp .env.example .env   # optional
npm install
npm run seed
npm run dev
```

Open http://localhost:3000

## Demo logins

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@clinic.local | owner123 |
| Receptionist | desk@clinic.local | desk123 |

## Docs

- **[GUIDE-roman-urdu.md](./GUIDE-roman-urdu.md)** — Istemaal guide (Roman Urdu)
- [docs/PRODUCT.md](./docs/PRODUCT.md) — Product overview
- [STATUS.md](./STATUS.md) — Build / test status
- PRD: `/workspace/factory/research/PRD-clinic-followup-desk.md`

## Features (MVP)

- Auth (owner + receptionist), shared desk board
- Appointments CRUD + optional doctor_name
- Status board (requested / confirmed / completed / no_show / cancelled)
- Queues: confirm today, remind 24h, no-show
- Day list, activity notes, one-tap `wa.me` with prefilled text
- Dashboard counts, owner CSV export

## Out of scope

EMR, Meta/WABA API, Google Calendar sync, AI booking, payments, multi-clinic billing.

## Scripts

```bash
npm run seed    # reset demo DB
npm test        # vitest
npm run build   # production build
```
