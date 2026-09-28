# ClinicDesk — STATUS

**Display name:** ClinicDesk  
**Slug:** clinic-followup-desk  
**Project ID:** proj_clinic_followup_001  
**Updated:** 2026-09-28T16:30:00+05:00 (Asia/Karachi)  
**Version:** 0.1.1  
**Status:** READY_TO_PUBLISH

## Dual-clear (improve → v0.1.1)

| Gate | Result |
|------|--------|
| QA IMPROVE 20260928 | **PASS** (`QA-REPORT-IMPROVE-20260928.md`) |
| Security IMPROVE 20260928 | **PASS_WITH_NOTES** (`SECURITY-REPORT-IMPROVE-20260928.md`) |
| `npm test` | **46/46** |
| `npm run build` | success |

Local release commit prepared. GitHub push/tag **blocked** until `GH_TOKEN` is valid.

## Phase

- [x] PRD + ACTIVE/STAGED briefs
- [x] Scaffold Next.js 15 + SQLite
- [x] Auth, appointments, queues, board, day, notes, export
- [x] Seed + GUIDE-roman-urdu.md
- [x] Post-ship IMPROVE 20260928: empty-state checklist, auth hygiene (Raabta v0.3 parity), appointments search + doctor chips
- [x] Dual-clear QA + Security improve reports
- [x] Version bumped to 0.1.1; CHANGELOG cut; READY_TO_PUBLISH

## Demo logins

- owner@clinic.local / owner123
- desk@clinic.local / desk123

(Seed bypasses register password floor; new register/Team create require ≥10 chars.)

## Commands

```bash
npm install && npm run seed && npm test && npm run build
```

## Notes

Shared desk authz: all staff see all appointments. Owner-only: Team + CSV export. Not an EMR. Optional `doctor_name` on appointments. Status board at `/board`. Login/register soft rate limit ≤10 fails / 15 min → 429. DB file `chmod 0600` when supported.

## Improve round (2026-09-28)

- Empty-state checklist (localStorage dismiss by user id)
- Password min 10; rate limit; DB chmod
- `/appointments` `q` + `doctor` (+ optional `status`) filters
