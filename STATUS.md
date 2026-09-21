# ClinicDesk — STATUS

**Display name:** ClinicDesk  
**Slug:** clinic-followup-desk  
**Project ID:** proj_clinic_followup_001  
**Updated:** 2026-09-21T18:13:00+05:00 (Asia/Karachi)  
**Status:** READY_FOR_QA

## Phase

- [x] PRD + ACTIVE/STAGED briefs
- [x] Scaffold Next.js 15 + SQLite
- [x] Auth, appointments, queues, board, day, notes, export
- [x] Seed + GUIDE-roman-urdu.md
- [x] `npm test` — **25/25** passed
- [x] `npm run build` — success

## Demo logins

- owner@clinic.local / owner123
- desk@clinic.local / desk123

## Commands

```bash
npm install && npm run seed && npm test && npm run build
```

## Notes

Shared desk authz: all staff see all appointments. Owner-only: Team + CSV export. Not an EMR. Optional `doctor_name` on appointments. Status board at `/board`.

## QA P1 fixes (2026-09-21T18:18:59+05:00)

- P1-1: GET `/api/users` owner-only
- P1-2: POST `/api/users` cannot create owners
- Tests: **31/31**; build success — ready for QA re-run
