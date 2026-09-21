# QA Report — Clinic Follow-Up Desk MVP

**Date:** 2026-09-21 18:18 PKT (Asia/Karachi)  
**Project:** `/workspace/factory/projects/clinic-followup-desk`  
**PRD:** `/workspace/factory/research/PRD-clinic-followup-desk.md`  
**Brief:** `/workspace/factory/inbox/BUILD-clinic-followup-desk.md`  
**QA:** Independent pass (report only — product source not modified)  
**Overall:** **FAIL**

---

## Summary

Automated tests and production build succeed. Core clinic flows smoke OK (owner/receptionist login, appointments, queues, notes, WhatsApp links, owner-only export/team UI, PK phone normalize, XSS escaped in HTML).

**Ship blockers:** two **High** authz defects on `/api/users` (receptionist directory leak; owner can mint more owners). Three **Medium** validation/CSV issues. Fix Highs before READY; Mediums before GitHub publish.

| Severity | Count |
|----------|------:|
| Critical | 0 |
| High     | 2 |
| Medium   | 3 |
| Low      | 0 |

---

## Environment

| Item | Detail |
|------|--------|
| Runtime | `COOKIE_SECURE=false` production server on `:3456` |
| Creds | `owner@clinic.local` / `owner123` · `desk@clinic.local` / `desk123` |
| Methods | `npm test`, `npm run build`, curl + session cookies, static review of `src/app/api/users`, appointments, `csvEscape` |

---

## Automation

| Check | Result |
|-------|--------|
| `npm test` | **25/25** passed |
| `npm run build` | **success** (Next.js 15.5.25) |

---

## Smoke checklist

| Check | Result |
|-------|--------|
| Owner login | PASS |
| Receptionist login | PASS |
| Invalid password → 401 | PASS |
| Appointments create + PK phone normalize (`0300…` → `92300…`) | PASS |
| Queues / dashboard | PASS |
| Notes append + read | PASS |
| `wa.me` links | PASS |
| Owner CSV export 200; receptionist 403 | PASS |
| Team UI owner-only redirect for receptionist | PASS |
| XSS escaped in HTML | PASS |
| Roman Urdu guide present | PASS (`GUIDE-roman-urdu.md` / README link) |

---

## Findings

| ID | Severity | Title | Repro | Fix request |
|----|----------|-------|-------|-------------|
| **CF-001** | **High** | `GET /api/users` uses `requireUser()` — receptionist reads full staff directory (emails, roles, timestamps) | Login as desk; `GET /api/users` → **200** with all users | Change GET to `requireOwner()`; add test: receptionist → 403 |
| **CF-002** | **High** | `POST /api/users` accepts `role: "owner"` — privilege expansion | Owner POST `{"role":"owner",...}` → **200** creates new owner (`qa-extra-owner2@clinic.local`) | Force `role = "receptionist"` (ignore/reject owner); add API test |
| **CF-003** | **Medium** | Negative `duration_minutes` accepted | Owner POST appointment `duration_minutes: -5` → **200**, stored `-5` | Validate `Number.isFinite(d) && d > 0` (cap e.g. 480); else 400 |
| **CF-004** | **Medium** | Non-numeric `duration_minutes` → 500 | POST `duration_minutes: "abc"` → **500** `Create failed` | Same validation; return 400 not 500 |
| **CF-005** | **Medium** | `csvEscape` misses leading `\t` / `\r` formula vectors | `\t=CMD` not prefixed; `\r=CMD` only quoted | Neutralize if trimmed/untrimmed cell matches `/^[\t\r]*[=+\-@]/` (prefix `'`) |

### Code anchors

- CF-001/002: `src/app/api/users/route.ts` (GET `requireUser`; POST `body.role === "owner" ? "owner" : "receptionist"`)
- CF-003/004: `src/app/api/appointments/route.ts` + `src/lib/appointments.ts` (`Number(body.duration_minutes)` unchecked)
- CF-005: `src/lib/csv.ts`

---

## Gaps vs PRD / brief

- Owner-only team management: **UI** mostly OK; **API GET users** violates owner-only intent (CF-001).
- Owners create receptionists: **API** allows creating owners (CF-002).

---

## Recommendation

**FAIL** — not READY until **CF-001** and **CF-002** are fixed and covered by tests. Then re-verify (R2). Address CF-003–CF-005 before publish.

No product code changes by QA. No GitHub push.
