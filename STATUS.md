# ClinicDesk — STATUS

**Display name:** ClinicDesk  
**Slug:** clinic-followup-desk  
**Project ID:** proj_clinic_followup_001  
**Updated:** 2026-09-28T17:20:00+05:00 (Asia/Karachi)  
**Version:** 0.1.1 (base) + Unreleased improve pack 1707  
**Status:** READY_FOR_QA

## Current gate

| Item | Value |
|------|-------|
| Base release | **v0.1.1** READY_TO_PUBLISH (`c778ca5`) — do not rewrite |
| Improve pack | `IMPROVE-clinic-followup-desk-20260928-1707.md` |
| This status | **READY_FOR_QA** (Unreleased on top of v0.1.1) |
| Prior dual-clear | QA PASS + Security PASS_WITH_NOTES (v0.1.1) |

## Phase

- [x] PRD + ACTIVE/STAGED briefs
- [x] Scaffold Next.js 15 + SQLite
- [x] Auth, appointments, queues, board, day, notes, export
- [x] Seed + GUIDE-roman-urdu.md
- [x] Post-ship IMPROVE 1618 → v0.1.1 (empty-state, auth hygiene, appointments search)
- [x] Dual-clear QA + Security improve reports (v0.1.1)
- [x] Improve pack 1707: board hide-closed, day doctor chips, no-show rebook WA
- [ ] QA gate on Unreleased (improve pack 1707)
- [ ] Version bump / READY_TO_PUBLISH after dual-clear

## Demo logins

- owner@clinic.local / owner123
- desk@clinic.local / desk123

(Seed bypasses register password floor; new register/Team create require ≥10 chars.)

## Commands

```bash
npm install && npm run seed && npm test && npm run build
```

## Notes

Shared desk authz: all staff see all appointments. Owner-only: Team + CSV export. Not an EMR. Optional `doctor_name` on appointments. Status board at `/board` defaults to active columns; `?closed=1` shows completed/cancelled. Day list supports `?doctor=`. Login/register soft rate limit ≤10 fails / 15 min → 429. DB file `chmod 0600` when supported.

## Improve pack 1707 (Unreleased)

1. Board hide completed/cancelled by default (`?closed=1` / Show closed)
2. Day list doctor filter chips (`/day?date=&doctor=`)
3. No-show rebook WhatsApp chip (`rebookMessage` + WA Rebook)

## HANDOFF for QA

- Smoke: `/board` → 3 active columns; click **Show closed** → 5 columns; empty clinic still shows checklist.
- Smoke: `/day` → doctor chips filter; Clear/All keeps date.
- Smoke: `/queues/no-show` + detail (status no_show) → **WA Rebook** opens `wa.me` with rebook prefill.
- Regression: appointments `q`+doctor, onboarding checklist, auth hygiene unchanged.
- Do **not** push; leave Unreleased until dual-clear.
